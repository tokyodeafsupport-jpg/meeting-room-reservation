insert into public.rooms (name, floor, has_restriction)
values
  ('2階共用室', 2, false),
  ('2階相談室', 2, false),
  ('3階訓練室', 3, true),
  ('3階相談室', 3, true)
on conflict (name) do update
set
  floor = excluded.floor,
  has_restriction = excluded.has_restriction;
