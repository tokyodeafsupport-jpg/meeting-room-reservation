-- Repair script for cases where the initial schema was partially applied
-- before the rooms seed and policies were executed.

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

alter table public.users enable row level security;
alter table public.rooms enable row level security;
alter table public.reservations enable row level security;

drop policy if exists "Allow public read users" on public.users;
drop policy if exists "Allow public insert users" on public.users;
drop policy if exists "Allow public update users" on public.users;
drop policy if exists "Allow public delete users" on public.users;
drop policy if exists "Allow public read rooms" on public.rooms;
drop policy if exists "Allow public read reservations" on public.reservations;
drop policy if exists "Allow public insert reservations" on public.reservations;
drop policy if exists "Allow public update reservations" on public.reservations;
drop policy if exists "Allow public delete reservations" on public.reservations;

create policy "Allow public read users"
  on public.users for select
  using (true);

create policy "Allow public insert users"
  on public.users for insert
  with check (true);

create policy "Allow public update users"
  on public.users for update
  using (true)
  with check (true);

create policy "Allow public delete users"
  on public.users for delete
  using (true);

create policy "Allow public read rooms"
  on public.rooms for select
  using (true);

create policy "Allow public read reservations"
  on public.reservations for select
  using (true);

create policy "Allow public insert reservations"
  on public.reservations for insert
  with check (true);

create policy "Allow public update reservations"
  on public.reservations for update
  using (true)
  with check (true);

create policy "Allow public delete reservations"
  on public.reservations for delete
  using (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.users to anon, authenticated;
grant select on public.rooms to anon, authenticated;
grant select, insert, update, delete on public.reservations to anon, authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
        from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'users'
    ) then
      alter publication supabase_realtime add table public.users;
    end if;

    if not exists (
      select 1
        from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'rooms'
    ) then
      alter publication supabase_realtime add table public.rooms;
    end if;

    if not exists (
      select 1
        from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'reservations'
    ) then
      alter publication supabase_realtime add table public.reservations;
    end if;
  end if;
end;
$$;
