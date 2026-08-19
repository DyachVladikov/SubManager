create table if not exists public.bot_users (
  telegram_id bigint primary key,
  username text,
  first_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bot_users enable row level security;

create or replace function public.track_bot_user(p_telegram_id bigint, p_username text, p_first_name text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.bot_users (telegram_id, username, first_name, updated_at)
  values (p_telegram_id, p_username, p_first_name, now())
  on conflict (telegram_id) do update
    set username = excluded.username,
        first_name = excluded.first_name,
        updated_at = now();
$$;
