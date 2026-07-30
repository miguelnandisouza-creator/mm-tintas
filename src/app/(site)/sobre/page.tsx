import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  HeartHandshake,
  Lightbulb,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { Container } from "@/components/shared/container";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sobre a MM Tintas",
  description:
    "Conheça a proposta da MM Tintas e Complementos: atendimento próximo, produtos selecionados e orientação para obras em Tubarão e região.",
  alternates: { canonical: "/sobre" },
};

const values = [
  {
    icon: HeartHandshake,
    title: "Proximidade",
    description:
      "Atendimento humano, direto e atento ao contexto de cada cliente.",
  },
  {
    icon: ShieldCheck,
    title: "Confiança",
    description:
      "Indicações responsáveis, com clareza sobre aplicação e rendimento.",
  },
  {
    icon: Lightbulb,
    title: "Solução",
    description:
      "Produtos e complementos pensados para o resultado completo da obra.",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="flex-1">
      <PageHero
        eyebrow="Nossa essência"
        title="Uma empresa familiar, feita para estar perto"
        description="A MM Tintas e Complementos atende quem constrói, reforma e cuida de seus espaços em Tubarão e região, unindo variedade com orientação prática."
      />

      <Container className="py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
              Mais que vender tinta
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Ajudar cada escolha a fazer sentido na obra.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-muted-foreground">
            <p>
              Quem começa uma pintura encontra muitas decisões: tipo de
              superfície, preparação, acabamento, ferramentas e quantidade. A
              nossa proposta é tornar esse caminho mais claro.
            </p>
            <p>
              Atendemos clientes finais e profissionais com a mesma atenção,
              buscando entender a necessidade antes de indicar uma solução.
              Essa proximidade é parte da identidade familiar da MM Tintas.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="rounded-3xl border bg-card p-7">
              <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <value.icon aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-8 text-xl font-semibold">{value.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </Container>

      <section className="border-y bg-card">
        <Container className="grid gap-8 py-14 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <span className="grid size-13 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
            <MapPin aria-hidden="true" className="size-6" />
          </span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Presença local em Tubarão
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Fale com nossa equipe para confirmar endereço, horários e
              disponibilidade antes da visita.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/contato">
              Entrar em contato
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </Container>
      </section>
    </main>
  );
}
