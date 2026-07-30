import "server-only";

import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

import {
  brands as demoBrands,
  categories as demoCategories,
  filterProducts as filterDemoProducts,
  products as demoProducts,
  promotions as demoPromotions,
  type CatalogFilters,
} from "@/data/catalog";
import type {
  PublicBrand,
  PublicCatalog,
  PublicCategory,
  PublicProduct,
  PublicPromotion,
} from "@/features/products/types";
import { PUBLIC_CACHE_TAGS } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import type { Database, Tables } from "@/types/database";

const fallbackCatalog: PublicCatalog = {
  brands: demoBrands.map((brand) => ({ ...brand })),
  categories: demoCategories.map((category) => ({ ...category })),
  products: demoProducts.map((product) => ({
    ...product,
    brand: demoBrands.find((brand) => brand.slug === product.brandSlug),
    categories: demoCategories.filter(
      (category) => category.slug === product.categorySlug,
    ),
    categorySlugs: [product.categorySlug],
    isDemo: true,
  })),
  promotions: demoPromotions.map((promotion) => ({
    ...promotion,
    isDemo: true,
  })),
  source: "demo",
};

const accentPalette = [
  "#315fbd",
  "#b64b31",
  "#94743d",
  "#197e87",
  "#d17b26",
  "#657144",
] as const;

const visualPalette = [
  { background: "#dce6fa", foreground: "#18315f", accent: "#527dcc" },
  { background: "#f7dfdc", foreground: "#66281f", accent: "#cc604c" },
  { background: "#eee5d8", foreground: "#514436", accent: "#a17f50" },
  { background: "#d7efea", foreground: "#164d43", accent: "#2f927c" },
  { background: "#fae3ce", foreground: "#623a1e", accent: "#dc7a31" },
  { background: "#e7eadb", foreground: "#3e492b", accent: "#78864f" },
] as const;

function stableIndex(value: string, length: number) {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) | 0;
  }

  return Math.abs(hash) % length;
}

function accentFor(value: string) {
  return accentPalette[stableIndex(value, accentPalette.length)];
}

