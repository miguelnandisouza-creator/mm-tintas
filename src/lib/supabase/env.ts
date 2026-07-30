export type SupabasePublicConfig = {
  anonKey: string;
  url: string;
};

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey || !isHttpUrl(url)) {
    return null;
  }

  return { anonKey, url };
}

export function isSupabaseConfigured() {
  return getSupabasePublicConfig() !== null;
}

export function getSupabaseServiceRoleConfig():
  | (SupabasePublicConfig & { serviceRoleKey: string })
  | null {
  const publicConfig = getSupabasePublicConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!publicConfig || !serviceRoleKey) {
    return null;
  }

  return { ...publicConfig, serviceRoleKey };
}
