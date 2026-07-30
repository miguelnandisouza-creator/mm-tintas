"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { getSupabasePublicConfig } from "./env";

let browserClient: SupabaseClient<Database> | null | undefined;

export function createClient(): SupabaseClient<Database> | null {
  if (browserClient !== undefined) {
    return browserClient;
  }

  const config = getSupabasePublicConfig();

  if (!config) {
    browserClient = null;
    return browserClient;
  }

  browserClient = createBrowserClient<Database>(config.url, config.anonKey);
  return browserClient;
}
