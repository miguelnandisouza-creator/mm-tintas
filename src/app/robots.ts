import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getPublicSettings } from "@/lib/repositories/public-settings";

function baseUrl(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return new URL(siteConfig.url).origin;
  }
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getPublicSettings();
  const base = baseUrl(settings.siteUrl);
  const publicAccess = {
    allow: "/",
    disallow: ["/admin", "/admin/", "/login"],
  };

  return {
    rules: [
      {
        userAgent: ["ClaudeBot", "Claude-User", "Claude-SearchBot"],
        ...publicAccess,
      },
      {
        userAgent: "*",
        ...publicAccess,
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
