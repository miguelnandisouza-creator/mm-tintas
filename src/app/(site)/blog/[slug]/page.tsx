import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  MessageCircle,
} from "lucide-react";

import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { BLOG_DEMO_DISCLAIMER } from "@/data/blog";
import { ArticleHeaderArt, BlogCard } from "@/features/blog";
import {
  getPublicBlog,
  getRelatedPublicPosts,
} from "@/lib/repositories/public-blog";
import { getPublicSettings } from "@/lib/repositories/public-settings";
import { absoluteSiteUrl, serializeJsonLd } from "@/lib/seo";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(date));

export async function generateStaticParams() {
  const blog = await getPublicBlog();
  return blog.posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [blog, settings] = await Promise.all([
    getPublicBlog(),
    getPublicSettings(),
  ]);
  const post = blog.posts.find((item) => item.slug === slug);

  if (!post) {
    return {
      title: "Artigo não encontrado",
    };
  }

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.description,
    authors: [{ name: post.author }],
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} | Blog ${settings.businessName}`,
      description: post.seoDescription ?? post.description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: post.coverImageUrl
        ? [{ url: post.coverImageUrl, alt: post.title }]
        : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const [blog, settings] = await Promise.all([
    getPublicBlog(),
    getPublicSettings(),
  ]);
  const post = blog.posts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  const category =
    post.category ??
    blog.categories.find((item) => item.slug === post.categorySlug);
  const relatedPosts = getRelatedPublicPosts(blog, post);
  const siteUrl = absoluteSiteUrl("/", settings.siteUrl);
  const articleUrl = absoluteSiteUrl(`/blog/${post.slug}`, settings.siteUrl);
  const style = { "--post-accent": post.accent } as CSSProperties;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.coverImageUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: articleUrl,
    author: {
      "@type": "Organization",
      name: post.author,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: settings.businessName,
      url: siteUrl,
    },
    articleSection: category?.name,
    inLanguage: "pt-BR",
  };

  return (
    <main style={style} className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(articleJsonLd),
        }}
      />

      <article>
        <header className="border-b bg-muted/25">
          <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
            <Link
              href="/blog"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg pr-2 text-sm font-semibold text-muted-foreground outline-none transition hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Voltar ao blog
            </Link>

            <div className="mt-8 max-w-4xl">
              {blog.source === "demo" ? (
                <p
                  role="note"
                  className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"
                >
                  {BLOG_DEMO_DISCLAIMER}
                </p>
              ) : null}

              <Link
                href={`/blog?categoria=${post.categorySlug}`}
                className="rounded-full bg-[color-mix(in_oklch,var(--post-accent),white_88%)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--post-accent)] outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
              >
                {category?.name}
              </Link>
              <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {post.title}
              </h1>
              <p className="mt-5 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground">
                {post.description}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{post.author}</span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays aria-hidden="true" className="size-4" />
                  <time dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 aria-hidden="true" className="size-4" />
                  {post.readingTime}
                </span>
              </div>
            </div>

            <ArticleHeaderArt post={post} />
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-5xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:py-16">
          <div className="max-w-3xl">
            {post.sections.map((section, index) => (
              <section
                // Position is stable because article sections are ordered editorial content.
                key={`${post.slug}-${index}`}
                className="mb-10"
              >
                {section.heading ? (
                  <h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {section.heading}
                  </h2>
                ) : null}
                <div className="space-y-5">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-base leading-8 text-muted-foreground sm:text-lg"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.bullets ? (
                  <ul className="mt-6 space-y-3 rounded-2xl border bg-card p-5">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-3 text-sm leading-6 text-muted-foreground"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--post-accent)]"
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <div className="mt-12 rounded-3xl bg-foreground p-7 text-background sm:p-9">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-background/60">
                Próximo passo
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                Tire a dúvida antes de começar
              </h2>
              <p className="mt-3 text-sm leading-7 text-background/70">
                Compartilhe medidas, fotos e o objetivo da sua pintura. A equipe
                ajuda a organizar os itens para um orçamento mais claro.
              </p>
              {settings.whatsappEnabled ? (
                <WhatsAppLink
                  message={`Olá! Li o artigo "${post.title}" e gostaria de tirar uma dúvida com a equipe da MM Tintas.`}
                  phone={settings.whatsapp}
                  className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1a8d61] px-5 text-sm font-semibold text-white outline-none transition hover:bg-[#167650] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
                >
                  <MessageCircle aria-hidden="true" className="size-5" />
                  Conversar no WhatsApp
                </WhatsAppLink>
              ) : (
                <Link
                  href="/contato"
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-background px-5 text-sm font-semibold text-foreground outline-none transition hover:bg-background/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
                >
                  Falar com a equipe
                </Link>
              )}
            </div>
          </div>

          <aside className="order-first h-fit rounded-2xl border bg-card p-5 lg:order-none lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground">
              Neste guia
            </p>
            <ol className="mt-4 space-y-3">
              {post.sections.map((section, index) => (
                <li
                  // Position is stable because this mirrors the ordered article content.
                  key={`${post.slug}-summary-${index}`}
                  className="flex gap-2 text-sm leading-5"
                >
                  <span className="font-semibold text-[var(--post-accent)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-muted-foreground">
                    {section.heading ?? "Introdução"}
                  </span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </article>

      {relatedPosts.length > 0 ? (
        <section className="border-t bg-muted/25">
          <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 lg:py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
                  Continue aprendendo
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Próximos guias
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-primary outline-none hover:bg-primary/8 focus-visible:ring-2 focus-visible:ring-ring"
              >
                Ver todos
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
