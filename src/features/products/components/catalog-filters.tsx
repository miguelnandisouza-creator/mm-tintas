import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

import type {
  PublicBrand,
  PublicCategory,
} from "@/features/products/types";

export type CatalogFilterValues = {
  busca: string;
  categoria: string;
  marca: string;
};

type CatalogFiltersProps = {
  brands: PublicBrand[];
  categories: PublicCategory[];
  values: CatalogFilterValues;
};

export function CatalogFilters({
  brands,
  categories,
  values,
}: CatalogFiltersProps) {
  const hasFilters = Boolean(values.busca || values.categoria || values.marca);

  return (
    <form
      action="/catalogo"
      role="search"
      className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal aria-hidden="true" className="size-4 text-primary" />
        <h2 className="text-sm font-semibold">Encontre o produto certo</h2>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_minmax(11rem,.55fr)_minmax(11rem,.55fr)_auto]">
        <label className="relative block">
          <span className="sr-only">Buscar no catálogo</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            name="busca"
            defaultValue={values.busca}
            placeholder="Ex.: tinta fosca, rolo, selador..."
            className="h-11 w-full rounded-xl border bg-background pl-10 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>

        <label>
          <span className="sr-only">Filtrar por categoria</span>
          <select
            name="categoria"
            defaultValue={values.categoria}
            className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.shortName}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Filtrar por marca</span>
          <select
            name="marca"
            defaultValue={values.marca}
            className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">Todas as marcas</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground outline-none transition hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Aplicar filtros
        </button>
      </div>

      {hasFilters ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
          <span className="text-xs font-medium text-muted-foreground">
            Filtros ativos
          </span>
          {values.busca ? (
            <span className="rounded-full bg-muted px-3 py-1 text-xs">
              Busca: “{values.busca}”
            </span>
          ) : null}
          {values.categoria ? (
            <span className="rounded-full bg-muted px-3 py-1 text-xs">
              Categoria selecionada
            </span>
          ) : null}
          {values.marca ? (
            <span className="rounded-full bg-muted px-3 py-1 text-xs">
              Marca selecionada
            </span>
          ) : null}
          <Link
            href="/catalogo"
            className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-primary outline-none hover:bg-primary/8 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-3.5" />
            Limpar tudo
          </Link>
        </div>
      ) : null}
    </form>
  );
}
