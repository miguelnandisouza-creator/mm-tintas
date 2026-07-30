import Link from "next/link";
import { Droplets } from "lucide-react";

import { cn } from "@/lib/utils";

type BrandProps = {
  className?: string;
  compact?: boolean;
};

export function Brand({ className, compact = false }: BrandProps) {
  return (
    <Link
      href="/"
      aria-label="MM Tintas — página inicial"
      className={cn(
        "inline-flex items-center gap-3 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        className,
      )}
    >
      <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
        <Droplets aria-hidden="true" className="size-5" />
      </span>
      {!compact ? (
        <span className="leading-none">
          <span className="block text-lg font-extrabold tracking-[-0.035em]">
            MM Tintas
          </span>
          <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            e Complementos
          </span>
        </span>
      ) : null}
    </Link>
  );
}
