import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <div
        id="conteudo-principal"
        tabIndex={-1}
        className="flex min-h-[calc(100svh-4.5rem)] flex-col outline-none"
      >
        {children}
      </div>
      <SiteFooter />
      <FloatingWhatsApp />
    </>
  );
}
