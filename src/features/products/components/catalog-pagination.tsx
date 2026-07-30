import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

type CatalogPaginationProps = {
  currentPage: number;
  totalPages: number;
  query: Record<string, string>;
};

function pageHref(page: number, query: Record<string, string>) {
  const params = new URLSearchParams(query);

  if (page > 1) {
    params.set("pagina", String(page));
  } else {
    params.delete("pagina");
  }

  const value = params.toString();
  return value ? `/catalogo?${value}` : "/catalogo";
}

export function CatalogPagination({
  currentPage,
  totalPages,
  query,
}: CatalogPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Paginação do catálogo"
      className="mt-10 flex items-center justify-between gap-4 border-t pt-6"
    >
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1, query)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-card px-4 text-sm font-semibold outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Anterior
        </Link>
      ) : (
        <span />
      )}

      <p className="text-sm text-muted-foreground">
        Página <strong className="text-foreground">{currentPage}</strong> de{" "}
        <strong className="text-foreground">{totalPages}</strong>
      </p>

      {currentPage < totalPages ? (
        <Link
          href={pageHref(currentPage + 1, query)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-card px-4 text-sm font-semibold outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          Próxima
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
