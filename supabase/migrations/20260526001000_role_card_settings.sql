create table if not exists public.role_card_settings (
  id uuid primary key default gen_random_uuid(),
  role text not null unique check (role in ('client', 'master')),
  title text not null,
  subtitle text not null,
  description text not null default '',
  features text[] not null default '{}',
  image text,
  colors jsonb not null default '{}'::jsonb,
  gradients jsonb not null default '{}'::jsonb,
  typography jsonb not null default '{}'::jsonb,
  glow jsonb not null default '{}'::jsonb,
  borders jsonb not null default '{}'::jsonb,
  visual jsonb not null default '{}'::jsonb,
  design jsonb not null default '{}'::jsonb,
  button_text text not null default 'Continue',
  enabled boolean not null default true,
  sort_order integer not null default 1,
  show_features boolean not null default true,
  animation_type text not null default 'float',
  card_layout text not null default 'visualTop',
  updated_at timestamptz not null default now()
);

alter table public.role_card_settings enable row level security;

create policy "Role card settings are readable"
  on public.role_card_settings
  for select
  using (true);

create policy "Authenticated admins can manage role card settings"
  on public.role_card_settings
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
