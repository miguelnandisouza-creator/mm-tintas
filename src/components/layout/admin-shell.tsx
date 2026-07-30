"use client";

import { useState, type ReactNode } from "react";

import { AdminHeader } from "@/components/layout/admin-header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

type AdminShellProps = {
  children: ReactNode;
  demoMode: boolean;
  userEmail?: string | null;
};

export function AdminShell({
  children,
  demoMode,
  userEmail,
}: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-950">
      <AdminSidebar
        demoMode={demoMode}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        userEmail={userEmail}
      />

      <div className="lg:pl-72">
        <AdminHeader onMenuOpen={() => setMobileMenuOpen(true)} />

        {demoMode ? (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs font-medium text-amber-950 sm:text-sm">
            Modo demonstração ativo. As alterações ficam salvas somente neste
            navegador.
          </div>
        ) : null}

        <main
          id="conteudo-principal"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1600px] px-4 py-6 outline-none sm:px-6 sm:py-8 xl:px-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
