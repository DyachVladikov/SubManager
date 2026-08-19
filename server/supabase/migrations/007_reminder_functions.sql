create or replace function public.get_payment_reminders()
returns table(telegram_id bigint, title text, amount numeric, currency text, next_payment_date date)
language sql
security definer
set search_path = public
as $$
  select p.telegram_id, s.title, s.amount, s.currency, s.next_payment_date
  from public.subscriptions s
  join public.profiles p on p.id = s.user_id
  where p.telegram_id is not null
    and s.next_payment_date between current_date and current_date + 1
  order by p.telegram_id, s.next_payment_date, s.title;
$$;

create or replace function public.get_pending_splits()
returns table(telegram_id bigint, debtor_username text, amount numeric, currency text, subscription_title text)
language sql
security definer
set search_path = public
as $$
  select p.telegram_id, sp.debtor_username, sp.amount, s.currency, s.title
  from public.splits sp
  join public.subscriptions s on s.id = sp.subscription_id
  join public.profiles p on p.id = s.user_id
  where sp.status = 'pending'
    and p.telegram_id is not null
  order by p.telegram_id, sp.debtor_username;
$$;
