import type { CSSProperties } from "react";
import Image from "next/image";
import { PaintBucket } from "lucide-react";

import type { PublicProduct } from "@/features/products/types";
import { cn } from "@/lib/utils";

type ProductVisualProps = {
  product: PublicProduct;
  className?: string;
  compact?: boolean;
};

export function ProductVisual({
  product,
  className,
  compact = false,
}: ProductVisualProps) {
  const style = {
    "--visual-bg": product.visual.background,
    "--visual-fg": product.visual.foreground,
    "--visual-accent": product.visual.accent,
  } as CSSProperties;

  return (
    <div
      role="img"
      aria-label={`Representação ilustrativa de ${product.name}`}
      style={style}
      className={cn(
        "relative isolate overflow-hidden bg-[var(--visual-bg)] text-[var(--visual-fg)]",
        compact ? "aspect-[4/3]" : "min-h-80 sm:min-h-[28rem]",
        className,
      )}
    >
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.imageAlt ?? product.name}
          fill
          sizes={compact ? "(max-width: 640px) 100vw, 33vw" : "(max-width: 1024px) 100vw, 50vw"}
          className="absolute inset-0 z-10 size-full object-contain p-6 sm:p-8"
        />
      ) : null}
      <span
        aria-hidden="true"
        className="absolute -right-12 -top-16 size-48 rounded-full bg-white/45 blur-2xl"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-20 -left-14 size-56 rounded-full bg-[var(--visual-accent)] opacity-25 blur-2xl"
      />
      <span
        aria-hidden="true"
        className="absolute left-[12%] top-[14%] size-4 rounded-full bg-[var(--visual-accent)] opacity-70"
      />
      <span
        aria-hidden="true"
        className="absolute right-[16%] top-[22%] size-7 rounded-full border border-current opacity-20"
      />

      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          product.imageUrl && "hidden",
        )}
      >
        <div
          className={cn(
            "relative flex flex-col items-center justify-center rounded-[2rem] border border-white/60 bg-white/72 shadow-[0_28px_70px_-32px_rgba(15,23,42,0.5)] backdrop-blur-md",
            compact ? "h-[58%] w-[44%]" : "h-64 w-48 sm:h-72 sm:w-56",
          )}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-3 top-3 h-4 rounded-full border border-current/15 bg-white/60"
          />
          <span
            aria-hidden="true"
            className="absolute -top-2 h-6 w-[54%] rounded-full border-[5px] border-[var(--visual-fg)] opacity-35"
          />
          <PaintBucket
            aria-hidden="true"
            className={cn(
              "text-[var(--visual-accent)]",
              compact ? "size-8" : "size-11",
            )}
            strokeWidth={1.7}
          />
          <span
            className={cn(
              "mt-3 max-w-[80%] text-center font-semibold leading-tight tracking-tight",
              compact ? "text-xs" : "text-base",
            )}
          >
            MM Tintas
          </span>
          <span
            className={cn(
              "mt-1 max-w-[75%] text-center uppercase tracking-[0.16em] opacity-65",
              compact ? "text-[0.5rem]" : "text-[0.6rem]",
            )}
          >
            visual ilustrativo
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[18%] rounded-b-[2rem] bg-[var(--visual-accent)]"
          />
        </div>
      </div>
    </div>
  );
}
