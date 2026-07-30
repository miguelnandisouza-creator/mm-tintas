"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";

export function MobileNavigation() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(88vw,24rem)] p-6">
        <SheetHeader className="text-left">
          <SheetTitle>MM Tintas</SheetTitle>
          <SheetDescription>Navegue pela nossa plataforma.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Navegação móvel" className="mt-8 grid gap-1">
          {siteConfig.nav.map((item) => (
            <SheetClose asChild key={item.href}>
              <Link
                href={item.href}
                className="rounded-xl px-4 py-3 text-base font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
        <SheetClose asChild>
          <Button asChild size="lg" className="mt-8 w-full">
            <Link href="/contato">Pedir orçamento</Link>
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
