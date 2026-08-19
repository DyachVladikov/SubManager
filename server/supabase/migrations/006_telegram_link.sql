alter table public.profiles
  add column if not exists telegram_username text;

create or replace function public.consume_link_token(p_token text, p_telegram_id bigint, p_telegram_username text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  select user_id into v_user_id
  from public.link_tokens
  where token = p_token
    and used_at is null
    and expires_at > now();

  if v_user_id is null then
    return false;
  end if;

  update public.link_tokens set used_at = now() where token = p_token;

  update public.profiles
  set telegram_id = p_telegram_id,
      telegram_username = p_telegram_username
  where id = v_user_id;

  return true;
end;
$$;
