import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { PageHero } from "@/components/shared/page-hero";
import { PaintCalculator } from "@/features/calculator/paint-calculator";
import { getPublicSettings } from "@/lib/repositories/public-settings";

export const metadata: Metadata = {
  title: "Calculadora de tinta",
  description:
    "Calcule uma estimativa de tinta para seu ambiente considerando medidas, aberturas, rendimento e número de demãos.",
  alternates: { canonical: "/calculadora" },
};

export default async function CalculatorPage() {
  const settings = await getPublicSettings();

  return (
    <main className="flex-1">
      <PageHero
        eyebrow="Planeje melhor"
        title="Calculadora de tinta"
        description="Uma estimativa rápida para você entender a quantidade inicial. Para fechar a compra, confirme a superfície e o produto com nossa equipe."
      />
      <Container className="py-12 sm:py-16">
        <PaintCalculator
          whatsapp={settings.whatsapp}
          whatsappEnabled={settings.whatsappEnabled}
        />
      </Container>
    </main>
  );
}
