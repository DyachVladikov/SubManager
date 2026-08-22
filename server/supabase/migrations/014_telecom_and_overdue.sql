insert into public.categories (name, icon_name)
select seed.name, null from (values
  ('Связь')
) as seed(name)
where not exists (select 1 from public.categories c where c.name = seed.name);

create or replace function public.get_overdue_subscriptions()
returns table(telegram_id bigint, title text, amount numeric, currency text, next_payment_date date, days_overdue integer)
language sql
security definer
set search_path = public
as $$
  select p.telegram_id, s.title, s.amount, s.currency, s.next_payment_date,
         (current_date - s.next_payment_date)::integer
  from public.subscriptions s
  join public.profiles p on p.id = s.user_id
  where p.telegram_id is not null
    and s.next_payment_date < current_date
  order by p.telegram_id, s.next_payment_date;
$$;
