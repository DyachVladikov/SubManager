create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  currency text not null default 'RUB',
  telegram_id bigint unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  icon_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  amount numeric(12,2) not null,
  currency text not null default 'RUB',
  next_payment_date date not null,
  color_hex text,
  period interval,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.splits (
  id uuid primary key default uuid_generate_v4(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  debtor_username text not null,
  amount numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.link_tokens (
  id uuid primary key default uuid_generate_v4(),
  token text not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, currency)
  values (new.id, 'RUB');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.splits enable row level security;
alter table public.link_tokens enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subscriptions"
  on public.subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete own subscriptions"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

create policy "Users can view own splits"
  on public.splits for select
  using (
    exists (
      select 1 from public.subscriptions s
      where s.id = splits.subscription_id and s.user_id = auth.uid()
    )
  );

create policy "Users can insert own splits"
  on public.splits for insert
  with check (
    exists (
      select 1 from public.subscriptions s
      where s.id = splits.subscription_id and s.user_id = auth.uid()
    )
  );

create policy "Users can update own splits"
  on public.splits for update
  using (
    exists (
      select 1 from public.subscriptions s
      where s.id = splits.subscription_id and s.user_id = auth.uid()
    )
  );

create policy "Users can view own link tokens"
  on public.link_tokens for select
  using (auth.uid() = user_id);

create policy "Users can insert own link tokens"
  on public.link_tokens for insert
  with check (auth.uid() = user_id);
