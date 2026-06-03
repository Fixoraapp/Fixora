import { UserRole } from '../types/navigation';
import { getJson, setJson, storage } from '../utils/storage';

export type RegisteredUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  fields: Record<string, string | boolean>;
  createdAt: string;
};

export type AuthSession = {
  userId: string;
  rememberMe: boolean;
  createdAt: string;
};

const USERS_KEY = 'fixora.auth.users.v1';
const SESSION_KEY = 'fixora.auth.session.v1';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const defaultUsers: RegisteredUser[] = [
  {
    id: 'usr-default-admin',
    firstName: 'Admin',
    lastName: 'Fixora',
    email: 'admin@gmail.com',
    phone: '+37400000000',
    password: '638650',
    role: 'company',
    fields: { seeded: true },
    createdAt: '2026-06-03T00:00:00.000Z',
  },
];

const withDefaultUsers = (users: RegisteredUser[]) => {
  const existingEmails = new Set(users.map((user) => normalizeEmail(user.email)));
  const missingDefaults = defaultUsers.filter((user) => !existingEmails.has(normalizeEmail(user.email)));
  return [...missingDefaults, ...users];
};

export const authStorage = {
  async users() {
    const users = await getJson<RegisteredUser[]>(USERS_KEY, []);
    return withDefaultUsers(users);
  },

  async session() {
    return getJson<AuthSession | null>(SESSION_KEY, null);
  },

  async currentUser() {
    const session = await this.session();
    if (!session) return null;
    const users = await this.users();
    return users.find((user) => user.id === session.userId) ?? null;
  },

  async register(input: Omit<RegisteredUser, 'id' | 'createdAt'>, rememberMe = true) {
    const users = await this.users();
    const email = normalizeEmail(input.email);
    if (users.some((user) => normalizeEmail(user.email) === email)) {
      throw new Error('This email is already registered.');
    }

    const nextUser: RegisteredUser = {
      ...input,
      email,
      id: `usr-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    await setJson(USERS_KEY, [nextUser, ...users]);
    await this.setSession(nextUser.id, rememberMe);
    return nextUser;
  },

  async login(email: string, password: string, rememberMe: boolean) {
    const users = await this.users();
    const user = users.find((item) => normalizeEmail(item.email) === normalizeEmail(email));
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password.');
    }
    await this.setSession(user.id, rememberMe);
    return user;
  },

  async setSession(userId: string, rememberMe: boolean) {
    await setJson<AuthSession>(SESSION_KEY, { userId, rememberMe, createdAt: new Date().toISOString() });
  },

  async logout() {
    await storage.removeItem(SESSION_KEY);
  },
};
