import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgePercent, MessageCircle } from "lucide-react";

import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { CATALOG_DISCLAIMER } from "@/data/catalog";
import { ProductCard } from "@/features/products";
import { getPublicCatalog } from "@/lib/repositories/public-catalog";
import { getPublicSettings } from "@/lib/repositories/public-settings";

export const metadata: Metadata = {
  title: "Promoções e seleções",
  description:
    "Confira seleções de tintas, acessórios e complementos e consulte as condições com a MM Tintas.",
  alternates: {
    canonical: "/promocoes",
  },
  openGraph: {
    title: "Promoções e seleções | MM Tintas",
    description:
      "Seleções para planejar sua pintura e pedir um orçamento personalizado.",
    url: "/promocoes",
    type: "website",
  },
};

export default async function PromotionsPage() {
  const [catalog, settings] = await Promise.all([
    getPublicCatalog(),
    getPublicSettings(),
  ]);
  const activePromotions = catalog.promotions.filter(
    (promotion) => promotion.active,
  );

  return (
    <main className="flex-1">
      <section className="border-b bg-foreground text-background">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-14 sm:px-8 sm:py-18 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-background/15 bg-background/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em]">
              <BadgePercent aria-hidden="true" className="size-4" />
              Seleções da loja
            </span>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              O ponto de partida para sua próxima transformação.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-background/70 sm:text-lg">
              Explore seleções especiais e fale com a equipe para confirmar
              produtos, quantidades e condições vigentes.
            </p>
          </div>
          {settings.whatsappEnabled ? (
            <WhatsAppLink
              message="Olá! Vi as promoções no site da MM Tintas e gostaria de solicitar um orçamento."
              phone={settings.whatsapp}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1a8d61] px-5 text-sm font-semibold text-white outline-none transition hover:bg-[#167650] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
            >
              <MessageCircle aria-hidden="true" className="size-5" />
              Pedir orçamento
            </WhatsAppLink>
          ) : (
            <Link
              href="/contato"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-background px-5 text-sm font-semibold text-foreground outline-none transition hover:bg-background/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
            >
              Pedir orçamento
            </Link>
          )}
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl space-y-16 px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        {activePromotions.map((promotion) => {
          const style = {
            "--promotion-accent": promotion.accent,
          } as CSSProperties;
          const promotionProducts = promotion.productSlugs
            .map((slug) =>
              catalog.products.find((product) => product.slug === slug),
            )
            .filter((product) => product !== undefined);

          return (
            <section
              key={promotion.id}
              style={style}
              aria-labelledby={`${promotion.slug}-title`}
            >
              <div className="relative isolate overflow-hidden rounded-3xl border bg-[color-mix(in_oklch,var(--promotion-accent),white_91%)] p-7 sm:p-9">
                <span
                  aria-hidden="true"
                  className="absolute -right-16 -top-20 -z-10 size-64 rounded-full bg-white/70 blur-3xl"
                />
                <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--promotion-accent)]">
                      {promotion.eyebrow}
                    </p>
                    <h2
                      id={`${promotion.slug}-title`}
                      className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
                    >
                      {promotion.title}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                      {promotion.description}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-card/80 px-5 py-4 shadow-sm backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Destaque
                    </p>
                    <p className="mt-1 font-semibold text-[var(--promotion-accent)]">
                      {promotion.benefit}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {promotionProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showPrice={settings.pricesEnabled}
                  />
                ))}
              </div>

              <Link
                href={`/catalogo?promocao=${promotion.slug}`}
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border bg-card px-4 text-sm font-semibold text-[var(--promotion-accent)] outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                Ver seleção no catálogo
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </section>
          );
        })}

        {activePromotions.length === 0 ? (
          <section className="rounded-3xl border border-dashed bg-muted/35 px-6 py-16 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-card text-primary shadow-sm">
              <BadgePercent aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-5 text-xl font-semibold">
              Novas condições em preparação
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Enquanto isso, envie sua lista para receber um orçamento
              personalizado da equipe.
            </p>
          </section>
        ) : null}

        <p className="rounded-xl bg-muted/55 px-4 py-3 text-xs leading-5 text-muted-foreground">
          {catalog.source === "demo"
            ? `${CATALOG_DISCLAIMER} As condições apresentadas nesta versão não representam ofertas comerciais vigentes.`
            : "Promoções válidas no período indicado e enquanto houver disponibilidade. Consulte os termos e confirme a condição com a equipe."}
        </p>
      </div>
    </main>
  );
}
