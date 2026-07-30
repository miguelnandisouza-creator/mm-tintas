import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText, SearchX } from "lucide-react";

import { BLOG_DEMO_DISCLAIMER } from "@/data/blog";
import { BlogCard } from "@/features/blog";
import { getPublicBlog } from "@/lib/repositories/public-blog";

export const metadata: Metadata = {
  title: "Blog: guias de pintura e reforma",
  description:
    "Conteúdo original da MM Tintas para planejar sua pintura, preparar superfícies e escolher cores e acabamentos.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog da MM Tintas",
    description:
      "Guias práticos para tomar decisões melhores em pinturas e reformas.",
    url: "/blog",
    type: "website",
  },
};

type BlogSearchParams = Promise<{
  categoria?: string | string[];
}>;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: BlogSearchParams;
}) {
  const query = await searchParams;
  const blog = await getPublicBlog();
  const categorySlug =
    typeof query.categoria === "string" ? query.categoria : "";
  const selectedCategory = blog.categories.find(
    (category) => category.slug === categorySlug,
  );
  const visiblePosts = categorySlug
    ? blog.posts.filter((post) => post.categorySlugs.includes(categorySlug))
    : blog.posts;
  const featuredPost = !categorySlug
    ? visiblePosts.find((post) => post.featured)
    : undefined;
  const remainingPosts = featuredPost
    ? visiblePosts.filter((post) => post.slug !== featuredPost.slug)
    : visiblePosts;

  return (
    <main className="flex-1">
      <section className="relative isolate overflow-hidden border-b bg-muted/35">
        <span
          aria-hidden="true"
          className="absolute -right-24 -top-32 -z-10 size-96 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-14 sm:px-8 sm:py-18 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              <BookOpenText aria-hidden="true" className="size-4" />
              Blog MM Tintas
            </p>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Informação que ajuda sua obra a fluir melhor.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Guias diretos sobre planejamento, preparação e acabamento,
              escritos para transformar dúvidas comuns em decisões mais seguras.
            </p>
          </div>
          <p className="max-w-xs rounded-2xl border bg-card/80 p-4 text-sm leading-6 text-muted-foreground shadow-sm backdrop-blur">
            Conteúdo educativo. Para especificações de produto e problemas
            técnicos, consulte a embalagem e um profissional qualificado.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        {blog.source === "demo" ? (
          <p
            role="note"
            className="mb-7 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"
          >
            {BLOG_DEMO_DISCLAIMER}
          </p>
        ) : null}

        <nav
          aria-label="Categorias do blog"
          className="flex gap-2 overflow-x-auto pb-2"
        >
          <Link
            href="/blog"
            aria-current={!categorySlug ? "page" : undefined}
            className="shrink-0 rounded-full border bg-card px-4 py-2 text-sm font-medium outline-none transition hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
          >
            Todos os artigos
          </Link>
          {blog.categories.map((category) => (
            <Link
              key={category.slug}
              href={`/blog?categoria=${category.slug}`}
              aria-current={
                categorySlug === category.slug ? "page" : undefined
              }
              className="shrink-0 rounded-full border bg-card px-4 py-2 text-sm font-medium outline-none transition hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        {selectedCategory ? (
          <div className="mt-9 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
              Categoria
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              {selectedCategory.name}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {selectedCategory.description}
            </p>
          </div>
        ) : null}

        {visiblePosts.length > 0 ? (
          <div className="mt-9 space-y-8">
            {featuredPost ? (
              <BlogCard post={featuredPost} featured />
            ) : null}
            {remainingPosts.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {remainingPosts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-9 rounded-3xl border border-dashed bg-muted/35 px-6 py-16 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-card text-primary shadow-sm">
              <SearchX aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-5 text-xl font-semibold">
              Ainda não há artigos nesta categoria
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Explore todos os guias publicados ou escolha outra categoria.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground outline-none transition hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Ver todos os artigos
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
