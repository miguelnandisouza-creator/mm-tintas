import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getPublicBlog } from "@/lib/repositories/public-blog";
import { getPublicCatalog } from "@/lib/repositories/public-catalog";
import { getPublicSettings } from "@/lib/repositories/public-settings";

function baseUrl(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return new URL(siteConfig.url).origin;
  }
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const [catalog, blog, settings] = await Promise.all([
    getPublicCatalog(),
    getPublicBlog(),
    getPublicSettings(),
  ]);
  const base = baseUrl(settings.siteUrl);
  const hasOnlyDemoContent =
    catalog.source === "demo" || blog.source === "demo";

  return {
    rules: [
      {
        userAgent: "*",
        allow: hasOnlyDemoContent ? undefined : "/",
        disallow: hasOnlyDemoContent
          ? "/"
          : ["/admin", "/admin/", "/login"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
