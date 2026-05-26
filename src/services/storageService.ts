import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type StorageBucket = 'avatars' | 'portfolios' | 'documents' | 'banners' | 'categories' | 'countries';

export const storageBuckets: StorageBucket[] = ['avatars', 'portfolios', 'documents', 'banners', 'categories', 'countries'];

export const storageService = {
  async upload(bucket: StorageBucket, path: string, file: ArrayBuffer | Blob | File, contentType?: string) {
    if (!isSupabaseConfigured) {
      return { path, publicUrl: '' };
    }

    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
      contentType,
    });
    if (error) throw error;

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { path: data.path, publicUrl: publicData.publicUrl };
  },

  async remove(bucket: StorageBucket, paths: string[]) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) throw error;
  },

  publicUrl(bucket: StorageBucket, path: string) {
    if (!isSupabaseConfigured || !path) return '';
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  },
};
