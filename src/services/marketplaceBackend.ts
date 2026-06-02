import { backendService } from './backendService';
import { TableInsert, TableRow } from '../lib/database.types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

async function currentAppUserId() {
  if (!isSupabaseConfigured) return null;
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const authUserId = sessionData.session?.user.id;
  if (!authUserId) return null;
  const { data, error } = await supabase.from('users').select('id').eq('auth_user_id', authUserId).single();
  if (error) throw error;
  return data.id;
}

export const marketplaceBackend = {
  async createOrder(input: TableInsert<'orders'>) {
    return backendService.create('orders', input);
  },

  async createOrderForCurrentUser(input: { title: string; amount: number; cityName?: string }) {
    const clientId = await currentAppUserId();
    if (!clientId) return null;
    const commission = Math.round(input.amount * 0.12);
    return backendService.create('orders', {
      client_id: clientId,
      title: input.title,
      amount: input.amount,
      commission_amount: commission,
      master_earnings: input.amount - commission,
      status: 'pending',
      payment_status: 'reserved',
    });
  },

  async updateOrderStatus(id: string, status: TableRow<'orders'>['status']) {
    return backendService.update('orders', id, { status });
  },

  async sendMessage(input: TableInsert<'messages'>) {
    return backendService.create('messages', input);
  },

  async createReview(input: TableInsert<'reviews'>) {
    return backendService.create('reviews', input);
  },

  async createNotification(input: TableInsert<'notifications'>) {
    return backendService.create('notifications', input);
  },

  async reservePayment(orderId: string) {
    return backendService.update('orders', orderId, { payment_status: 'reserved' });
  },

  async releasePayment(orderId: string) {
    return backendService.update('orders', orderId, { payment_status: 'paid' });
  },

  async refundPayment(orderId: string) {
    return backendService.update('orders', orderId, { payment_status: 'refunded', status: 'refunded' });
  },
};