function visualFor(value: string) {
  return visualPalette[stableIndex(value, visualPalette.length)];
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

function splitValues(value: string | null, fallback: string[] = []) {
  if (!value?.trim()) {
    return fallback;
  }

  const values = value
    .split(/\r?\n|[,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  return values.length ? values : fallback;
}

function discountLabel(promotion: Tables<"promotions">) {
  if (promotion.discount_value === null) {
    return promotion.badge ?? undefined;
  }

  if (promotion.discount_type === "percentage") {
    return `${promotion.discount_value}% de desconto`;
  }

  if (promotion.discount_type === "fixed_amount") {
    return `${new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(promotion.discount_value)} de desconto`;
  }

  return promotion.badge ?? undefined;
}

async function loadCatalog(): Promise<PublicCatalog> {
  const supabase = createPublicClient();

  if (!supabase) {
    return fallbackCatalog;
  }

  const now = new Date().toISOString();
  const [
    brandsResult,
    categoriesResult,
    productsResult,
    productCategoriesResult,
    productImagesResult,
    promotionsResult,
    promotionProductsResult,
  ] = await Promise.all([
    supabase
      .from("brands")
      .select("*")
      .eq("is_active", true)
      .order("display_order")
      .order("name"),
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order")
      .order("name"),
    supabase
      .from("public_products")
      .select("*")
      .eq("status", "published")
      .is("deleted_at", null)
      .not("published_at", "is", null)
      .lte("published_at", now)
      .order("is_featured", { ascending: false })
      .order("published_at", { ascending: false }),
    supabase.from("product_categories").select("*"),
    supabase
      .from("product_images")
      .select("*")
      .order("is_primary", { ascending: false })
      .order("display_order"),
    supabase
      .from("promotions")
      .select("*")
      .eq("status", "published")
      .eq("is_active", true)
      .is("deleted_at", null)
      .not("published_at", "is", null)
      .lte("published_at", now)
      .lte("starts_at", now)
      .gt("ends_at", now)
      .order("starts_at", { ascending: false }),
    supabase.from("promotion_products").select("*"),
  ]);

  const results = [
    brandsResult,
    categoriesResult,
    productsResult,
    productCategoriesResult,
    productImagesResult,
    promotionsResult,
    promotionProductsResult,
  ];

  if (results.some((result) => result.error)) {
    return fallbackCatalog;
  }

  const publicBrands: PublicBrand[] = (brandsResult.data ?? []).map((row) => {
    const demo = demoBrands.find((brand) => brand.slug === row.slug);

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description:
        row.description ??
        demo?.description ??
        "Conheça os produtos desta marca disponíveis no catálogo.",
      accent: demo?.accent ?? accentFor(row.slug),
      demonstrationOnly: false,
      isFeatured: row.is_featured,
      logoUrl: mediaUrl(supabase, row.logo_path),
    };
  });

  const publicCategories: PublicCategory[] = (categoriesResult.data ?? []).map(
    (row) => {
      const demo = demoCategories.find(
        (category) => category.slug === row.slug,
      );

      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        shortName: demo?.shortName ?? row.name,
        description:
          row.description ??
          demo?.description ??
          "Produtos selecionados para esta etapa da obra.",
        accent: demo?.accent ?? accentFor(row.slug),
        imageUrl: mediaUrl(supabase, row.image_path),
      };
    },
  );

  const brandById = new Map(publicBrands.map((brand) => [brand.id, brand]));
  const categoryById = new Map(
    publicCategories.map((category) => [category.id, category]),
  );
  const categoryIdsByProduct = new Map<string, string[]>();
  const promotionIdsByProduct = new Map<string, string[]>();
  const imageByProduct = new Map<string, Tables<"product_images">>();

  for (const relation of productCategoriesResult.data ?? []) {
    const values = categoryIdsByProduct.get(relation.product_id) ?? [];
    values.push(relation.category_id);
    categoryIdsByProduct.set(relation.product_id, values);
  }

  for (const relation of promotionProductsResult.data ?? []) {
    const values = promotionIdsByProduct.get(relation.product_id) ?? [];
    values.push(relation.promotion_id);
    promotionIdsByProduct.set(relation.product_id, values);
  }

  for (const image of productImagesResult.data ?? []) {
    if (!imageByProduct.has(image.product_id)) {
      imageByProduct.set(image.product_id, image);
    }
  }

  const promotionRows = promotionsResult.data ?? [];
  const promotionById = new Map(
    promotionRows.map((promotion) => [promotion.id, promotion]),
  );
  const publicProducts: PublicProduct[] = (productsResult.data ?? []).map(
    (row) => {
      const productCategories = (
        categoryIdsByProduct.get(row.id) ?? []
      )
        .map((id) => categoryById.get(id))
        .filter((category): category is PublicCategory => Boolean(category));
      const brand = row.brand_id ? brandById.get(row.brand_id) : undefined;
      const firstPromotionId = (promotionIdsByProduct.get(row.id) ?? []).find(
        (id) => promotionById.has(id),
      );
      const firstPromotion = firstPromotionId
        ? promotionById.get(firstPromotionId)
        : undefined;
      const image = imageByProduct.get(row.id);
      const categorySlug =
        productCategories[0]?.slug ?? "sem-categoria";

      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        brandSlug: brand?.slug ?? "sem-marca",
        categorySlug,
        shortDescription:
          row.short_description ??
          "Consulte aplicações, embalagens e disponibilidade com nossa equipe.",
        description:
          row.description ??
          row.short_description ??
          "Nossa equipe ajuda a confirmar se este produto é adequado para a sua superfície e etapa da obra.",
        highlights: [
            "Orientação de aplicação com a equipe",
            "Disponibilidade sob consulta",
        ],
        applications: splitValues(
          row.application,
          ["Consulte a indicação"],
        ),
        packages: splitValues(
          row.package_size,
          [row.unit || "Unidade"],
        ),
        finish: row.finish ?? undefined,
        coverage: undefined,
        featured: row.is_featured,
        isNew: false,
        promotionSlug: firstPromotion?.slug,
        visual: visualFor(row.slug),
        brand,
        categories: productCategories,
        categorySlugs: productCategories.length
          ? productCategories.map((category) => category.slug)
          : [categorySlug],
        compareAtPrice: row.compare_at_price,
        imageAlt: image?.alt_text ?? row.name,
        imageUrl: mediaUrl(supabase, image?.storage_path),
        isDemo: false,
        price: row.price,
        publishedAt: row.published_at ?? undefined,
        seoDescription: row.seo_description ?? undefined,
        seoTitle: row.seo_title ?? undefined,
        sku: row.sku ?? undefined,
      };
    },
  );

  const productSlugById = new Map(
    publicProducts.map((product) => [product.id, product.slug]),
  );
  const productIdsByPromotion = new Map<string, string[]>();

  for (const relation of promotionProductsResult.data ?? []) {
    const values = productIdsByPromotion.get(relation.promotion_id) ?? [];
    values.push(relation.product_id);
    productIdsByPromotion.set(relation.promotion_id, values);
  }

  const publicPromotions: PublicPromotion[] = promotionRows.map((row) => {
    const demo = demoPromotions.find(
      (promotion) => promotion.slug === row.slug,
    );

    return {
      id: row.id,
      slug: row.slug,
      eyebrow: row.badge ?? demo?.eyebrow ?? "Seleção especial",
      title: row.name,
      description:
        row.description ??
        demo?.description ??
        "Condição especial em produtos selecionados por tempo limitado.",
      benefit:
        discountLabel(row) ??
        demo?.benefit ??
        "Consulte as condições com a equipe",
      productSlugs: (productIdsByPromotion.get(row.id) ?? [])
        .map((id) => productSlugById.get(id))
        .filter((slug): slug is string => Boolean(slug)),
      accent: demo?.accent ?? accentFor(row.slug),
      active: true,
      discountLabel: discountLabel(row),
      endsAt: row.ends_at,
      isDemo: false,
      terms: row.terms ?? undefined,
    };
  });

  return {
    brands: publicBrands,
    categories: publicCategories,
    products: publicProducts,
    promotions: publicPromotions,
    source: "supabase",
  };
}

