import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Acesso administrativo",
  description: "Área restrita da equipe MM Tintas.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main
      id="conteudo-principal"
      tabIndex={-1}
      className="min-h-screen bg-[#07162c] outline-none"
    >
      {children}
    </main>
  );
}
