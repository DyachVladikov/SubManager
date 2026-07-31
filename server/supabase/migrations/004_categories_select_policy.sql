create policy "Categories are readable by authenticated users"
  on public.categories for select
  to authenticated
  using (true);
