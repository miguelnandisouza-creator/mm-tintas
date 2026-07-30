"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu, Search } from "lucide-react";

type AdminHeaderProps = {
  onMenuOpen: () => void;
};

const routeLabels: Record<string, string> = {
  "/admin": "Visão geral",
  "/admin/produtos": "Produtos",
  "/admin/marcas": "Marcas",
  "/admin/promocoes": "Promoções",
  "/admin/blog": "Blog",
  "/admin/configuracoes": "Configurações",
};

export function AdminHeader({ onMenuOpen }: AdminHeaderProps) {
  const pathname = usePathname();
  const pageLabel = routeLabels[pathname] ?? "Painel";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuOpen}
        className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:hidden"
        aria-label="Abrir menu do painel"
      >
        <Menu className="size-5" />
      </button>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">Administração</p>
        <p className="truncate text-sm font-semibold text-slate-950">
          {pageLabel}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <form action="/catalogo" method="get" className="hidden md:block">
          <label className="relative block">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <span className="sr-only">Buscar no catálogo público</span>
            <input
              type="search"
              name="busca"
              placeholder="Buscar no catálogo"
              className="h-9 w-48 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 xl:w-64"
            />
          </label>
        </form>

        <Link
          href="/"
          target="_blank"
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span className="hidden sm:inline">Ver site</span>
          <ExternalLink className="size-4" />
        </Link>
      </div>
    </header>
  );
}
