import type {
  Brand,
  Product,
  ProductCategory,
  Promotion,
} from "@/data/catalog";

export type PublicBrand = Omit<Brand, "demonstrationOnly"> & {
  demonstrationOnly: boolean;
  isFeatured?: boolean;
  logoUrl?: string;
};

export type PublicCategory = ProductCategory & {
  imageUrl?: string;
};

export type PublicProduct = Product & {
  brand?: PublicBrand;
  categories: PublicCategory[];
  categorySlugs: string[];
  compareAtPrice?: number | null;
  imageAlt?: string;
  imageUrl?: string;
  isDemo: boolean;
  price?: number | null;
  publishedAt?: string;
  seoDescription?: string;
  seoTitle?: string;
  sku?: string;
};

export type PublicPromotion = Promotion & {
  discountLabel?: string;
  endsAt?: string;
  isDemo: boolean;
  terms?: string;
};

export type PublicCatalog = {
  brands: PublicBrand[];
  categories: PublicCategory[];
  products: PublicProduct[];
  promotions: PublicPromotion[];
  source: "demo" | "supabase";
};
