create extension if not exists "pgcrypto";

create type public.user_role as enum ('client', 'master', 'company', 'admin', 'super_admin');
create type public.order_status as enum ('pending', 'accepted', 'master_on_way', 'in_progress', 'completed', 'cancelled', 'refunded', 'disputed');
create type public.payment_status as enum ('unpaid', 'reserved', 'paid', 'refunded', 'failed');
create type public.verification_status as enum ('pending', 'approved', 'rejected');
create type public.ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  role public.user_role not null default 'client',
  phone text,
  email text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1
    from public.users
    where auth_user_id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$ language sql security definer stable;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  country_iso2 text,
  region_id uuid,
  city_id uuid,
  language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role public.user_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table public.master_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  profession text not null,
  about text,
  categories text[] not null default '{}',
  rating numeric not null default 0,
  completed_orders integer not null default 0,
  verification_status public.verification_status not null default 'pending',
  premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.countries (
  id uuid primary key default gen_random_uuid(),
  name_ru text not null,
  name_en text not null,
  name_hy text not null,
  iso2 text not null unique,
  iso3 text not null,
  emoji text not null default '',
  flag_image text,
  country_photo text,
  currency text not null,
  language text not null,
  capital_ru text not null,
  capital_en text not null,
  is_active boolean not null default true,
  marketplace_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.regions (
  id uuid primary key default gen_random_uuid(),
  country_iso2 text not null references public.countries(iso2) on delete cascade,
  name_ru text not null,
  name_en text not null,
  name_hy text not null,
  type_ru text not null,
  type_en text not null,
  capital_ru text not null,
  capital_en text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references public.regions(id) on delete cascade,
  name_ru text not null,
  name_en text not null,
  name_hy text not null,
  is_active boolean not null default true,
  latitude numeric,
  longitude numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add constraint profiles_country_fk foreign key (country_iso2) references public.countries(iso2);
alter table public.profiles add constraint profiles_region_fk foreign key (region_id) references public.regions(id);
alter table public.profiles add constraint profiles_city_fk foreign key (city_id) references public.cities(id);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name_ru text not null,
  name_en text not null,
  name_hy text not null,
  slug text not null unique,
  icon_url text,
  color text not null default '#157BFF',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  parent_category_id uuid references public.categories(id) on delete set null,
  available_countries text[] not null default '{}',
  available_regions text[] not null default '{}',
  available_cities text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users(id) on delete cascade,
  master_id uuid references public.users(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  city_id uuid references public.cities(id) on delete set null,
  title text not null,
  description text,
  amount numeric not null,
  commission_amount numeric not null default 0,
  master_earnings numeric not null default 0,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  kind text not null default 'text',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  client_id uuid not null references public.users(id) on delete cascade,
  master_id uuid not null references public.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  text text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  balance numeric not null default 0,
  cashback numeric not null default 0,
  pending_payouts numeric not null default 0,
  completed_payouts numeric not null default 0,
  currency text not null default 'AMD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid references public.wallets(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  type text not null,
  amount numeric not null,
  status text not null default 'pending',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  role public.user_role,
  title text not null,
  body text not null,
  category text not null,
  unread boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  subject text not null,
  body text not null,
  status public.ticket_status not null default 'open',
  assigned_admin_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.translations (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  module text not null,
  ru text not null default '',
  en text not null default '',
  hy text not null default '',
  status text not null default 'missing',
  updated_at timestamptz not null default now()
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title_ru text not null,
  title_en text not null,
  title_hy text not null,
  image_url text,
  link text,
  target_country text,
  target_region text,
  target_city text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  master_id uuid not null references public.users(id) on delete cascade,
  passport_url text,
  selfie_url text,
  certificate_urls text[] not null default '{}',
  status public.verification_status not null default 'pending',
  rejection_reason text,
  reviewed_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_client_id_idx on public.orders(client_id);
create index orders_master_id_idx on public.orders(master_id);
create index messages_order_id_idx on public.messages(order_id);
create index notifications_user_id_idx on public.notifications(user_id);
create index categories_slug_idx on public.categories(slug);

create trigger users_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger master_profiles_updated_at before update on public.master_profiles for each row execute function public.set_updated_at();
create trigger countries_updated_at before update on public.countries for each row execute function public.set_updated_at();
create trigger regions_updated_at before update on public.regions for each row execute function public.set_updated_at();
create trigger cities_updated_at before update on public.cities for each row execute function public.set_updated_at();
create trigger categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger wallets_updated_at before update on public.wallets for each row execute function public.set_updated_at();
create trigger support_tickets_updated_at before update on public.support_tickets for each row execute function public.set_updated_at();
create trigger banners_updated_at before update on public.banners for each row execute function public.set_updated_at();
create trigger verification_requests_updated_at before update on public.verification_requests for each row execute function public.set_updated_at();

alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.verification_requests;

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('portfolios', 'portfolios', true),
  ('documents', 'documents', false),
  ('banners', 'banners', true),
  ('categories', 'categories', true),
  ('countries', 'countries', true)
on conflict (id) do nothing;

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.master_profiles enable row level security;
alter table public.orders enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.support_tickets enable row level security;
alter table public.verification_requests enable row level security;
alter table public.categories enable row level security;
alter table public.countries enable row level security;
alter table public.regions enable row level security;
alter table public.cities enable row level security;
alter table public.translations enable row level security;
alter table public.banners enable row level security;

create policy "public read active marketplace dictionaries" on public.categories for select using (is_active = true);
create policy "public read active countries" on public.countries for select using (is_active = true);
create policy "public read active regions" on public.regions for select using (is_active = true);
create policy "public read active cities" on public.cities for select using (is_active = true);
create policy "public read active banners" on public.banners for select using (is_active = true);
create policy "public read translations" on public.translations for select using (true);

create policy "users own row" on public.users for select using (auth.uid() = auth_user_id);
create policy "users insert own row" on public.users for insert with check (auth.uid() = auth_user_id);
create policy "users update own row" on public.users for update using (auth.uid() = auth_user_id);

create policy "profiles own row" on public.profiles for all using (user_id in (select id from public.users where auth_user_id = auth.uid())) with check (user_id in (select id from public.users where auth_user_id = auth.uid()));
create policy "roles own row" on public.roles for select using (user_id in (select id from public.users where auth_user_id = auth.uid()));
create policy "roles insert own row" on public.roles for insert with check (user_id in (select id from public.users where auth_user_id = auth.uid()));
create policy "master profiles readable" on public.master_profiles for select using (true);
create policy "master profiles own write" on public.master_profiles for all using (user_id in (select id from public.users where auth_user_id = auth.uid())) with check (user_id in (select id from public.users where auth_user_id = auth.uid()));

create policy "orders participant read" on public.orders for select using (client_id in (select id from public.users where auth_user_id = auth.uid()) or master_id in (select id from public.users where auth_user_id = auth.uid()));
create policy "orders client insert" on public.orders for insert with check (client_id in (select id from public.users where auth_user_id = auth.uid()));
create policy "orders participant update" on public.orders for update using (client_id in (select id from public.users where auth_user_id = auth.uid()) or master_id in (select id from public.users where auth_user_id = auth.uid()));

create policy "messages participant read" on public.messages for select using (order_id in (select id from public.orders where client_id in (select id from public.users where auth_user_id = auth.uid()) or master_id in (select id from public.users where auth_user_id = auth.uid())));
create policy "messages participant insert" on public.messages for insert with check (sender_id in (select id from public.users where auth_user_id = auth.uid()));

create policy "wallet owner" on public.wallets for all using (user_id in (select id from public.users where auth_user_id = auth.uid())) with check (user_id in (select id from public.users where auth_user_id = auth.uid()));
create policy "transactions wallet owner" on public.transactions for select using (wallet_id in (select id from public.wallets where user_id in (select id from public.users where auth_user_id = auth.uid())));
create policy "notifications recipient" on public.notifications for select using (user_id in (select id from public.users where auth_user_id = auth.uid()) or user_id is null);
create policy "support owner" on public.support_tickets for all using (user_id in (select id from public.users where auth_user_id = auth.uid())) with check (user_id in (select id from public.users where auth_user_id = auth.uid()));
create policy "verification master owner" on public.verification_requests for all using (master_id in (select id from public.users where auth_user_id = auth.uid())) with check (master_id in (select id from public.users where auth_user_id = auth.uid()));

create policy "public media read" on storage.objects for select using (bucket_id in ('avatars', 'portfolios', 'banners', 'categories', 'countries'));
create policy "authenticated media upload" on storage.objects for insert to authenticated with check (bucket_id in ('avatars', 'portfolios', 'documents', 'banners', 'categories', 'countries'));
create policy "authenticated media update" on storage.objects for update to authenticated using (bucket_id in ('avatars', 'portfolios', 'documents', 'banners', 'categories', 'countries'));

create policy "admin manage users" on public.users for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage roles" on public.roles for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage master profiles" on public.master_profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage messages" on public.messages for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage reviews" on public.reviews for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage dictionaries categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage countries" on public.countries for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage regions" on public.regions for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage cities" on public.cities for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage wallets" on public.wallets for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage transactions" on public.transactions for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage notifications" on public.notifications for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage support" on public.support_tickets for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage translations" on public.translations for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage banners" on public.banners for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage verification" on public.verification_requests for all using (public.is_admin()) with check (public.is_admin());
