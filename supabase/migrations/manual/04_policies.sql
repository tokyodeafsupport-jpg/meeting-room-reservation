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
