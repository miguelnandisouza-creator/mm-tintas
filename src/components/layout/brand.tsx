"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

type BrandProps = {
  className?: string;
  compact?: boolean;
};

export function Brand({ className, compact = false }: BrandProps) {
  const router = useRouter();
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (navigationTimer.current) {
        clearTimeout(navigationTimer.current);
      }
    };
  }, []);

  return (
    <Link
      href="/"
      aria-label="MM Tintas — página inicial"
      onClick={(event) => {
        if (event.detail === 0) {
          return;
        }

        event.preventDefault();

        if (event.detail > 1) {
          return;
        }

        navigationTimer.current = setTimeout(() => {
          router.push("/");
          navigationTimer.current = null;
        }, 260);
      }}
      onDoubleClick={(event) => {
        event.preventDefault();

        if (navigationTimer.current) {
          clearTimeout(navigationTimer.current);
          navigationTimer.current = null;
        }

        router.push("/login");
      }}
      className={cn(
        "inline-flex touch-manipulation items-center rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
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
