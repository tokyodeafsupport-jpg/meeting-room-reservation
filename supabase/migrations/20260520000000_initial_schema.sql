-- Initial schema for the online meeting room reservation system.
-- Target period: 2026-04-01 through 2035-03-31.

create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text not null,
  color text not null,
  created_at timestamptz not null default now(),

  constraint users_name_not_blank check (length(trim(name)) > 0),
  constraint users_organization_not_blank check (length(trim(organization)) > 0),
  constraint users_color_hex_format check (color ~ '^#[0-9A-Fa-f]{6}$')
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  floor int not null,
  has_restriction boolean not null default false,

  constraint rooms_name_not_blank check (length(trim(name)) > 0),
  constraint rooms_floor_positive check (floor > 0)
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on update cascade on delete restrict,
  user_id uuid not null references public.users(id) on update cascade on delete restrict,
  date date not null,
  start_time time not null,
  end_time time not null,
  purpose text not null,
  created_at timestamptz not null default now(),

  constraint reservations_supported_date_range check (
    date between date '2026-04-01' and date '2035-03-31'
  ),
  constraint reservations_time_range check (
    start_time >= time '08:30'
    and end_time <= time '22:00'
  ),
  constraint reservations_start_before_end check (start_time < end_time),
  constraint reservations_purpose_not_blank check (length(trim(purpose)) > 0),
  constraint reservations_30_minute_start check (
    extract(minute from start_time)::int in (0, 30)
    and extract(second from start_time)::int = 0
  ),
  constraint reservations_30_minute_end check (
    extract(minute from end_time)::int in (0, 30)
    and extract(second from end_time)::int = 0
  ),
  constraint reservations_no_overlap exclude using gist (
    room_id with =,
    (tsrange(date + start_time, date + end_time, '[)')) with &&
  )
);

create index if not exists reservations_date_room_idx
  on public.reservations (date, room_id, start_time);

create index if not exists reservations_user_idx
  on public.reservations (user_id);

create or replace function public.prevent_restricted_room_reservations()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  restricted boolean;
begin
  select has_restriction
    into restricted
    from public.rooms
   where id = new.room_id;

  if restricted
     and extract(isodow from new.date)::int between 1 and 5
     and new.start_time < time '15:00'
     and new.end_time > time '09:00'
  then
    raise exception 'Restricted rooms cannot be reserved on weekdays from 09:00 to 15:00.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger reservations_prevent_restricted_room_reservations
  before insert or update of room_id, date, start_time, end_time
  on public.reservations
  for each row
  execute function public.prevent_restricted_room_reservations();

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
