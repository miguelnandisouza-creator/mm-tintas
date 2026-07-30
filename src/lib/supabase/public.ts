import "server-only";

import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { getSupabasePublicConfig } from "./env";

export function createPublicClient(): SupabaseClient<Database> | null {
  const config = getSupabasePublicConfig();

  if (!config) {
    return null;
  }

  return createSupabaseClient<Database>(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
