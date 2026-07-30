import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/layout/admin-shell";
import { getAuthContext } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: {
    default: "Painel administrativo",
    template: "%s | MM Tintas Admin",
  },
  description: "Gestão de conteúdo da MM Tintas e Complementos.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const auth = await getAuthContext();
  const demoMode = !auth.configured;
  let userEmail: string | null = null;

  if (auth.configured) {
    if (!auth.authenticated) {
      redirect("/login");
    }

    if (auth.roles.length === 0) {
      redirect("/login?reason=forbidden");
    }

    userEmail = auth.user.email ?? null;
  }

  return (
    <AdminShell demoMode={demoMode} userEmail={userEmail}>
      {children}
    </AdminShell>
  );
}
