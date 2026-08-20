create or replace function public.roll_subscriptions_forward()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_date date;
  v_count integer := 0;
begin
  for v_id, v_date in
    select id, next_payment_date from public.subscriptions where next_payment_date < current_date
  loop
    while v_date < current_date loop
      v_date := (v_date + interval '1 month')::date;
    end loop;
    update public.subscriptions set next_payment_date = v_date, updated_at = now() where id = v_id;
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;
