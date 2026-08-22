alter table public.subscriptions
  add column if not exists overdue_notified_for date;

drop function if exists public.get_overdue_subscriptions();

create function public.get_overdue_subscriptions()
returns table(id uuid, telegram_id bigint, title text, amount numeric, currency text, next_payment_date date, days_overdue integer)
language sql
security definer
set search_path = public
as $$
  select s.id, p.telegram_id, s.title, s.amount, s.currency, s.next_payment_date,
         (current_date - s.next_payment_date)::integer
  from public.subscriptions s
  join public.profiles p on p.id = s.user_id
  where p.telegram_id is not null
    and s.next_payment_date < current_date
    and (s.overdue_notified_for is null or s.overdue_notified_for < s.next_payment_date)
  order by p.telegram_id, s.next_payment_date;
$$;

create or replace function public.get_login_email(p_telegram_id bigint)
returns text
language sql
security definer
set search_path = public
as $$
  select u.email::text
  from auth.users u
  join public.profiles p on p.id = u.id
  where p.telegram_id = p_telegram_id
  limit 1;
$$;
