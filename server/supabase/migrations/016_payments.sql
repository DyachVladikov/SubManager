create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  amount numeric(12,2) not null,
  currency text not null default 'RUB',
  paid_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists payments_subscription_idx on public.payments (subscription_id);

alter table public.payments enable row level security;

create policy "Users can read own payments"
  on public.payments for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own payments"
  on public.payments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own payments"
  on public.payments for delete
  to authenticated
  using (auth.uid() = user_id);
