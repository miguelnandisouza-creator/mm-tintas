import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";

import {
  getBlogCategoryBySlug,
} from "@/data/blog";
import type { PublicBlogPost } from "@/features/blog/types";
import { cn } from "@/lib/utils";

type BlogCardProps = {
  post: PublicBlogPost;
  featured?: boolean;
  className?: string;
};

export function BlogCard({
  post,
  featured = false,
  className,
}: BlogCardProps) {
  const category =
    post.category ?? getBlogCategoryBySlug(post.categorySlug);
  const style = { "--post-accent": post.accent } as CSSProperties;

  return (
    <article
      style={style}
      className={cn(
        "group overflow-hidden rounded-2xl border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg",
        featured && "grid md:grid-cols-[.8fr_1.2fr]",
        className,
      )}
    >
      <Link
        href={`/blog/${post.slug}`}
        aria-label={`Ler artigo: ${post.title}`}
        className={cn(
          "relative isolate block min-h-52 overflow-hidden bg-[color-mix(in_oklch,var(--post-accent),white_78%)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          featured && "md:min-h-full",
        )}
      >
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            sizes={featured ? "(max-width: 768px) 100vw, 40vw" : "(max-width: 768px) 100vw, 33vw"}
            className="absolute inset-0 z-10 size-full object-cover"
          />
        ) : null}
        <span
          aria-hidden="true"
          className="absolute -right-16 -top-16 size-56 rounded-full bg-white/65 blur-2xl"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-16 -left-12 size-52 rounded-full bg-[var(--post-accent)] opacity-25 blur-2xl"
        />
        <span
          aria-hidden="true"
          className="absolute left-[18%] top-[22%] size-20 rotate-12 rounded-3xl border border-[var(--post-accent)] opacity-25"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-[16%] right-[18%] size-28 -rotate-12 rounded-full border-[14px] border-white/45"
        />
        <span className="absolute bottom-5 left-5 z-20 rounded-full bg-card/90 px-3 py-1.5 text-xs font-semibold text-[var(--post-accent)] shadow-sm backdrop-blur">
          Guia MM
        </span>
      </Link>

      <div className={cn("flex flex-col p-6", featured && "sm:p-8")}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
          <span className="font-semibold uppercase tracking-[0.12em] text-[var(--post-accent)]">
            {category?.name}
          </span>
          <span className="text-muted-foreground" aria-hidden="true">
            •
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Clock3 aria-hidden="true" className="size-3.5" />
            {post.readingTime}
          </span>
        </div>

        <h2
          className={cn(
            "mt-3 font-semibold leading-tight tracking-tight",
            featured ? "text-2xl sm:text-3xl" : "text-xl",
          )}
        >
          <Link
            href={`/blog/${post.slug}`}
            className="rounded outline-none transition hover:text-[var(--post-accent)] focus-visible:ring-2 focus-visible:ring-ring"
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {post.description}
        </p>

        <div className="mt-auto pt-6">
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg pr-2 text-sm font-semibold text-[var(--post-accent)] outline-none transition hover:gap-3 focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ler artigo
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
