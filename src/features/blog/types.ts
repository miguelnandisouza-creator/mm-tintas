import type { BlogCategory, BlogPost } from "@/data/blog";

export type PublicBlogCategory = BlogCategory & {
  id?: string;
};

export type PublicBlogPost = BlogPost & {
  category?: PublicBlogCategory;
  categorySlugs: string[];
  coverImageUrl?: string;
  isDemo: boolean;
  seoDescription?: string;
  seoTitle?: string;
};

export type PublicBlog = {
  categories: PublicBlogCategory[];
  posts: PublicBlogPost[];
  source: "demo" | "supabase";
};
