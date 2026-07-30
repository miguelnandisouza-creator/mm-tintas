import "server-only";

import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

import {
  blogCategories as demoCategories,
  posts as demoPosts,
  type BlogSection,
} from "@/data/blog";
import type {
  PublicBlog,
  PublicBlogCategory,
  PublicBlogPost,
} from "@/features/blog/types";
import { PUBLIC_CACHE_TAGS } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import type { Database } from "@/types/database";

const fallbackBlog: PublicBlog = {
  categories: demoCategories.map((category) => ({ ...category })),
  posts: demoPosts.map((post) => ({
    ...post,
    categorySlugs: [post.categorySlug],
    isDemo: true,
  })),
  source: "demo",
};

const accentPalette = [
  "#315fbd",
  "#b64b31",
  "#197e87",
  "#94743d",
  "#d17b26",
] as const;

function stableAccent(value: string) {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) | 0;
  }

  return accentPalette[Math.abs(hash) % accentPalette.length];
}

function mediaUrl(
  supabase: SupabaseClient<Database>,
  path: string | null | undefined,
) {
  if (!path) {
    return undefined;
  }

  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min de leitura`;
}

function contentToSections(content: string): BlogSection[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const sections: BlogSection[] = [];
  let heading: string | undefined;
  let paragraphs: string[] = [];
  let bullets: string[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    const paragraph = paragraphBuffer.join(" ").trim();
    if (paragraph) {
      paragraphs.push(paragraph);
    }
    paragraphBuffer = [];
  };

  const flushSection = () => {
    flushParagraph();
    if (heading || paragraphs.length || bullets.length) {
      sections.push({
        heading,
        paragraphs,
        bullets: bullets.length ? bullets : undefined,
      });
    }
    heading = undefined;
    paragraphs = [];
    bullets = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (/^#{1,3}\s+/.test(line)) {
      flushSection();
      heading = line.replace(/^#{1,3}\s+/, "");
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      bullets.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }

    if (!line) {
      flushParagraph();
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushSection();

  return sections.length
    ? sections
    : [{ paragraphs: ["Conteúdo em atualização."] }];
}

async function loadBlog(): Promise<PublicBlog> {
  const supabase = createPublicClient();

  if (!supabase) {
    return fallbackBlog;
  }

  const now = new Date().toISOString();
  const [categoriesResult, postsResult, assignmentsResult] = await Promise.all([
    supabase
      .from("post_categories")
      .select("*")
      .order("display_order")
      .order("name"),
    supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .is("deleted_at", null)
      .not("published_at", "is", null)
      .lte("published_at", now)
      .order("published_at", { ascending: false }),
    supabase.from("post_category_assignments").select("*"),
  ]);

  if (
    categoriesResult.error ||
    postsResult.error ||
    assignmentsResult.error
  ) {
    return fallbackBlog;
  }

  const categories: PublicBlogCategory[] = (
    categoriesResult.data ?? []
  ).map((row) => {
    const demo = demoCategories.find(
      (category) => category.slug === row.slug,
    );

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description:
        row.description ??
        demo?.description ??
        "Artigos e orientações da equipe MM Tintas.",
      accent: demo?.accent ?? stableAccent(row.slug),
    };
  });
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const categoryIdsByPost = new Map<string, string[]>();

  for (const assignment of assignmentsResult.data ?? []) {
    const values = categoryIdsByPost.get(assignment.post_id) ?? [];
    values.push(assignment.category_id);
    categoryIdsByPost.set(assignment.post_id, values);
  }

  let needsGeneralCategory = false;
  const posts: PublicBlogPost[] = (postsResult.data ?? []).map(
    (row, index) => {
      const demo = demoPosts.find((post) => post.slug === row.slug);
      const assignedCategories = (categoryIdsByPost.get(row.id) ?? [])
        .map((id) => categoryById.get(id))
        .filter(
          (category): category is PublicBlogCategory => Boolean(category),
        );
      const primaryCategory = assignedCategories[0];
      const categorySlug =
        primaryCategory?.slug ?? demo?.categorySlug ?? "geral";

      if (categorySlug === "geral") {
        needsGeneralCategory = true;
      }

      return {
        slug: row.slug,
        title: row.title,
        description:
          row.excerpt ??
          row.seo_description ??
          demo?.description ??
          "Conteúdo preparado pela equipe MM Tintas para ajudar no planejamento da sua obra.",
        categorySlug,
        publishedAt: row.published_at ?? row.created_at,
        updatedAt: row.updated_at,
        readingTime: readingTime(row.content),
        author: "Equipe MM Tintas",
        featured: demo?.featured ?? index === 0,
        accent:
          demo?.accent ??
          primaryCategory?.accent ??
          stableAccent(row.slug),
        sections: contentToSections(row.content),
        category: primaryCategory,
        categorySlugs: assignedCategories.length
          ? assignedCategories.map((category) => category.slug)
          : [categorySlug],
        coverImageUrl: mediaUrl(supabase, row.cover_image_path),
        isDemo: false,
        seoDescription: row.seo_description ?? undefined,
        seoTitle: row.seo_title ?? undefined,
      };
    },
  );

  if (
    needsGeneralCategory &&
    !categories.some((category) => category.slug === "geral")
  ) {
    categories.push({
      slug: "geral",
      name: "Geral",
      description: "Conteúdos e novidades da MM Tintas.",
      accent: stableAccent("geral"),
    });
  }

  return {
    categories,
    posts,
    source: "supabase",
  };
}

const getCachedBlog = unstable_cache(
  loadBlog,
  ["mm-tintas-public-blog-v1"],
  {
    revalidate: 300,
    tags: [PUBLIC_CACHE_TAGS.blog],
  },
);

export const getPublicBlog = cache(getCachedBlog);

export async function getPublicPostBySlug(slug: string) {
  const blog = await getPublicBlog();
  return blog.posts.find((post) => post.slug === slug);
}

export function getRelatedPublicPosts(
  blog: PublicBlog,
  post: PublicBlogPost,
  limit = 2,
) {
  const sameCategory = blog.posts.filter(
    (candidate) =>
      candidate.slug !== post.slug &&
      candidate.categorySlugs.some((slug) =>
        post.categorySlugs.includes(slug),
      ),
  );
  const others = blog.posts.filter(
    (candidate) =>
      candidate.slug !== post.slug &&
      !sameCategory.some(({ slug }) => slug === candidate.slug),
  );

  return [...sameCategory, ...others].slice(0, limit);
}
