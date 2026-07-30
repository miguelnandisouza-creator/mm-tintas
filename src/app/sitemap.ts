import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getPublicBlog } from "@/lib/repositories/public-blog";
import { getPublicCatalog } from "@/lib/repositories/public-catalog";
import { getPublicSettings } from "@/lib/repositories/public-settings";

const staticRoutes = [
  "",
  "/catalogo",
  "/marcas",
  "/promocoes",
  "/calculadora",
  "/blog",
  "/sobre",
  "/contato",
  "/privacidade",
] as const;

function baseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return new URL(siteConfig.url);
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalog, blog, settings] = await Promise.all([
    getPublicCatalog(),
    getPublicBlog(),
    getPublicSettings(),
  ]);
  const base = baseUrl(settings.siteUrl);
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: new URL(route || "/", base).toString(),
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/catalogo" ? 0.9 : 0.7,
  }));
  const productEntries: MetadataRoute.Sitemap = (
    catalog.source === "demo" ? [] : catalog.products
  ).map(
    (product) => ({
      url: new URL(`/produtos/${product.slug}`, base).toString(),
      lastModified: product.publishedAt
        ? new Date(product.publishedAt)
        : now,
      changeFrequency: "monthly",
      priority: 0.8,
    }),
  );
  const postEntries: MetadataRoute.Sitemap = (
    blog.source === "demo" ? [] : blog.posts
  ).map((post) => ({
    url: new URL(`/blog/${post.slug}`, base).toString(),
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries, ...postEntries];
}
