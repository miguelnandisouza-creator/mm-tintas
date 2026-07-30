"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgePercent,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Package,
  Settings,
  Tags,
  X,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type AdminSidebarProps = {
  demoMode: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
};

type SidebarContentProps = {
  demoMode: boolean;
  mobile: boolean;
  onClose: () => void;
  onSignOut: () => Promise<void>;
  pathname: string;
  userEmail?: string | null;
};

const navigation = [
  { label: "Visão geral", href: "/admin", icon: LayoutDashboard },
  { label: "Produtos", href: "/admin/produtos", icon: Package },
  { label: "Marcas", href: "/admin/marcas", icon: Tags },
  { label: "Promoções", href: "/admin/promocoes", icon: BadgePercent },
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
  { label: "Configurações", href: "/admin/configuracoes", icon: Settings },
] as const;

function SidebarContent({
  demoMode,
  mobile,
  onClose,
  onSignOut,
  pathname,
  userEmail,
}: SidebarContentProps) {
  return (
    <>
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <Link
          href="/admin"
          onClick={onClose}
          className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <span className="rounded-xl bg-white px-2 py-1.5">
            <Image
              src="/images/brand/mm-tintas-logo.png"
              alt="MM Tintas e Complementos"
              width={1097}
              height={333}
              priority
              className="h-auto w-32 object-contain"
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold tracking-tight">
              MM Tintas
            </span>
            <span className="block text-[11px] font-medium text-slate-400">
              Central de gestão
            </span>
          </span>
        </Link>

        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto grid size-9 place-items-center rounded-lg text-slate-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </button>
        ) : null}
      </div>

      <nav
        aria-label="Navegação administrativa"
        className="flex-1 space-y-1 overflow-y-auto px-4 py-6"
      >
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Conteúdo
        </p>
        {navigation.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300",
                active
                  ? "bg-white text-[#0c1b32] shadow-lg shadow-black/10"
                  : "text-slate-300 hover:bg-white/8 hover:text-white",
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  "size-[18px]",
                  active
                    ? "text-blue-700"
                    : "text-slate-400 group-hover:text-white",
                )}
              />
              {item.label}
              {active ? (
                <span
                  aria-hidden="true"
                  className="ml-auto size-1.5 rounded-full bg-blue-600"
                />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/6 p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 text-xs font-bold text-[#0c1b32]">
            {demoMode ? "DE" : (userEmail?.slice(0, 2).toUpperCase() ?? "MM")}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold">
              {demoMode ? "Ambiente de demonstração" : "Equipe MM Tintas"}
            </span>
            <span className="block truncate text-[11px] text-slate-400">
              {demoMode ? "Dados locais" : userEmail}
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => void onSignOut()}
          className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <LogOut aria-hidden="true" className="size-4" />
          {demoMode ? "Sair da demonstração" : "Encerrar sessão"}
        </button>
      </div>
    </>
  );
}

export function AdminSidebar({
  demoMode,
  mobileOpen,
  onClose,
  userEmail,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    if (!demoMode) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }

    router.replace("/login");
    router.refresh();
  }

  const sharedProps = {
    demoMode,
    onClose,
    onSignOut: handleSignOut,
    pathname,
    userEmail,
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r border-white/10 bg-[#0c1b32] text-white lg:flex">
        <SidebarContent {...sharedProps} mobile={false} />
      </aside>

      <Sheet
        open={mobileOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-72 max-w-72 gap-0 border-white/10 bg-[#0c1b32] p-0 text-white sm:max-w-72 lg:hidden"
        >
          <SheetTitle className="sr-only">Menu administrativo</SheetTitle>
          <SheetDescription className="sr-only">
            Navegação entre as áreas de gestão da MM Tintas.
          </SheetDescription>
          <SidebarContent {...sharedProps} mobile />
        </SheetContent>
      </Sheet>
    </>
  );
}
