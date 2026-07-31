insert into public.categories (name, icon_name)
select * from (values
  ('Видео', 'video'),
  ('Музыка', 'music'),
  ('Нейросети', 'sparkles'),
  ('Облако', 'cloud'),
  ('Игры', 'gamepad'),
  ('Другое', 'dots')
) as seed(name, icon_name)
where not exists (select 1 from public.categories);
