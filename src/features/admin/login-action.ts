"use server";

import { createClient } from "@/lib/supabase/server";

type LoginResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

const ADMIN_USERNAME = "JULIO";
const DEFAULT_ADMIN_EMAIL = "julio@mm-tintas.local";

export async function loginAdmin(
  username: string,
  password: string,
): Promise<LoginResult> {
  const normalizedUsername = username.trim().toLocaleUpperCase("pt-BR");

  if (normalizedUsername !== ADMIN_USERNAME || password.length < 6) {
    return { ok: false, message: "Usuário ou senha incorretos." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return {
      ok: false,
      message: "A autenticação ainda não foi configurada.",
    };
  }

  const email = process.env.ADMIN_LOGIN_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL;
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, message: "Usuário ou senha incorretos." };
  }

  return { ok: true };
}
