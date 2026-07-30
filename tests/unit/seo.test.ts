import { describe, expect, it } from "vitest";

import { absoluteSiteUrl, serializeJsonLd } from "@/lib/seo";

describe("SEO helpers", () => {
  it("builds absolute URLs without duplicating slashes", () => {
    expect(
      absoluteSiteUrl("/produtos/tinta-premium", "https://mmtintas.com.br/base"),
    ).toBe("https://mmtintas.com.br/produtos/tinta-premium");
  });

  it("escapes opening angle brackets in structured data", () => {
    const serialized = serializeJsonLd({
      name: "</script><script>alert('xss')</script>",
    });

    expect(serialized).not.toContain("<");
    expect(serialized).toContain("\\u003c/script>");
  });
});
