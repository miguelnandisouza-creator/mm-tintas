import type { Metadata, Viewport } from "next";

import { siteConfig } from "@/config/site";
import { getPublicBlog } from "@/lib/repositories/public-blog";
import { getPublicCatalog } from "@/lib/repositories/public-catalog";
import { getPublicSettings } from "@/lib/repositories/public-settings";
import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

function validUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return new URL(siteConfig.url);
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const [catalog, blog, settings] = await Promise.all([
    getPublicCatalog(),
    getPublicBlog(),
    getPublicSettings(),
  ]);
  const title = settings.seoTitle || settings.businessName;
  const description = settings.seoDescription || settings.description;
  const metadataBase = validUrl(settings.siteUrl);
  const hasOnlyDemoContent =
    catalog.source === "demo" || blog.source === "demo";

  return {
    metadataBase,
    title: {
      default: title,
      template: `%s | ${settings.businessName}`,
    },
    description,
    robots: {
      index: !hasOnlyDemoContent,
      follow: !hasOnlyDemoContent,
    },
    applicationName: settings.businessName,
    creator: settings.businessName,
    authors: [{ name: settings.businessName }],
    keywords: [
      "loja de tintas",
      `tintas em ${settings.city || siteConfig.city}`,
      "acessórios para pintura",
      settings.businessName,
    ],
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: metadataBase,
      siteName: settings.businessName,
      title,
      description,
      images: ["/images/hero-pintura.webp"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/hero-pintura.webp"],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f5" },
    { media: "(prefers-color-scheme: dark)", color: "#182333" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#conteudo-principal"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-xl transition-transform focus:translate-y-0"
        >
          Pular para o conteúdo
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
