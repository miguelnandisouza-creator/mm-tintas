import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

import { AdminLoginForm } from "@/features/admin/components/admin-login-form";
import { getAuthContext } from "@/lib/supabase/auth";

export default async function LoginPage() {
  const auth = await getAuthContext();

  if (auth.authenticated && auth.roles.length > 0) {
    redirect("/admin");
  }

  const accessDenied = auth.authenticated && auth.roles.length === 0;
  const demoMode =
    !auth.configured && process.env.NODE_ENV !== "production";
  const configurationMissing = !auth.configured && !demoMode;

  return (
    <div className="relative isolate grid min-h-screen overflow-hidden lg:grid-cols-[1.08fr_0.92fr]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_12%,rgba(37,99,235,0.24),transparent_36%),radial-gradient(circle_at_38%_100%,rgba(8,145,178,0.18),transparent_42%)]"
      />

      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden border-r border-white/10 p-12 text-white lg:flex xl:p-16">
        <div
          aria-hidden="true"
          className="absolute -right-28 top-24 grid rotate-[-8deg] grid-cols-2 gap-4 opacity-90"
        >
          <span className="h-44 w-32 rounded-[2rem] bg-blue-600 shadow-2xl shadow-blue-600/30" />
          <span className="mt-16 h-44 w-32 rounded-[2rem] bg-amber-400 shadow-2xl shadow-amber-400/20" />
          <span className="-mt-10 h-44 w-32 rounded-[2rem] bg-cyan-500 shadow-2xl shadow-cyan-500/20" />
          <span className="mt-6 h-44 w-32 rounded-[2rem] bg-rose-500 shadow-2xl shadow-rose-500/20" />
        </div>

        <Link
          href="/"
          className="relative z-10 inline-flex w-fit items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <span className="relative grid size-11 place-items-center overflow-hidden rounded-xl bg-white text-[#07162c]">
            <span className="absolute -left-2 top-0 h-full w-4 rotate-12 bg-amber-400" />
            <span className="absolute bottom-0 right-0 size-4 rounded-tl-xl bg-blue-600" />
            <span className="relative text-sm font-black">MM</span>
          </span>
          <span>
            <span className="block text-base font-bold">MM Tintas</span>
            <span className="block text-xs text-slate-400">
              Tintas e Complementos
            </span>
          </span>
        </Link>

        <div className="relative z-10 max-w-xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-cyan-100 backdrop-blur">
            <ShieldCheck className="size-4" />
            Ambiente exclusivo para a equipe
          </span>
          <h1 className="max-w-lg text-4xl font-bold leading-[1.1] tracking-[-0.035em] xl:text-5xl">
            Tudo o que a loja precisa, organizado em um só lugar.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            Atualize o catálogo, publique campanhas e acompanhe o conteúdo do
            site com segurança e autonomia.
          </p>

          <ul className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            {[
              "Catálogo sempre atualizado",
              "Promoções em destaque",
              "Conteúdo para o blog",
              "Configurações centralizadas",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-cyan-300" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} MM Tintas e Complementos
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 lg:hidden"
          >
            <ArrowLeft className="size-4" />
            Voltar ao site
          </Link>

          <div className="mb-8 lg:hidden">
            <div className="mb-5 flex items-center gap-3">
              <span className="relative grid size-11 place-items-center overflow-hidden rounded-xl bg-[#0c1b32] text-white">
                <span className="absolute -left-2 top-0 h-full w-4 rotate-12 bg-amber-400" />
                <span className="relative text-sm font-black">MM</span>
              </span>
              <span className="font-bold text-slate-950">MM Tintas</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.35)] sm:p-8">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-blue-700">
                Central de gestão
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Bem-vindo de volta
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {accessDenied
                  ? "Sua conta está ativa, mas ainda não possui um papel administrativo."
                  : configurationMissing
                    ? "O ambiente de produção ainda não possui a conexão de dados necessária."
                    : demoMode
                      ? "Explore o painel com os dados de demonstração."
                      : "Use suas credenciais de acesso para continuar."}
              </p>
            </div>

            <AdminLoginForm
              accessDenied={accessDenied}
              configurationMissing={configurationMissing}
              demoMode={demoMode}
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 text-xs text-slate-500">
            <span>Conexão protegida</span>
            <Link
              href="/"
              className="font-semibold text-slate-700 hover:text-blue-700"
            >
              Voltar ao site
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
