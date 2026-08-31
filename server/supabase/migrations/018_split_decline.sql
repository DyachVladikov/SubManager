alter table public.splits drop constraint if exists splits_status_check;
alter table public.splits add constraint splits_status_check check (status in ('pending', 'paid', 'declined'));

create or replace function public.get_my_split_debts()
returns table(
  split_id uuid,
  subscription_id uuid,
  subscription_title text,
  amount numeric,
  currency text,
  status text,
  owner_username text
)
language sql
security definer
set search_path = public
as $$
  select sp.id, sp.subscription_id, s.title, sp.amount, s.currency, sp.status, p.telegram_username
  from public.splits sp
  join public.subscriptions s on s.id = sp.subscription_id
  join public.profiles p on p.id = s.user_id
  join public.profiles me
    on me.id = auth.uid()
   and me.telegram_username is not null
   and lower(regexp_replace(sp.debtor_username, '^@', '')) = lower(regexp_replace(me.telegram_username, '^@', ''))
  order by sp.created_at desc;
$$;

create or replace function public.set_split_declined(p_split_id uuid, p_declined boolean)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
  v_status text;
begin
  select telegram_username into v_username
  from public.profiles
  where id = auth.uid();

  if v_username is null then
    return 'no_username';
  end if;

  select status into v_status
  from public.splits
  where id = p_split_id
    and lower(regexp_replace(debtor_username, '^@', '')) = lower(regexp_replace(v_username, '^@', ''));

  if v_status is null then
    return 'not_yours';
  end if;

  if v_status = 'paid' then
    return 'already_paid';
  end if;

  update public.splits
  set status = case when p_declined then 'declined' else 'pending' end,
      updated_at = now()
  where id = p_split_id;

  return 'ok';
end;
$$;
