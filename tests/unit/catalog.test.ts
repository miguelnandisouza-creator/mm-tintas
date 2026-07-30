import { describe, expect, it } from "vitest";

import {
  createWhatsAppQuoteUrl,
  filterProducts,
  getProductBySlug,
} from "../../src/data/catalog";

describe("catálogo demonstrativo", () => {
  it("encontra produtos ignorando acentos e caixa", () => {
    const results = filterProducts({ query: "ACRILICA" });

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((product) => product.name.includes("Acrílica"))).toBe(
      true,
    );
  });

  it("combina filtros de categoria e marca", () => {
    const results = filterProducts({
      category: "tintas-para-parede",
      brand: "suvinil",
    });

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every(
        (product) =>
          product.categorySlug === "tintas-para-parede" &&
          product.brandSlug === "suvinil",
      ),
    ).toBe(true);
  });

  it("resolve slugs válidos e prepara mensagem de orçamento", () => {
    const product = getProductBySlug("tinta-acrilica-premium-fosca");

    expect(product?.name).toBe("Tinta Acrílica Premium Fosca");
    expect(createWhatsAppQuoteUrl(product?.name)).toContain(
      encodeURIComponent(product?.name ?? ""),
    );
  });
});
