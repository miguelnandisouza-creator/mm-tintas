"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[70svh] items-center">
      <Container className="py-16 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle aria-hidden="true" className="size-6" />
        </span>
        <h1 className="mt-7 text-3xl font-semibold tracking-tight">
          Algo não saiu como esperado
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Tente novamente. Se o problema continuar, fale com nossa equipe.
        </p>
        <Button onClick={reset} size="lg" className="mt-8">
          <RotateCcw aria-hidden="true" />
          Tentar novamente
        </Button>
      </Container>
    </main>
  );
}
