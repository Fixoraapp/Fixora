export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRoleRecord = 'client' | 'master' | 'company' | 'admin' | 'super_admin';
export type OrderStatusRecord = 'pending' | 'accepted' | 'master_on_way' | 'in_progress' | 'completed' | 'cancelled' | 'refunded' | 'disputed';
export type PaymentStatusRecord = 'unpaid' | 'reserved' | 'paid' | 'refunded' | 'failed';
export type VerificationStatusRecord = 'pending' | 'approved' | 'rejected';
export type TicketStatusRecord = 'open' | 'in_progress' | 'resolved' | 'closed';

export type Database = {
  public: {
    Tables: {
      users: {
        Row: { id: string; auth_user_id: string; role: UserRoleRecord; phone: string | null; email: string | null; status: string; created_at: string; updated_at: string };
        Insert: { id?: string; auth_user_id: string; role: UserRoleRecord; phone?: string | null; email?: string | null; status?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      profiles: {
        Row: { id: string; user_id: string; full_name: string; avatar_url: string | null; country_iso2: string | null; region_id: string | null; city_id: string | null; language: string; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; full_name: string; avatar_url?: string | null; country_iso2?: string | null; region_id?: string | null; city_id?: string | null; language?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      master_profiles: {
        Row: { id: string; user_id: string; profession: string; about: string | null; categories: string[]; rating: number; completed_orders: number; verification_status: VerificationStatusRecord; premium: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; profession: string; about?: string | null; categories?: string[]; rating?: number; completed_orders?: number; verification_status?: VerificationStatusRecord; premium?: boolean; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['master_profiles']['Insert']>;
      };
      roles: {
        Row: { id: string; user_id: string; role: UserRoleRecord; created_at: string };
        Insert: { id?: string; user_id: string; role: UserRoleRecord; created_at?: string };
        Update: Partial<Database['public']['Tables']['roles']['Insert']>;
      };
      orders: {
        Row: { id: string; client_id: string; master_id: string | null; category_id: string | null; city_id: string | null; title: string; description: string | null; amount: number; commission_amount: number; master_earnings: number; status: OrderStatusRecord; payment_status: PaymentStatusRecord; created_at: string; updated_at: string };
        Insert: { id?: string; client_id: string; master_id?: string | null; category_id?: string | null; city_id?: string | null; title: string; description?: string | null; amount: number; commission_amount?: number; master_earnings?: number; status?: OrderStatusRecord; payment_status?: PaymentStatusRecord; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      messages: {
        Row: { id: string; order_id: string; sender_id: string; body: string; kind: string; is_read: boolean; created_at: string };
        Insert: { id?: string; order_id: string; sender_id: string; body: string; kind?: string; is_read?: boolean; created_at?: string };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      reviews: {
        Row: { id: string; order_id: string; client_id: string; master_id: string; rating: number; text: string | null; photo_url: string | null; created_at: string };
        Insert: { id?: string; order_id: string; client_id: string; master_id: string; rating: number; text?: string | null; photo_url?: string | null; created_at?: string };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      categories: {
        Row: { id: string; name_ru: string; name_en: string; name_hy: string; slug: string; icon_url: string | null; color: string; is_active: boolean; sort_order: number; parent_category_id: string | null; available_countries: string[]; available_regions: string[]; available_cities: string[]; created_at: string; updated_at: string };
        Insert: { id?: string; name_ru: string; name_en: string; name_hy: string; slug: string; icon_url?: string | null; color?: string; is_active?: boolean; sort_order?: number; parent_category_id?: string | null; available_countries?: string[]; available_regions?: string[]; available_cities?: string[]; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      countries: {
        Row: { id: string; name_ru: string; name_en: string; name_hy: string; iso2: string; iso3: string; emoji: string; flag_image: string | null; country_photo: string | null; currency: string; language: string; capital_ru: string; capital_en: string; is_active: boolean; marketplace_enabled: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; name_ru: string; name_en: string; name_hy: string; iso2: string; iso3: string; emoji?: string; flag_image?: string | null; country_photo?: string | null; currency: string; language: string; capital_ru: string; capital_en: string; is_active?: boolean; marketplace_enabled?: boolean; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['countries']['Insert']>;
      };
      regions: {
        Row: { id: string; country_iso2: string; name_ru: string; name_en: string; name_hy: string; type_ru: string; type_en: string; capital_ru: string; capital_en: string; is_active: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; country_iso2: string; name_ru: string; name_en: string; name_hy: string; type_ru: string; type_en: string; capital_ru: string; capital_en: string; is_active?: boolean; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['regions']['Insert']>;
      };
      cities: {
        Row: { id: string; region_id: string; name_ru: string; name_en: string; name_hy: string; is_active: boolean; latitude: number | null; longitude: number | null; created_at: string; updated_at: string };
        Insert: { id?: string; region_id: string; name_ru: string; name_en: string; name_hy: string; is_active?: boolean; latitude?: number | null; longitude?: number | null; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['cities']['Insert']>;
      };
      wallets: {
        Row: { id: string; user_id: string; balance: number; cashback: number; pending_payouts: number; completed_payouts: number; currency: string; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; balance?: number; cashback?: number; pending_payouts?: number; completed_payouts?: number; currency?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['wallets']['Insert']>;
      };
      transactions: {
        Row: { id: string; wallet_id: string | null; order_id: string | null; type: string; amount: number; status: string; metadata: Json; created_at: string };
        Insert: { id?: string; wallet_id?: string | null; order_id?: string | null; type: string; amount: number; status?: string; metadata?: Json; created_at?: string };
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
      notifications: {
        Row: { id: string; user_id: string | null; role: UserRoleRecord | null; title: string; body: string; category: string; unread: boolean; created_at: string };
        Insert: { id?: string; user_id?: string | null; role?: UserRoleRecord | null; title: string; body: string; category: string; unread?: boolean; created_at?: string };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      support_tickets: {
        Row: { id: string; user_id: string | null; order_id: string | null; subject: string; body: string; status: TicketStatusRecord; assigned_admin_id: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; user_id?: string | null; order_id?: string | null; subject: string; body: string; status?: TicketStatusRecord; assigned_admin_id?: string | null; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['support_tickets']['Insert']>;
      };
      translations: {
        Row: { id: string; key: string; module: string; ru: string; en: string; hy: string; status: string; updated_at: string };
        Insert: { id?: string; key: string; module: string; ru?: string; en?: string; hy?: string; status?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['translations']['Insert']>;
      };
      banners: {
        Row: { id: string; title_ru: string; title_en: string; title_hy: string; image_url: string | null; link: string | null; target_country: string | null; target_region: string | null; target_city: string | null; starts_at: string | null; ends_at: string | null; is_active: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; title_ru: string; title_en: string; title_hy: string; image_url?: string | null; link?: string | null; target_country?: string | null; target_region?: string | null; target_city?: string | null; starts_at?: string | null; ends_at?: string | null; is_active?: boolean; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['banners']['Insert']>;
      };
      verification_requests: {
        Row: { id: string; master_id: string; passport_url: string | null; selfie_url: string | null; certificate_urls: string[]; status: VerificationStatusRecord; rejection_reason: string | null; reviewed_by: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; master_id: string; passport_url?: string | null; selfie_url?: string | null; certificate_urls?: string[]; status?: VerificationStatusRecord; rejection_reason?: string | null; reviewed_by?: string | null; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['verification_requests']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type TableName = keyof Database['public']['Tables'];
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];
