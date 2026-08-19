drop function if exists public.get_pending_splits();

create or replace function public.get_pending_splits()
returns table(
  split_id uuid,
  debtor_username text,
  debtor_telegram_id bigint,
  owner_telegram_id bigint,
  owner_telegram_username text,
  amount numeric,
  currency text,
  subscription_title text
)
language sql
security definer
set search_path = public
as $$
  select
    sp.id,
    regexp_replace(sp.debtor_username, '^@', ''),
    bu.telegram_id,
    p.telegram_id,
    p.telegram_username,
    sp.amount,
    s.currency,
    s.title
  from public.splits sp
  join public.subscriptions s on s.id = sp.subscription_id
  join public.profiles p on p.id = s.user_id
  left join public.bot_users bu
    on lower(bu.username) = lower(regexp_replace(sp.debtor_username, '^@', ''))
  where sp.status = 'pending'
  order by sp.created_at;
$$;

create or replace function public.pay_split_by_debtor(p_split_id uuid, p_telegram_id bigint)
returns table(
  result text,
  owner_telegram_id bigint,
  debtor_username text,
  amount numeric,
  currency text,
  subscription_title text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
  v_split record;
begin
  select b.username into v_username
  from public.bot_users b
  where b.telegram_id = p_telegram_id;

  select sp.id, sp.status, sp.amount,
         regexp_replace(sp.debtor_username, '^@', '') as split_debtor,
         s.title as sub_title, s.currency as sub_currency, p.telegram_id as owner_tg
  into v_split
  from public.splits sp
  join public.subscriptions s on s.id = sp.subscription_id
  join public.profiles p on p.id = s.user_id
  where sp.id = p_split_id;

  if v_split.id is null then
    return query select 'not_found'::text, null::bigint, null::text, null::numeric, null::text, null::text;
    return;
  end if;

  if v_username is null or lower(v_split.split_debtor) <> lower(v_username) then
    return query select 'not_yours'::text, null::bigint, null::text, null::numeric, null::text, null::text;
    return;
  end if;

  if v_split.status = 'paid' then
    return query select 'already_paid'::text, null::bigint, null::text, null::numeric, null::text, null::text;
    return;
  end if;

  update public.splits set status = 'paid', updated_at = now() where id = p_split_id;

  return query
    select 'ok'::text, v_split.owner_tg, v_split.split_debtor, v_split.amount, v_split.sub_currency, v_split.sub_title;
end;
$$;
