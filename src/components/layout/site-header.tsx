import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <Container className="flex h-18 items-center justify-between gap-6">
        <Brand />
        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-1 lg:flex"
        >
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild>
            <Link href="/contato">
              Pedir orçamento
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <MobileNavigation />
      </Container>
    </header>
  );
}
