import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * One storage adapter for Web + iOS + Android.
 *
 * IMPORTANT:
 * - Web uses localStorage.
 * - Native uses AsyncStorage.
 * - subscribeStorage() makes Admin Panel changes update the app instantly
 *   inside the same running app/web session.
 *
 * NOTE:
 * localStorage/AsyncStorage is device-local. If you change Admin Panel on web
 * and want the installed phone app to update too, you still need Supabase/backend sync.
 */
type StorageListener = (value: string | null) => void;
const listeners = new Map<string, Set<StorageListener>>();

function notify(key: string, value: string | null) {
  listeners.get(key)?.forEach((listener) => listener(value));
}

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (!event.key) return;
    notify(event.key, event.newValue);
  });
}

export const storage = {
  async getItem(key: string) {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }

    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string) {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      notify(key, value);
      return;
    }

    await AsyncStorage.setItem(key, value);
    notify(key, value);
  },

  async removeItem(key: string) {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      notify(key, null);
      return;
    }

    await AsyncStorage.removeItem(key);
    notify(key, null);
  },
};

export function subscribeStorage(key: string, listener: StorageListener) {
  const bucket = listeners.get(key) ?? new Set<StorageListener>();
  bucket.add(listener);
  listeners.set(key, bucket);

  return () => {
    bucket.delete(listener);
    if (bucket.size === 0) {
      listeners.delete(key);
    }
  };
}

export async function getJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await storage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setJson<T>(key: string, value: T): Promise<void> {
  await storage.setItem(key, JSON.stringify(value));
}
