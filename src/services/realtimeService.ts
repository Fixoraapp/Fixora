import { RealtimeChannel } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { TableRow } from '../lib/database.types';

export const realtimeService = {
  subscribeToOrder(orderId: string, handlers: {
    onMessage?: (message: TableRow<'messages'>) => void;
    onOrderUpdate?: (order: TableRow<'orders'>) => void;
    onTyping?: (payload: { userId: string; typing: boolean }) => void;
    onPresence?: (state: unknown) => void;
  }): RealtimeChannel | null {
    if (!isSupabaseConfigured) return null;

    const channel = supabase.channel(`order:${orderId}`, {
      config: { presence: { key: orderId } },
    });

    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${orderId}` }, (payload) => {
        handlers.onMessage?.(payload.new as TableRow<'messages'>);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, (payload) => {
        handlers.onOrderUpdate?.(payload.new as TableRow<'orders'>);
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        handlers.onTyping?.(payload.payload as { userId: string; typing: boolean });
      })
      .on('presence', { event: 'sync' }, () => {
        handlers.onPresence?.(channel.presenceState());
      })
      .subscribe();

    return channel;
  },

  async sendTyping(channel: RealtimeChannel | null, userId: string, typing: boolean) {
    if (!channel) return;
    await channel.send({ type: 'broadcast', event: 'typing', payload: { userId, typing } });
  },

  async trackOnline(channel: RealtimeChannel | null, userId: string) {
    if (!channel) return;
    await channel.track({ userId, onlineAt: new Date().toISOString() });
  },

  unsubscribe(channel: RealtimeChannel | null) {
    if (channel) supabase.removeChannel(channel);
  },
};
