import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  MessageCircle,
  PackageCheck,
  Paintbrush,
  ShieldCheck,
} from "lucide-react";

import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { CATALOG_DISCLAIMER } from "@/data/catalog";
import { ProductCard, ProductVisual } from "@/features/products";
import {
  getPublicCatalog,
  getRelatedPublicProducts,
} from "@/lib/repositories/public-catalog";
import { getPublicSettings } from "@/lib/repositories/public-settings";
import { absoluteSiteUrl, serializeJsonLd } from "@/lib/seo";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const catalog = await getPublicCatalog();
  return catalog.products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [catalog, settings] = await Promise.all([
    getPublicCatalog(),
    getPublicSettings(),
  ]);
  const product = catalog.products.find((item) => item.slug === slug);

  if (!product) {
    return {
      title: "Produto não encontrado",
    };
  }

  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription,
    alternates: {
      canonical: `/produtos/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | ${settings.businessName}`,
      description: product.seoDescription ?? product.shortDescription,
      url: `/produtos/${product.slug}`,
      type: "website",
      images: product.imageUrl
        ? [{ url: product.imageUrl, alt: product.imageAlt ?? product.name }]
        : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [catalog, settings] = await Promise.all([
    getPublicCatalog(),
    getPublicSettings(),
  ]);
  const product = catalog.products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const brand = product.brand;
  const category = product.categories[0];
  const relatedProducts = getRelatedPublicProducts(catalog, product);
  const productUrl = absoluteSiteUrl(
    `/produtos/${product.slug}`,
    settings.siteUrl,
  );
  const homeUrl = absoluteSiteUrl("/", settings.siteUrl);
  const catalogUrl = absoluteSiteUrl("/catalogo", settings.siteUrl);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.imageUrl,
    sku: product.sku || undefined,
    url: productUrl,
    category: category?.name,
    brand: brand
      ? {
          "@type": "Brand",
          name: brand.name,
        }
      : undefined,
    offers:
      settings.pricesEnabled && typeof product.price === "number"
        ? {
            "@type": "Offer",
            priceCurrency: "BRL",
            price: product.price,
            url: productUrl,
          }
        : undefined,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: homeUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Catálogo",
        item: catalogUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd),
        }}
      />

      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <nav
          aria-label="Navegação estrutural"
          className="flex items-center gap-1.5 overflow-hidden text-sm text-muted-foreground"
        >
          <Link
            href="/catalogo"
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-1 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Catálogo
          </Link>
          <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
          <Link
            href={`/catalogo?categoria=${category?.slug ?? ""}`}
            className="shrink-0 rounded outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            {category?.shortName}
          </Link>
          <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate text-foreground" aria-current="page">
            {product.name}
          </span>
        </nav>

        <section className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-12">
          <ProductVisual
            product={product}
            className="rounded-3xl border shadow-sm"
          />

          <div className="flex flex-col justify-center py-2 lg:py-8">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/catalogo?marca=${brand?.slug ?? ""}`}
                className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary outline-none hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-ring"
              >
                {brand?.name}
              </Link>
              {product.isNew ? (
                <span className="rounded-full border px-3 py-1.5 text-xs font-semibold">
                  Novidade
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              {product.shortDescription}
            </p>

            {settings.pricesEnabled && typeof product.price === "number" ? (
              <div className="mt-6">
                {typeof product.compareAtPrice === "number" &&
                product.compareAtPrice > product.price ? (
                  <p className="text-sm text-muted-foreground line-through">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(product.compareAtPrice)}
                  </p>
                ) : null}
                <p className="text-3xl font-semibold tracking-tight">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(product.price)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Consulte condições e disponibilidade.
                </p>
              </div>
            ) : null}

            <ul className="mt-7 grid gap-3 text-sm sm:grid-cols-2">
              {product.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check aria-hidden="true" className="size-3" />
                  </span>
                  <span className="leading-5">{highlight}</span>
                </li>
              ))}
            </ul>

            {settings.whatsappEnabled ? (
              <WhatsAppLink
                message={`Olá! Encontrei o produto "${product.name}" no site da MM Tintas e gostaria de solicitar um orçamento.`}
                phone={settings.whatsapp}
                className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#157e55] px-5 text-sm font-semibold text-white outline-none transition hover:bg-[#116847] focus-visible:ring-2 focus-visible:ring-[#157e55] focus-visible:ring-offset-2 sm:w-fit"
              >
                <MessageCircle aria-hidden="true" className="size-5" />
                Solicitar orçamento no WhatsApp
              </WhatsAppLink>
            ) : (
              <Link
                href="/contato"
                className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground outline-none transition hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-fit"
              >
                Solicitar orçamento
              </Link>
            )}
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Sem compromisso. Confirme cor, embalagem, aplicação e
              disponibilidade com nossa equipe.
            </p>
          </div>
        </section>

        <section className="mt-14 grid gap-8 border-t pt-12 lg:grid-cols-[1fr_.8fr] lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Sobre o produto
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Uma escolha que começa pela superfície
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border bg-card p-5">
                <Paintbrush aria-hidden="true" className="size-5 text-primary" />
                <h3 className="mt-4 font-semibold">Aplicações</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {product.applications.join(", ")}
                </p>
              </div>
              <div className="rounded-2xl border bg-card p-5">
                <PackageCheck
                  aria-hidden="true"
                  className="size-5 text-primary"
                />
                <h3 className="mt-4 font-semibold">Embalagens</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {product.packages.join(" e ")}
                </p>
              </div>
              <div className="rounded-2xl border bg-card p-5">
                <ShieldCheck
                  aria-hidden="true"
                  className="size-5 text-primary"
                />
                <h3 className="mt-4 font-semibold">Acabamento</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {product.finish ?? "Conforme aplicação"}
                </p>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-3xl bg-foreground p-6 text-background sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-background/65">
              Antes de pintar
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Conte o contexto da sua obra
            </h2>
            <p className="mt-4 text-sm leading-7 text-background/70">
              Leve medidas, fotos da superfície e o resultado que você espera.
              Esses detalhes ajudam a combinar preparação, produto e ferramenta
              de aplicação.
            </p>
            {product.coverage ? (
              <div className="mt-6 rounded-2xl border border-background/15 bg-background/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-background/55">
                  Rendimento
                </p>
                <p className="mt-2 text-sm leading-6">{product.coverage}</p>
              </div>
            ) : null}
          </aside>
        </section>

        {relatedProducts.length > 0 ? (
          <section className="mt-16 border-t pt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
                  Continue explorando
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Produtos relacionados
                </h2>
              </div>
              <Link
                href={`/catalogo?categoria=${product.categorySlug}`}
                className="rounded-lg px-2 py-2 text-sm font-semibold text-primary outline-none hover:bg-primary/8 focus-visible:ring-2 focus-visible:ring-ring"
              >
                Ver toda a categoria
              </Link>
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  showPrice={settings.pricesEnabled}
                />
              ))}
            </div>
          </section>
        ) : null}

        <p className="mt-12 rounded-xl bg-muted/55 px-4 py-3 text-xs leading-5 text-muted-foreground">
          {catalog.source === "demo"
            ? CATALOG_DISCLAIMER
            : "Imagens e cores podem variar conforme a tela. Confirme embalagem, disponibilidade, rendimento e indicação de uso com a equipe."}
        </p>
      </div>
    </main>
  );
}
