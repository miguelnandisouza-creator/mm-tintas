import "server-only";

import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { getSupabaseServiceRoleConfig } from "./env";

export function createAdminClient(): SupabaseClient<Database> | null {
  const config = getSupabaseServiceRoleConfig();

  if (!config) {
    return null;
  }

  return createSupabaseClient<Database>(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
