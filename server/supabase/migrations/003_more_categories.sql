insert into public.categories (name, icon_name)
select seed.name, null from (values
  ('Нейросети'),
  ('Развлечения'),
  ('Музыка'),
  ('Игры'),
  ('Облако'),
  ('Работа и учёба'),
  ('Спорт и здоровье'),
  ('Другое')
) as seed(name)
where not exists (select 1 from public.categories c where c.name = seed.name);
