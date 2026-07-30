"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type AdminLoginFormProps = {
  accessDenied?: boolean;
  configurationMissing?: boolean;
  demoMode: boolean;
};

export function AdminLoginForm({
  accessDenied = false,
  configurationMissing = false,
  demoMode,
}: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (configurationMissing) {
      return;
    }

    if (accessDenied) {
      const supabase = createClient();
      await supabase?.auth.signOut();
      router.replace("/login");
      router.refresh();
      return;
    }

    if (demoMode) {
      router.push("/admin");
      return;
    }

    const supabase = createClient();

    if (!supabase) {
      setError("A autenticação ainda não foi configurada.");
      return;
    }

    if (!email.trim() || password.length < 6) {
      setError("Informe um e-mail válido e uma senha com pelo menos 6 caracteres.");
      return;
    }

    setIsPending(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError("E-mail ou senha incorretos. Verifique os dados e tente novamente.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Não foi possível conectar agora. Tente novamente em instantes.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {demoMode ? (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-5 text-amber-950">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>
            O Supabase ainda não está conectado. Você pode acessar uma versão
            segura de demonstração sem informar credenciais.
          </p>
        </div>
      ) : null}

      {accessDenied ? (
        <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-5 text-red-950">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>
            Peça a um administrador para atribuir um papel à sua conta ou saia
            para entrar com outro usuário.
          </p>
        </div>
      ) : null}

      {configurationMissing ? (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-5 text-amber-950">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>
            Configure as variáveis do Supabase neste ambiente para liberar a
            autenticação e o painel administrativo.
          </p>
        </div>
      ) : null}

      {!demoMode && !accessDenied && !configurationMissing ? (
        <>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-800">
              E-mail
            </span>
            <span className="relative block">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@mmtintas.com.br"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                required
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-800">
              Senha
              <span className="text-xs font-medium text-slate-500">
                Acesso restrito
              </span>
            </span>
            <span className="relative block">
              <LockKeyhole
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Sua senha"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-11 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </span>
          </label>
        </>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="flex gap-2 rounded-xl bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {!configurationMissing ? (
        <button
          type="submit"
          disabled={isPending}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/25 disabled:pointer-events-none disabled:opacity-60"
        >
          {isPending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Entrando…
            </>
          ) : (
            <>
              {accessDenied
                ? "Sair e usar outra conta"
                : demoMode
                  ? "Explorar painel"
                  : "Entrar no painel"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      ) : null}
    </form>
  );
}
