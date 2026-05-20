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

drop trigger if exists reservations_prevent_restricted_room_reservations
  on public.reservations;

create trigger reservations_prevent_restricted_room_reservations
  before insert or update of room_id, date, start_time, end_time
  on public.reservations
  for each row
  execute function public.prevent_restricted_room_reservations();
