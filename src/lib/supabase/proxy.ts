import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import type { AppRole, Database } from "@/types/database";

import { getSupabasePublicConfig } from "./env";

export type RefreshedSession = {
  active: boolean;
  configured: boolean;
  response: NextResponse;
  roles: AppRole[];
  user: User | null;
};

export async function refreshSession(
  request: NextRequest,
): Promise<RefreshedSession> {
  const config = getSupabasePublicConfig();
  const response = NextResponse.next({ request });

  if (!config) {
    return {
      active: false,
      configured: false,
      response,
      roles: [],
      user: null,
    };
  }

  const supabase = createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, options, value } of cookiesToSet) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      active: false,
      configured: true,
      response,
      roles: [],
      user: null,
    };
  }

  const [profileResult, rolesResult] = await Promise.all([
    supabase.from("profiles").select("active").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);

  return {
    active: profileResult.data?.active === true,
    configured: true,
    response,
    roles: rolesResult.data?.map(({ role }) => role) ?? [],
    user,
  };
}
