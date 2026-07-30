import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center">
      <Container className="py-16 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-muted text-primary">
          <SearchX aria-hidden="true" className="size-6" />
        </span>
        <p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-primary">
          Erro 404
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Esta página não foi encontrada
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          O endereço pode ter mudado ou não está mais disponível.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/">
            <ArrowLeft aria-hidden="true" />
            Voltar ao início
          </Link>
        </Button>
      </Container>
    </main>
  );
}
