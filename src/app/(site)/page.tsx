import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Brush,
  Building2,
  Calculator,
  Check,
  ChevronRight,
  Droplets,
  Hammer,
  MessageCircle,
  PaintRoller,
  ShieldCheck,
  Sparkles,
  SprayCan,
} from "lucide-react";

import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BLOG_DEMO_DISCLAIMER } from "@/data/blog";
import { CATALOG_DISCLAIMER } from "@/data/catalog";
import { getPublicBlog } from "@/lib/repositories/public-blog";
import { getPublicCatalog } from "@/lib/repositories/public-catalog";
import { getPublicSettings } from "@/lib/repositories/public-settings";
import { serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tintas e complementos em Tubarão",
  description:
    "Encontre tintas, acessórios e orientação para sua obra em Tubarão. Fale com a MM Tintas e peça seu orçamento.",
  alternates: { canonical: "/" },
};

const categoryStyles = [
  {
    icon: PaintRoller,
    color: "bg-blue-50 text-blue-700",
  },
  {
    icon: Hammer,
    color: "bg-amber-50 text-amber-800",
  },
  {
    icon: Brush,
    color: "bg-rose-50 text-rose-700",
  },
  {
    icon: SprayCan,
    color: "bg-emerald-50 text-emerald-700",
  },
] as const;

const benefits = [
  {
    title: "Orientação de verdade",
    description:
      "Ajudamos você a escolher o produto adequado para a superfície e o acabamento desejado.",
    icon: MessageCircle,
  },
  {
    title: "Seleção confiável",
    description:
      "Um catálogo pensado para obras, reformas e manutenção profissional.",
    icon: BadgeCheck,
  },
  {
    title: "Atendimento local",
    description:
      "Proximidade e agilidade para clientes, pintores e empresas de Tubarão e região.",
    icon: Building2,
  },
] as const;

const articleIcons = [ShieldCheck, Sparkles, Calculator] as const;

