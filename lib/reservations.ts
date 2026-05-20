import { supabase } from "@/lib/supabase/client";
import type { Reservation, ReservationInsert, ReservationUpdate } from "@/types/database";

export async function fetchReservations(dateFrom: string, dateTo: string): Promise<Reservation[]> {
  if (!supabase) {
    return [] as Reservation[];
  }

  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createReservation(input: ReservationInsert): Promise<Reservation> {
  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const { data, error } = await supabase.from("reservations").insert(input).select("*").single();

  if (error) {
    throw error;
  }

  return data as Reservation;
}

export async function updateReservation(id: string, input: ReservationUpdate): Promise<Reservation> {
  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const { data, error } = await supabase.from("reservations").update(input).eq("id", id).select("*").single();

  if (error) {
    throw error;
  }

  return data as Reservation;
}

export async function deleteReservation(id: string) {
  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const { error } = await supabase.from("reservations").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
