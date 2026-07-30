import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Boxes, CheckCircle2 } from "lucide-react";

import { CATALOG_DISCLAIMER } from "@/data/catalog";
import { getPublicCatalog } from "@/lib/repositories/public-catalog";

export const metadata: Metadata = {
  title: "Marcas",
  description:
    "Explore as marcas organizadas no catálogo da MM Tintas e encontre produtos por fabricante.",
  alternates: {
    canonical: "/marcas",
  },
  openGraph: {
    title: "Marcas | MM Tintas",
    description:
      "Encontre tintas, acessórios e complementos organizados por marca.",
    url: "/marcas",
    type: "website",
  },
};

export default async function BrandsPage() {
  const catalog = await getPublicCatalog();

  return (
    <main className="flex-1">
      <section className="border-b bg-muted/35">
        <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-18 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Marcas
            </p>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Boas escolhas começam com informação clara.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Navegue por fabricante para comparar categorias. A equipe ajuda a
              confirmar a linha adequada, a disponibilidade e o sistema completo
              para cada superfície.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.brands.map((brand) => {
            const productCount = catalog.products.filter(
              (product) => product.brandSlug === brand.slug,
            ).length;
            const style = { "--brand-accent": brand.accent } as CSSProperties;

            return (
              <article
                key={brand.id}
                style={style}
                className="group flex min-h-72 flex-col overflow-hidden rounded-3xl border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="relative grid size-14 place-items-center overflow-hidden rounded-2xl bg-[color-mix(in_oklch,var(--brand-accent),white_86%)] text-xl font-bold text-[var(--brand-accent)]">
                    {brand.logoUrl ? (
                      <Image
                        src={brand.logoUrl}
                        alt={`Logo ${brand.name}`}
                        fill
                        sizes="56px"
                        className="size-full object-contain p-2"
                      />
                    ) : (
                      brand.name.slice(0, 2).toLocaleUpperCase("pt-BR")
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                    <Boxes aria-hidden="true" className="size-3.5" />
                    {productCount} {productCount === 1 ? "item" : "itens"}
                  </span>
                </div>

                <h2 className="mt-6 text-2xl font-semibold tracking-tight">
                  {brand.name}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {brand.description}
                </p>

                <Link
                  href={`/catalogo?marca=${brand.slug}`}
                  className="mt-auto inline-flex min-h-10 items-center gap-2 self-start rounded-lg pr-2 pt-5 text-sm font-semibold text-[var(--brand-accent)] outline-none transition hover:gap-3 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Ver no catálogo
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </article>
            );
          })}
        </div>

        <aside className="mt-12 grid gap-6 rounded-3xl bg-foreground p-7 text-background sm:p-9 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-background/10">
            <CheckCircle2 aria-hidden="true" className="size-6" />
          </span>
          <div>
            <h2 className="text-xl font-semibold">
              Precisa comparar linhas ou aplicações?
            </h2>
            <p className="mt-2 text-sm leading-6 text-background/70">
              Conte o tipo de superfície e o resultado esperado. Nossa equipe
              ajuda a organizar as opções antes do orçamento.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-background px-5 text-sm font-semibold text-foreground outline-none transition hover:bg-background/90 focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
          >
            Explorar catálogo
          </Link>
        </aside>

        <p className="mt-8 rounded-xl bg-muted/55 px-4 py-3 text-xs leading-5 text-muted-foreground">
          {catalog.source === "demo"
            ? CATALOG_DISCLAIMER
            : "A disponibilidade de marcas e linhas pode variar. Consulte a equipe para confirmar os itens em estoque."}
        </p>
      </section>
    </main>
  );
}