export default async function HomePage() {
  const [catalog, blog, settings] = await Promise.all([
    getPublicCatalog(),
    getPublicBlog(),
    getPublicSettings(),
  ]);
  const homeCategories = catalog.categories.slice(0, 4);
  const homePosts = blog.posts.slice(0, 3);
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: settings.businessName,
    description: settings.description,
    url: settings.siteUrl,
    telephone: settings.phone || settings.whatsapp || undefined,
    email: settings.email || undefined,
    address:
      settings.address || settings.city
        ? {
            "@type": "PostalAddress",
            streetAddress: settings.address || undefined,
            addressLocality: settings.city || undefined,
            addressRegion: settings.state || undefined,
            postalCode: settings.postalCode || undefined,
            addressCountry: "BR",
          }
        : undefined,
    areaServed: settings.city
      ? {
          "@type": "City",
          name: settings.city,
          containedInPlace: settings.state
            ? {
                "@type": "State",
                name: settings.state,
              }
            : undefined,
        }
      : undefined,
  };
  return (
    <main className="flex-1 overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(localBusinessSchema),
        }}
      />

      <section className="relative isolate border-b">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top_left,oklch(0.85_0.08_85_/_0.45),transparent_52%)]"
        />
        <Container className="grid min-h-[calc(100svh-4.5rem)] items-center gap-12 py-14 lg:grid-cols-[0.92fr_1.08fr] lg:py-18">
          <Reveal>
            <Badge variant="secondary" className="mb-6 gap-2 px-3 py-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Atendimento em Tubarão e região
            </Badge>
            <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
              A cor certa começa com a{" "}
              <span className="text-primary">escolha certa.</span>
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
              Tintas, acessórios e orientação próxima para transformar sua obra
              do primeiro preparo ao acabamento.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/catalogo">
                  Explorar catálogo
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                {settings.whatsappEnabled ? (
                  <WhatsAppLink
                    message="Olá! Gostaria de pedir um orçamento para minha obra."
                    phone={settings.whatsapp}
                  >
                    <MessageCircle aria-hidden="true" />
                    Pedir orçamento
                  </WhatsAppLink>
                ) : (
                  <Link href="/contato">
                    <MessageCircle aria-hidden="true" />
                    Solicitar atendimento
                  </Link>
                )}
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {["Atendimento consultivo", "Compra sem complicação", "Equipe local"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="grid size-5 place-items-center rounded-full bg-primary/10 text-primary">
                      <Check aria-hidden="true" className="size-3" />
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </Reveal>

          <Reveal delay={0.12} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-muted shadow-2xl shadow-foreground/10 sm:aspect-[5/4] lg:aspect-[4/5] xl:aspect-[5/4]">
              <Image
                src="/images/hero-pintura.webp"
                alt="Ambiente residencial sendo renovado com pintura"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 56vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/25 bg-white/88 p-4 shadow-lg backdrop-blur-md sm:inset-x-auto sm:left-6 sm:max-w-xs sm:p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  Da ideia ao acabamento
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
                  Conte com orientação para calcular, escolher e aplicar melhor.
                </p>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-10 -z-10 size-40 rounded-full bg-accent blur-3xl"
            />
          </Reveal>
        </Container>
      </section>

      <section className="border-b bg-card">
        <Container className="grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            ["Escolha orientada", "Para cada superfície"],
            ["Atendimento ágil", "No WhatsApp e na loja"],
            ["Experiência local", "Feita para nossa região"],
          ].map(([title, description]) => (
            <div key={title} className="px-2 py-7 first:pl-0 md:px-8">
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </Container>
      </section>

      {homeCategories.length > 0 ? (
        <section className="py-20 sm:py-28">
          <Container>
            <Reveal>
              <SectionHeading
                eyebrow="Encontre o que precisa"
                title="Soluções para cada etapa da sua obra"
                description="Do preparo da superfície ao último detalhe, reunimos as categorias que fazem a diferença no resultado."
              />
            </Reveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {homeCategories.map((category, index) => {
                const style =
                  categoryStyles[index % categoryStyles.length];
                const CategoryIcon = style.icon;

                return (
                  <Reveal key={category.slug} delay={index * 0.06}>
                    <Link
                      href={`/catalogo?categoria=${category.slug}`}
                      className="group flex h-full min-h-64 flex-col rounded-3xl border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl hover:shadow-foreground/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                    >
                      <span
                        className={`grid size-12 place-items-center rounded-2xl ${style.color}`}
                      >
                        <CategoryIcon aria-hidden="true" className="size-5" />
                      </span>
                      <div className="mt-auto pt-10">
                        <h3 className="text-xl font-semibold tracking-tight">
                          {category.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {category.description}
                        </p>
                        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                          Ver produtos
                          <ChevronRight
                            aria-hidden="true"
                            className="size-4 transition-transform group-hover:translate-x-1"
                          />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
            {catalog.source === "demo" ? (
              <p
                role="note"
                className="mt-7 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"
              >
                {CATALOG_DISCLAIMER}
              </p>
            ) : null}
          </Container>
        </section>
      ) : null}

      <section className="bg-foreground py-20 text-background sm:py-28">
        <Container className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">
              Atendimento que resolve
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Mais segurança para decidir. Menos desperdício na obra.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-background/65 sm:text-lg">
              Entender a superfície, a exposição e o acabamento desejado evita
              retrabalho. Nossa equipe ajuda a transformar dúvidas em uma lista
              clara de produtos.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link href="/contato">
                Conversar com a equipe
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {benefits.map((benefit, index) => (
              <Reveal
                key={benefit.title}
                delay={index * 0.07}
                className="rounded-3xl border border-background/10 bg-background/5 p-6"
              >
                <benefit.icon
                  aria-hidden="true"
                  className="size-6 text-accent"
                />
                <h3 className="mt-8 text-lg font-semibold">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-6 text-background/60">
                  {benefit.description}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] border bg-card px-6 py-10 sm:px-10 sm:py-14 lg:px-16">
            <div
              aria-hidden="true"
              className="absolute -right-28 -top-28 size-96 rounded-full bg-primary/10 blur-3xl"
            />
            <div className="relative grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <Reveal>
                <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <Calculator aria-hidden="true" className="size-5" />
                </span>
                <h2 className="mt-7 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                  Descubra quanto de tinta seu ambiente precisa.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
                  Informe as medidas, portas, janelas e número de demãos. Nossa
                  calculadora entrega uma estimativa simples para você começar.
                </p>
                <Button asChild size="lg" className="mt-8">
                  <Link href="/calculadora">
                    Calcular agora
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="mx-auto max-w-sm rounded-3xl border bg-background p-5 shadow-xl shadow-foreground/5">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">
                        Estimativa
                      </p>
                      <p className="mt-1 text-2xl font-bold">2 latas de 18 L</p>
                    </div>
                    <Droplets aria-hidden="true" className="size-8 text-primary" />
                  </div>
                  <div className="mt-5 space-y-3">
                    {["Área líquida", "Número de demãos", "Rendimento"].map(
                      (label, index) => (
                        <div
                          key={label}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-semibold">
                            {["68 m²", "2", "10 m²/L"][index]}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {homePosts.length > 0 ? (
        <section className="border-y bg-card py-20 sm:py-28">
          <Container>
            <Reveal>
            <SectionHeading
              align="center"
                eyebrow="Conteúdo útil"
                title="Boas escolhas começam com informação"
              description="Guias práticos para preparar superfícies, combinar acabamentos e cuidar melhor de cada ambiente."
            />
            {blog.source === "demo" ? (
              <p
                role="note"
                className="mx-auto mt-5 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm leading-6 text-amber-950"
              >
                {BLOG_DEMO_DISCLAIMER}
              </p>
            ) : null}
          </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {homePosts.map((article, index) => {
                const ArticleIcon = articleIcons[index % articleIcons.length];
                const category = blog.categories.find((item) =>
                  article.categorySlugs.includes(item.slug),
                );

                return (
                  <Reveal key={article.slug} delay={index * 0.06}>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="group block h-full rounded-3xl border bg-background p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                    >
                      <span className="grid size-11 place-items-center rounded-2xl bg-muted text-primary">
                        <ArticleIcon aria-hidden="true" className="size-5" />
                      </span>
                      <p className="mt-8 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                        {category?.name ?? "Dicas"}
                      </p>
                      <h3 className="mt-3 text-xl font-semibold tracking-tight">
                        {article.title}
                      </h3>
                      <span className="mt-7 inline-flex items-center gap-1 text-sm font-semibold">
                        Ler artigo
                        <ChevronRight
                          aria-hidden="true"
                          className="size-4 transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="py-20 sm:py-28">
        <Container>
          <Reveal className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground sm:px-12 sm:py-16 lg:px-16">
            <div
              aria-hidden="true"
              className="absolute -right-10 -top-16 size-72 rounded-full border-[3rem] border-white/5"
            />
            <div className="relative max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary-foreground/70">
                Vamos tirar sua obra do papel?
              </p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Conte o que você precisa. A gente ajuda no próximo passo.
              </h2>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" variant="secondary">
                  {settings.whatsappEnabled ? (
                    <WhatsAppLink
                      message="Olá! Quero ajuda para montar meu orçamento de tintas e complementos."
                      phone={settings.whatsapp}
                    >
                      <MessageCircle aria-hidden="true" />
                      Falar pelo WhatsApp
                    </WhatsAppLink>
                  ) : (
                    <Link href="/contato">
                      <MessageCircle aria-hidden="true" />
                      Solicitar atendimento
                    </Link>
                  )}
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/catalogo">Ver catálogo</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