const getCachedCatalog = unstable_cache(
  loadCatalog,
  ["mm-tintas-public-catalog-v1"],
  {
    revalidate: 300,
    tags: [PUBLIC_CACHE_TAGS.catalog],
  },
);

export const getPublicCatalog = cache(getCachedCatalog);

export async function getPublicProductBySlug(slug: string) {
  const catalog = await getPublicCatalog();
  return catalog.products.find((product) => product.slug === slug);
}

export async function getPublicPromotionBySlug(slug: string) {
  const catalog = await getPublicCatalog();
  return catalog.promotions.find((promotion) => promotion.slug === slug);
}

export function filterPublicProducts(
  catalog: PublicCatalog,
  filters: CatalogFilters,
) {
  if (catalog.source === "demo") {
    const slugs = new Set(filterDemoProducts(filters).map(({ slug }) => slug));
    return catalog.products.filter((product) => slugs.has(product.slug));
  }

  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .trim();
  const query = filters.query ? normalize(filters.query) : "";

  return catalog.products.filter((product) => {
    const searchable = normalize(
      [
        product.name,
        product.shortDescription,
        product.brand?.name ?? "",
        ...product.categories.map((category) => category.name),
      ].join(" "),
    );

    return (
      (!query || searchable.includes(query)) &&
      (!filters.category ||
        product.categorySlugs.includes(filters.category)) &&
      (!filters.brand || product.brandSlug === filters.brand) &&
      (!filters.promotion ||
        product.promotionSlug === filters.promotion)
    );
  });
}

export function getRelatedPublicProducts(
  catalog: PublicCatalog,
  product: PublicProduct,
  limit = 3,
) {
  return catalog.products
    .filter(
      (candidate) =>
        candidate.slug !== product.slug &&
        (candidate.brandSlug === product.brandSlug ||
          candidate.categorySlugs.some((slug) =>
            product.categorySlugs.includes(slug),
          )),
    )
    .slice(0, limit);
}
