import type { Metadata } from "next";
import { Clock3, MapPin, MessageCircle } from "lucide-react";

import { Container } from "@/components/shared/container";
import { PageHero } from "@/components/shared/page-hero";
import { Card, CardContent } from "@/components/ui/card";
import { QuoteForm } from "@/features/quotes/quote-form";
import { getPublicSettings } from "@/lib/repositories/public-settings";

export const metadata: Metadata = {
  title: "Contato e orçamento",
  description:
    "Fale com a MM Tintas em Tubarão e solicite orientação ou orçamento para sua obra.",
  alternates: { canonical: "/contato" },
};

export default async function ContactPage() {
  const settings = await getPublicSettings();
  const location = [settings.address, settings.neighborhood, settings.city, settings.state]
    .filter(Boolean)
    .join(", ");
  const openingHours = [
    settings.weekdayHours && `Segunda a sexta: ${settings.weekdayHours}`,
    settings.saturdayHours && `Sábado: ${settings.saturdayHours}`,
    settings.sundayHours && `Domingo: ${settings.sundayHours}`,
  ]
    .filter(Boolean)
    .join(" · ");
  const contactItems = [
    {
      icon: MessageCircle,
      title: "Atendimento pelo WhatsApp",
      description:
        settings.whatsapp || settings.phone
          ? [settings.whatsapp || settings.phone, settings.email]
              .filter(Boolean)
              .join(" · ")
          : "Envie os detalhes da sua necessidade e nossa equipe continua a conversa.",
    },
    {
      icon: MapPin,
      title: `Estamos em ${settings.city}, ${settings.state}`,
      description:
        location ||
        "Atendimento local para clientes, pintores, empresas e condomínios da região.",
    },
    {
      icon: Clock3,
      title: "Horários comerciais",
      description:
        openingHours ||
        "Confirme o horário de atendimento pelo WhatsApp antes da sua visita.",
    },
  ] as const;

  return (
    <main className="flex-1">
      <PageHero
        eyebrow="Fale com a gente"
        title="Seu orçamento começa aqui"
        description={
          settings.whatsappEnabled
            ? "Conte o que você está construindo, reformando ou renovando. Organizamos sua solicitação e continuamos o atendimento pelo WhatsApp."
            : "Conte o que você está construindo, reformando ou renovando. Os canais oficiais de atendimento serão exibidos assim que forem configurados."
        }
      />
      <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid content-start gap-4">
          {contactItems.map((item) => (
            <Card key={item.title} className="rounded-2xl">
              <CardContent className="flex gap-4 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="rounded-3xl">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              Solicitar atendimento
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Quanto mais contexto você enviar, mais objetiva será nossa
              orientação.
            </p>
            <div className="mt-7">
              {settings.whatsappEnabled ? (
                <QuoteForm whatsapp={settings.whatsapp} />
              ) : (
                <p
                  role="status"
                  className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"
                >
                  O número oficial do WhatsApp ainda não foi configurado.
                  {settings.email
                    ? ` Enquanto isso, entre em contato por ${settings.email}.`
                    : " Volte em breve para solicitar atendimento por aqui."}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
