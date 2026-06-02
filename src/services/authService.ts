import { Session, User } from '@supabase/supabase-js';
import { AuthMethod, UserRole } from '../types/navigation';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { UserRoleRecord } from '../lib/database.types';

export type AuthProfileInput = {
  role: UserRole;
  authMethod: AuthMethod;
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  profession?: string;
  serviceCategory?: string;
};

export type AuthResult = {
  user: User | null;
  session: Session | null;
  offlineMode: boolean;
};

const mapRole = (role: UserRole): UserRoleRecord => (role === 'master' ? 'master' : 'client');

async function ensureProfile(authUser: User, input: AuthProfileInput) {
  const role = mapRole(input.role);
  const { data: appUser, error: userError } = await supabase
    .from('users')
    .upsert(
      {
        auth_user_id: authUser.id,
        role,
        email: input.email ?? authUser.email ?? null,
        phone: input.phone ?? authUser.phone ?? null,
        status: 'active',
      },
      { onConflict: 'auth_user_id' },
    )
    .select('id')
    .single();

  if (userError) throw userError;
  if (!appUser) throw new Error('Unable to create app user profile.');

  await supabase.from('roles').upsert({ user_id: appUser.id, role }, { onConflict: 'user_id,role' });
  await supabase.from('profiles').upsert(
    {
      user_id: appUser.id,
      full_name: input.fullName || input.email || input.phone || 'Fixora User',
      language: 'en',
    },
    { onConflict: 'user_id' },
  );

  if (input.role === 'master') {
    await supabase.from('master_profiles').upsert(
      {
        user_id: appUser.id,
        profession: input.profession || input.serviceCategory || 'Fixora Master',
        categories: input.serviceCategory ? [input.serviceCategory] : [],
        verification_status: 'pending',
      },
      { onConflict: 'user_id' },
    );
  }

  await supabase.from('wallets').upsert({ user_id: appUser.id, currency: 'AMD' }, { onConflict: 'user_id' });
}

function offlineAuth(): AuthResult {
  return { user: null, session: null, offlineMode: true };
}

export const authService = {
  async getSession(): Promise<AuthResult> {
    if (!isSupabaseConfigured) return offlineAuth();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { user: data.session?.user ?? null, session: data.session, offlineMode: false };
  },

  async signUpWithEmail(input: AuthProfileInput & { password: string }): Promise<AuthResult> {
    if (!isSupabaseConfigured) return offlineAuth();
    if (!input.email) throw new Error('Email is required for email registration.');
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          role: input.role,
          full_name: input.fullName,
          phone: input.phone,
          city: input.city,
        },
      },
    });
    if (error) throw error;
    if (data.user) await ensureProfile(data.user, input);
    return { user: data.user, session: data.session, offlineMode: false };
  },

  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) return offlineAuth();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { user: data.user, session: data.session, offlineMode: false };
  },

  async signInWithPhone(phone: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) return offlineAuth();
    const { data, error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
    return { user: data.user, session: data.session, offlineMode: false };
  },

  async verifyPhoneOtp(phone: string, token: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) return offlineAuth();
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) throw error;
    return { user: data.user, session: data.session, offlineMode: false };
  },

  async signInWithOAuth(provider: 'google' | 'apple'): Promise<AuthResult> {
    if (!isSupabaseConfigured) return offlineAuth();
    const { data, error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) throw error;
    return { user: null, session: null, offlineMode: false };
  },

  async signOut() {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
