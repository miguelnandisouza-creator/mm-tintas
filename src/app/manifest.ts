import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MM Tintas e Complementos",
    short_name: "MM Tintas",
    description:
      "Tintas, acessórios e complementos para sua obra em Tubarão, Santa Catarina.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f5",
    theme_color: "#245aa5",
    lang: "pt-BR",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
