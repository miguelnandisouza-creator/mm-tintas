import type { CSSProperties } from "react";
import Image from "next/image";
import { BookOpenText } from "lucide-react";

import type { PublicBlogPost } from "@/features/blog/types";

export function ArticleHeaderArt({ post }: { post: PublicBlogPost }) {
  const style = { "--post-accent": post.accent } as CSSProperties;

  return (
    <div
      style={style}
      role="img"
      aria-label={`Ilustração abstrata do artigo ${post.title}`}
      className="relative isolate min-h-64 overflow-hidden rounded-3xl border bg-[color-mix(in_oklch,var(--post-accent),white_82%)] sm:min-h-80"
    >
      {post.coverImageUrl ? (
        <Image
          src={post.coverImageUrl}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="absolute inset-0 z-10 size-full object-cover"
        />
      ) : null}
      <span
        aria-hidden="true"
        className="absolute -right-20 -top-20 size-72 rounded-full bg-white/70 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-24 -left-12 size-72 rounded-full bg-[var(--post-accent)] opacity-20 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="absolute right-[14%] top-[18%] size-28 rotate-12 rounded-[2.5rem] border-2 border-[var(--post-accent)] opacity-20"
      />
      <div
        className={
          post.coverImageUrl
            ? "hidden"
            : "absolute inset-0 grid place-items-center"
        }
      >
        <div className="grid size-28 place-items-center rounded-[2rem] border border-white/70 bg-card/75 text-[var(--post-accent)] shadow-xl backdrop-blur sm:size-32">
          <BookOpenText aria-hidden="true" className="size-12" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
