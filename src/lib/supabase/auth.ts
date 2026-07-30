import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { AppRole, Database, Tables } from "@/types/database";

import { createClient } from "./server";

export type AuthFailureCode =
  | "CONFIGURATION"
  | "UNAUTHENTICATED"
  | "FORBIDDEN";

export class SupabaseAuthError extends Error {
  constructor(
    public readonly code: AuthFailureCode,
    message: string,
  ) {
    super(message);
    this.name = "SupabaseAuthError";
  }
}

export type AuthContext = {
  profile: Tables<"profiles">;
  roles: AppRole[];
  supabase: SupabaseClient<Database>;
  user: User;
};

export type OptionalAuthContext =
  | { authenticated: false; configured: false }
  | { authenticated: false; configured: true }
  | ({ authenticated: true; configured: true } & AuthContext);

export async function getAuthContext(): Promise<OptionalAuthContext> {
  const supabase = await createClient();

  if (!supabase) {
    return { authenticated: false, configured: false };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { authenticated: false, configured: true };
  }

  const [profileResult, rolesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);

  if (
    profileResult.error ||
    rolesResult.error ||
    !profileResult.data ||
    !profileResult.data.active
  ) {
    return { authenticated: false, configured: true };
  }

  return {
    authenticated: true,
    configured: true,
    profile: profileResult.data,
    roles: rolesResult.data.map(({ role }) => role),
    supabase,
    user,
  };
}

export async function requireUser(): Promise<AuthContext> {
  const context = await getAuthContext();

  if (!context.configured) {
    throw new SupabaseAuthError(
      "CONFIGURATION",
      "O Supabase ainda não foi configurado neste ambiente.",
    );
  }

  if (!context.authenticated) {
    throw new SupabaseAuthError(
      "UNAUTHENTICATED",
      "Sua sessão expirou. Entre novamente para continuar.",
    );
  }

  return context;
}

export async function requireRole(
  allowedRoles: readonly AppRole[],
): Promise<AuthContext> {
  const context = await requireUser();

  if (!context.roles.some((role) => allowedRoles.includes(role))) {
    throw new SupabaseAuthError(
      "FORBIDDEN",
      "Você não tem permissão para realizar esta operação.",
    );
  }

  return context;
}
