import { supabase } from "@/lib/supabase/client";
import type { User, UserInsert, UserUpdate } from "@/types/database";

export async function fetchUsers() {
  if (!supabase) {
    return [] as User[];
  }

  const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createUser(input: UserInsert) {
  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const { data, error } = await supabase.from("users").insert(input).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUser(id: string, input: UserUpdate) {
  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const { data, error } = await supabase.from("users").update(input).eq("id", id).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteUser(id: string) {
  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const { error } = await supabase.from("users").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
