import Link from "next/link";
import { ArrowUpRight, BadgePercent, Sparkles } from "lucide-react";

import type { PublicProduct } from "@/features/products/types";
import { cn } from "@/lib/utils";

import { ProductVisual } from "./product-visual";

type ProductCardProps = {
  product: PublicProduct;
  className?: string;
  showPrice?: boolean;
};

export function ProductCard({
  product,
  className,
  showPrice = false,
}: ProductCardProps) {
  const brand = product.brand;
  const category = product.categories[0];
  const formattedPrice =
    typeof product.price === "number"
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(product.price)
      : null;

  return (
    <article
      className={cn(
        "group flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg",
        className,
      )}
    >
      <Link
        href={`/produtos/${product.slug}`}
        className="relative block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <ProductVisual
          product={product}
          compact
          className="transition duration-500 group-hover:scale-[1.025]"
        />
        <span className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.isNew ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-card-foreground shadow-sm backdrop-blur">
              <Sparkles aria-hidden="true" className="size-3" />
              Novidade
            </span>
          ) : null}
          {product.promotionSlug ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-primary-foreground shadow-sm">
              <BadgePercent aria-hidden="true" className="size-3" />
              Seleção
            </span>
          ) : null}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {brand?.name}
        </p>
        <h2 className="mt-2 text-lg font-semibold leading-snug tracking-tight">
          <Link
            href={`/produtos/${product.slug}`}
            className="rounded-sm outline-none after:absolute hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            {product.name}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {product.shortDescription}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <div className="min-w-0">
            {showPrice && formattedPrice ? (
              <p className="font-semibold tracking-tight">{formattedPrice}</p>
            ) : null}
            <span className="block truncate text-xs text-muted-foreground">
              {category?.shortName ?? "Outros"}
            </span>
          </div>
          <Link
            href={`/produtos/${product.slug}`}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-primary outline-none transition hover:bg-primary/8 focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ver produto
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
