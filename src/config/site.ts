function getPublicSiteUrl() {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (candidate) {
    try {
      const url = new URL(candidate);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.toString().replace(/\/$/, "");
      }
    } catch {
      // Fall through to the safe local URL.
    }
  }

  return "https://mm-tintas.vercel.app";
}

export const siteConfig = {
  name: "MM Tintas e Complementos",
  shortName: "MM Tintas",
  description:
    "Tintas, acessórios e complementos para sua obra em Tubarão, Santa Catarina.",
  url: getPublicSiteUrl(),
  locale: "pt_BR",
  city: "Tubarão",
  region: "SC",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5548999627339",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  nav: [
    { label: "Início", href: "/" },
    { label: "Catálogo", href: "/catalogo" },
    { label: "Marcas", href: "/marcas" },
    { label: "Calculadora", href: "/calculadora" },
    { label: "Blog", href: "/blog" },
    { label: "Sobre", href: "/sobre" },
  ],
} as const;
