import { ROOM_SORT_ORDER } from "@/lib/constants";
import { supabase } from "@/lib/supabase/client";
import type { Room } from "@/types/database";

export async function fetchRooms(): Promise<Room[]> {
  if (!supabase) {
    return [] as Room[];
  }

  const { data, error } = await supabase.from("rooms").select("*");

  if (error) {
    throw error;
  }

  return (data ?? []).sort((a, b) => ROOM_SORT_ORDER.indexOf(a.name) - ROOM_SORT_ORDER.indexOf(b.name));
}
