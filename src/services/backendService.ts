import { RealtimeChannel } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { TableInsert, TableName, TableRow, TableUpdate } from '../lib/database.types';

export type BackendMode = 'supabase' | 'offline';

export const backendService = {
  mode(): BackendMode {
    return isSupabaseConfigured ? 'supabase' : 'offline';
  },

  async list<T extends TableName>(table: T, orderBy = 'created_at'): Promise<TableRow<T>[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending: false });
    if (error) throw error;
    return (data ?? []) as TableRow<T>[];
  },

  async create<T extends TableName>(table: T, values: TableInsert<T>): Promise<TableRow<T>> {
    const { data, error } = await supabase.from(table).insert(values).select('*').single();
    if (error) throw error;
    return data as TableRow<T>;
  },

  async update<T extends TableName>(table: T, id: string, values: TableUpdate<T>): Promise<TableRow<T>> {
    const { data, error } = await supabase.from(table).update(values).eq('id', id).select('*').single();
    if (error) throw error;
    return data as TableRow<T>;
  },

  async remove<T extends TableName>(table: T, id: string): Promise<void> {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  subscribe<T extends TableName>(
    table: T,
    onChange: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: TableRow<T> | null; old: Partial<TableRow<T>> | null }) => void,
    filter?: string,
  ): RealtimeChannel | null {
    if (!isSupabaseConfigured) return null;
    return supabase
      .channel(`public:${table}${filter ? `:${filter}` : ''}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, ...(filter ? { filter } : {}) },
        (payload) => onChange({ eventType: payload.eventType, new: payload.new as TableRow<T> | null, old: payload.old as Partial<TableRow<T>> | null }),
      )
      .subscribe();
  },

  unsubscribe(channel: RealtimeChannel | null) {
    if (channel) supabase.removeChannel(channel);
  },
};
