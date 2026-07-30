import Link from "next/link";
import { Camera, MapPin, MessageCircle } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { Container } from "@/components/shared/container";
import { getPublicSettings } from "@/lib/repositories/public-settings";

const footerGroups = [
  {
    title: "Comprar",
    links: [
      { label: "Catálogo", href: "/catalogo" },
      { label: "Promoções", href: "/promocoes" },
      { label: "Marcas", href: "/marcas" },
      { label: "Calculadora", href: "/calculadora" },
    ],
  },
  {
    title: "MM Tintas",
    links: [
      { label: "Sobre nós", href: "/sobre" },
      { label: "Blog", href: "/blog" },
      { label: "Contato", href: "/contato" },
      { label: "Área administrativa", href: "/admin" },
    ],
  },
] as const;

export async function SiteFooter() {
  const settings = await getPublicSettings();

  return (
    <footer className="border-t bg-card">
      <Container className="grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr] lg:py-18">
        <div>
          <Brand />
          <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">
            {settings.description}
          </p>
          <div className="mt-6 flex items-center gap-2">
            {settings.instagram ? (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="grid size-10 place-items-center rounded-xl border transition-colors hover:bg-muted"
              >
                <Camera aria-hidden="true" className="size-4" />
              </a>
            ) : null}
            <Link
              href="/contato"
              aria-label="Falar pelo WhatsApp"
              className="grid size-10 place-items-center rounded-xl border transition-colors hover:bg-muted"
            >
              <MessageCircle aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
        {footerGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-bold">{group.title}</h2>
            <ul className="mt-4 space-y-3">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t">
        <Container className="flex flex-col gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} MM Tintas e Complementos. Todos os
            direitos reservados.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/privacidade" className="hover:text-foreground">
              Privacidade
            </Link>
            <p className="flex items-center gap-1.5">
              <MapPin aria-hidden="true" className="size-3.5" />
              {settings.city}, {settings.state}
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
