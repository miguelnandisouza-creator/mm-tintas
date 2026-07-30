import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { PageHero } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Saiba como a MM Tintas trata dados enviados nos canais digitais.",
  alternates: { canonical: "/privacidade" },
  robots: { index: true, follow: true },
};

const sections = [
  {
    title: "Dados enviados por você",
    content:
      "Podemos receber nome, telefone, e-mail, cidade, bairro e informações sobre sua solicitação quando você utiliza o formulário de orçamento. Com seu consentimento, esses dados podem ser registrados na plataforma antes de a conversa continuar no WhatsApp, permitindo que a equipe acompanhe e responda ao pedido.",
  },
  {
    title: "Finalidades",
    content:
      "As informações são usadas para responder dúvidas, preparar orçamentos, prestar atendimento e manter a segurança dos canais. Não comercializamos dados pessoais.",
  },
  {
    title: "Serviços de terceiros",
    content:
      "WhatsApp, hospedagem, banco de dados e ferramentas de medição podem tratar informações segundo seus próprios termos. Recursos opcionais de análise só devem ser ativados após a configuração adequada de consentimento.",
  },
  {
    title: "Retenção e segurança",
    content:
      "As solicitações ficam acessíveis apenas a usuários autorizados e devem ser mantidas pelo período necessário ao atendimento, à elaboração do orçamento e ao cumprimento de obrigações comerciais ou legais. Depois disso, devem ser eliminadas ou anonimizadas conforme a rotina definida pela empresa.",
  },
  {
    title: "Seus direitos",
    content:
      "Você pode solicitar confirmação de tratamento, acesso, correção ou eliminação de dados, quando aplicável. Utilize o canal de contato oficial divulgado no site.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <main className="flex-1">
      <PageHero
        eyebrow="Transparência"
        title="Política de privacidade"
        description="Um resumo claro de como os canais digitais da MM Tintas devem tratar informações pessoais."
      />
      <Container className="max-w-4xl py-14 sm:py-20">
        <p className="text-sm text-muted-foreground">
          Última atualização: 30 de julho de 2026.
        </p>
        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-semibold tracking-tight">
                {section.title}
              </h2>
              <p className="mt-3 text-base leading-8 text-muted-foreground">
                {section.content}
              </p>
            </section>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border bg-card p-6 text-sm leading-6 text-muted-foreground">
          Antes da publicação, esta política deve ser revisada com os dados
          oficiais da empresa, fornecedores efetivamente habilitados e prazos de
          retenção adotados na operação.
        </div>
      </Container>
    </main>
  );
}
