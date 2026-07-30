import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch, Paintbrush, ShieldCheck } from "lucide-react";

import {
  CATALOG_DISCLAIMER,
} from "@/data/catalog";
import {
  CatalogFilters,
  CatalogPagination,
  ProductCard,
} from "@/features/products";
import {
  filterPublicProducts,
  getPublicCatalog,
} from "@/lib/repositories/public-catalog";
import { getPublicSettings } from "@/lib/repositories/public-settings";

export const metadata: Metadata = {
  title: "Catálogo de tintas e complementos",
  description:
    "Explore tintas, impermeabilizantes, ferramentas e complementos. Filtre o catálogo e solicite um orçamento à MM Tintas em Tubarão.",
  alternates: {
    canonical: "/catalogo",
  },
  openGraph: {
    title: "Catálogo | MM Tintas",
    description:
      "Encontre produtos para pintura, preparação, proteção e acabamento.",
    url: "/catalogo",
    type: "website",
  },
};

type CatalogSearchParams = Promise<{
  busca?: string | string[];
  categoria?: string | string[];
  marca?: string | string[];
  promocao?: string | string[];
  pagina?: string | string[];
}>;

const pageSize = 6;

function getStringParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: CatalogSearchParams;
}) {
  const query = await searchParams;
  const [catalog, settings] = await Promise.all([
    getPublicCatalog(),
    getPublicSettings(),
  ]);
  const busca = getStringParam(query.busca);
  const categoria = getStringParam(query.categoria);
  const marca = getStringParam(query.marca);
  const promocao = getStringParam(query.promocao);
  const requestedPage = Number.parseInt(getStringParam(query.pagina), 10);
  const allResults = filterPublicProducts(catalog, {
    query: busca,
    category: categoria,
    brand: marca,
    promotion: promocao,
  });
  const totalPages = Math.max(1, Math.ceil(allResults.length / pageSize));
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const visibleProducts = allResults.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const selectedCategory = catalog.categories.find(
    (category) => category.slug === categoria,
  );
  const selectedBrand = catalog.brands.find((brand) => brand.slug === marca);
  const selectedPromotion = catalog.promotions.find(
    (promotion) => promotion.slug === promocao,
  );

  const paginationQuery = Object.fromEntries(
    Object.entries({
      busca,
      categoria,
      marca,
      promocao,
    }).filter((entry): entry is [string, string] => Boolean(entry[1])),
  );

  return (
    <main className="flex-1">
      <section className="border-b bg-[linear-gradient(140deg,var(--background)_20%,color-mix(in_oklch,var(--primary),white_92%))]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-14 sm:px-8 sm:py-18 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Catálogo MM Tintas
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Tudo para sua pintura, do preparo ao acabamento.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              Compare categorias, encontre a solução para cada etapa e fale com
              quem entende para montar um orçamento adequado à sua obra.
            </p>
          </div>

          <div className="grid max-w-sm grid-cols-2 gap-3">
            <div className="rounded-2xl border bg-card/80 p-4 shadow-sm backdrop-blur">
              <Paintbrush aria-hidden="true" className="size-5 text-primary" />
              <strong className="mt-3 block text-2xl">{allResults.length}</strong>
              <span className="text-xs text-muted-foreground">
                itens encontrados
              </span>
            </div>
            <div className="rounded-2xl border bg-card/80 p-4 shadow-sm backdrop-blur">
              <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
              <strong className="mt-3 block text-2xl">1:1</strong>
              <span className="text-xs text-muted-foreground">
                orientação humana
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <CatalogFilters
          brands={catalog.brands}
          categories={catalog.categories}
          values={{
            busca,
            categoria,
            marca,
          }}
        />

        <nav
          aria-label="Categorias do catálogo"
          className="mt-5 flex gap-2 overflow-x-auto pb-2"
        >
          <Link
            href="/catalogo"
            aria-current={!categoria ? "page" : undefined}
            className="shrink-0 rounded-full border bg-card px-4 py-2 text-sm font-medium outline-none transition hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
          >
            Todas
          </Link>
          {catalog.categories.map((category) => (
            <Link
              key={category.id}
              href={`/catalogo?categoria=${category.slug}`}
              aria-current={
                categoria === category.slug ? "page" : undefined
              }
              className="shrink-0 rounded-full border bg-card px-4 py-2 text-sm font-medium outline-none transition hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
            >
              {category.shortName}
            </Link>
          ))}
        </nav>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">
              {selectedPromotion?.eyebrow ??
                selectedCategory?.name ??
                selectedBrand?.name ??
                "Seleção completa"}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              {selectedPromotion?.title ??
                (allResults.length === 1
                  ? "1 produto encontrado"
                  : `${allResults.length} produtos encontrados`)}
            </h2>
          </div>
          {currentPage > 1 ? (
            <p className="text-sm text-muted-foreground">
              Exibindo a página {currentPage}
            </p>
          ) : null}
        </div>

        {visibleProducts.length > 0 ? (
          <>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showPrice={settings.pricesEnabled}
                />
              ))}
            </div>
            <CatalogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              query={paginationQuery}
            />
          </>
        ) : (
          <div className="mt-7 rounded-3xl border border-dashed bg-muted/35 px-6 py-16 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-card text-primary shadow-sm">
              <PackageSearch aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-5 text-xl font-semibold">
              Nenhum produto com esses filtros
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Tente uma busca mais ampla ou limpe os filtros para explorar todas
              as categorias.
            </p>
            <Link
              href="/catalogo"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground outline-none transition hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Ver catálogo completo
            </Link>
          </div>
        )}

        <p className="mt-10 rounded-xl bg-muted/55 px-4 py-3 text-xs leading-5 text-muted-foreground">
          {catalog.source === "demo"
            ? CATALOG_DISCLAIMER
            : "Imagens e cores podem variar conforme a tela. Confirme embalagem, disponibilidade e indicação de uso com a equipe."}
        </p>
      </section>
    </main>
  );
}
