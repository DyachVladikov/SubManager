alter table public.subscriptions
  add column if not exists remind_before_days integer not null default 1;

drop function if exists public.get_payment_reminders();

create function public.get_payment_reminders()
returns table(telegram_id bigint, title text, amount numeric, currency text, next_payment_date date, days_left integer)
language sql
security definer
set search_path = public
as $$
  select p.telegram_id, s.title, s.amount, s.currency, s.next_payment_date,
         (s.next_payment_date - current_date)::integer
  from public.subscriptions s
  join public.profiles p on p.id = s.user_id
  where p.telegram_id is not null
    and (
      s.next_payment_date = current_date
      or (s.remind_before_days > 0 and s.next_payment_date - current_date = s.remind_before_days)
    )
  order by p.telegram_id, s.next_payment_date, s.title;
$$;
