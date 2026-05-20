import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const fallbackSupabaseUrl = "https://maitlagzelyaetvvgimd.supabase.co";
const fallbackSupabaseAnonKey = "sb_publishable_7fty2gPqUdDUI1Fl3Cs48g_TLosjVYc";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackSupabaseUrl;
const configuredSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseAnonKey =
  configuredSupabaseAnonKey && configuredSupabaseAnonKey !== "sb_publishable_..."
    ? configuredSupabaseAnonKey
    : fallbackSupabaseAnonKey;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;
