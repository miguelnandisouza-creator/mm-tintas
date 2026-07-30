import Image from "next/image";
import Link from "next/link";

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
        "inline-flex items-center rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        className,
      )}
    >
      <Image
        src="/images/brand/mm-tintas-logo.png"
        alt="MM Tintas e Complementos"
        width={1097}
        height={333}
        priority
        className={cn(
          "h-auto object-contain",
          compact ? "w-12 object-left" : "w-40 sm:w-44",
        )}
      />
    </Link>
  );
}
