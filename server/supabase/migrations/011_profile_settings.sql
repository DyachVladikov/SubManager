alter table public.profiles
  add column if not exists theme text not null default 'dark',
  add column if not exists notify_charge_day boolean not null default true,
  add column if not exists notify_charge_before boolean not null default true,
  add column if not exists notify_splits boolean not null default true,
  add column if not exists notify_payments_received boolean not null default true,
  add column if not exists notify_weekly_digest boolean not null default true,
  add column if not exists notify_news boolean not null default true;
