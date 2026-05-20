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
