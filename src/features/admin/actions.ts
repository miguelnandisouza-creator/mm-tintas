"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { PUBLIC_CACHE_TAGS } from "@/lib/cache-tags";
import { toBusinessIsoDate } from "@/lib/date";
import {
  requireRole,
  SupabaseAuthError,
} from "@/lib/supabase/auth";
import type {
  DiscountType,
  Json,
  PublicationStatus,
  Tables,
  TablesInsert,
} from "@/types/database";

export type ActionErrorCode =
  | "CONFIGURATION"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION"
  | "CONFLICT"
  | "NOT_FOUND"
  | "DATABASE";

export type ActionState<T> =
  | {
      data: T;
      message: string;
      ok: true;
    }
  | {
      code: ActionErrorCode;
      fieldErrors?: Record<string, string[]>;
      message: string;
      ok: false;
    };

const STAFF_ROLES = ["admin", "editor", "viewer"] as const;
const CONTENT_ROLES = ["admin", "editor"] as const;
const ADMIN_ROLES = ["admin"] as const;
const PUBLICATION_STATUSES = [
  "draft",
  "published",
  "archived",
] as const satisfies readonly PublicationStatus[];
const DISCOUNT_TYPES = [
  "percentage",
  "fixed_amount",
] as const satisfies readonly DiscountType[];
const MEDIA_FOLDERS = ["products", "brands", "posts", "site"] as const;
const SITE_SETTING_KEYS = [
  "business_profile",
  "contact_profile",
  "opening_hours",
  "seo_defaults",
  "social_and_features",
] as const;
const SITE_SETTING_GROUPS = {
  business_profile: "business",
  contact_profile: "contact",
  opening_hours: "hours",
  seo_defaults: "seo",
  social_and_features: "social",
} as const;
const SITE_SETTING_FIELDS = {
  business_profile: [
    "businessName",
    "legalName",
    "description",
    "cnpj",
  ],
  contact_profile: [
    "phone",
    "whatsapp",
    "email",
    "address",
    "neighborhood",
    "city",
    "state",
    "postalCode",
  ],
  opening_hours: ["weekdayHours", "saturdayHours", "sundayHours"],
  seo_defaults: ["seoTitle", "seoDescription", "siteUrl"],
  social_and_features: [
    "instagram",
    "facebook",
    "youtube",
    "whatsappEnabled",
    "pricesEnabled",
  ],
} as const;
const BOOLEAN_SETTING_FIELDS = new Set([
  "whatsappEnabled",
  "pricesEnabled",
]);
const MAX_MEDIA_SIZE = 10 * 1024 * 1024;
const MEDIA_EXTENSIONS: Record<string, string> = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const slugSchema = z
  .string()
  .trim()
  .min(1, "Informe o slug.")
  .max(180, "Use no máximo 180 caracteres.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use apenas letras minúsculas, números e hífens.",
  );
const uuidSchema = z.string().uuid("Identificador inválido.");
const optionalUuidSchema = uuidSchema.nullable().optional();
const optionalDateSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || Number.isFinite(Date.parse(value)),
    "Informe uma data válida.",
  )
  .nullable()
  .optional();

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Use no máximo ${max} caracteres.`)
    .nullable()
    .optional();
}

function isJson(value: unknown): value is Json {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.every(isJson);
  }

  if (typeof value === "object") {
    return Object.values(value).every(
      (entry) => entry === undefined || isJson(entry),
    );
  }

  return false;
}

const jsonSchema = z.custom<Json>(isJson, "Informe um JSON válido.");
const jsonObjectSchema = jsonSchema.refine(
  (value) => value !== null && typeof value === "object" && !Array.isArray(value),
  "Informe um objeto JSON válido.",
);

const productSchema = z.object({
  application: optionalText(240),
  brandId: optionalUuidSchema,
  categoryIds: z.array(uuidSchema).max(30).optional(),
  color: optionalText(120),
  compareAtPrice: z.number().min(0).nullable().optional(),
  costPrice: z.number().min(0).nullable().optional(),
  description: optionalText(20_000),
  finish: optionalText(120),
  isFeatured: z.boolean().optional(),
  metadata: jsonObjectSchema.optional(),
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome.")
    .max(180, "Use no máximo 180 caracteres."),
  packageSize: optionalText(80),
  price: z.number().min(0).nullable().optional(),
  publishedAt: optionalDateSchema,
  seoDescription: optionalText(320),
  seoTitle: optionalText(70),
  shortDescription: optionalText(500),
  sku: optionalText(80),
  slug: slugSchema,
  status: z.enum(PUBLICATION_STATUSES).optional(),
  stockQuantity: z.number().min(0).nullable().optional(),
  unit: z.string().trim().min(1).max(40).optional(),
});

const brandSchema = z.object({
  description: optionalText(5_000),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  logoPath: optionalText(500),
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome.")
    .max(120, "Use no máximo 120 caracteres."),
  seoDescription: optionalText(320),
  seoTitle: optionalText(70),
  slug: slugSchema,
  website: z
    .string()
    .trim()
    .url("Informe uma URL válida.")
    .refine(
      (value) => /^https?:\/\//i.test(value),
      "Informe uma URL HTTP ou HTTPS válida.",
    )
    .max(500)
    .nullable()
    .optional(),
});

const postSchema = z.object({
  categoryIds: z.array(uuidSchema).max(10).optional(),
  content: z
    .string()
    .trim()
    .min(1, "Informe o conteúdo.")
    .max(200_000, "O conteúdo excede o limite permitido."),
  coverImagePath: optionalText(500),
  excerpt: optionalText(600),
  publishedAt: optionalDateSchema,
  seoDescription: optionalText(320),
  seoTitle: optionalText(70),
  slug: slugSchema,
  status: z.enum(PUBLICATION_STATUSES).optional(),
  tagIds: z.array(uuidSchema).max(30).optional(),
  title: z
    .string()
    .trim()
    .min(1, "Informe o título.")
    .max(200, "Use no máximo 200 caracteres."),
});

const promotionProductSchema = z.object({
  productId: uuidSchema,
  promotionalPrice: z.number().min(0).nullable().optional(),
});

const promotionSchema = z
  .object({
    badge: optionalText(80),
    bannerPath: optionalText(500),
    description: optionalText(10_000),
    discountType: z.enum(DISCOUNT_TYPES).nullable().optional(),
    discountValue: z.number().min(0).nullable().optional(),
    endsAt: z
      .string()
      .trim()
      .refine((value) => Number.isFinite(Date.parse(value)), "Data inválida."),
    isActive: z.boolean().optional(),
    name: z
      .string()
      .trim()
      .min(1, "Informe o nome.")
      .max(180, "Use no máximo 180 caracteres."),
    products: z.array(promotionProductSchema).max(100).optional(),
    slug: slugSchema,
    startsAt: z
      .string()
      .trim()
      .refine((value) => Number.isFinite(Date.parse(value)), "Data inválida."),
    status: z.enum(PUBLICATION_STATUSES).optional(),
    terms: optionalText(10_000),
  })
  .superRefine((value, context) => {
    const bothDateOnly =
      /^\d{4}-\d{2}-\d{2}$/.test(value.startsAt) &&
      /^\d{4}-\d{2}-\d{2}$/.test(value.endsAt);
    const invalidOrder = bothDateOnly
      ? Date.parse(value.endsAt) < Date.parse(value.startsAt)
      : Date.parse(value.endsAt) <= Date.parse(value.startsAt);

    if (invalidOrder) {
      context.addIssue({
        code: "custom",
        message: "O término deve ser posterior ao início.",
        path: ["endsAt"],
      });
    }

    const productIds =
      value.products?.map((product) => product.productId) ?? [];
    if (new Set(productIds).size !== productIds.length) {
      context.addIssue({
        code: "custom",
        message: "Cada produto só pode aparecer uma vez na promoção.",
        path: ["products"],
      });
    }

    if (
      value.discountType === "percentage" &&
      value.discountValue !== null &&
      value.discountValue !== undefined &&
      value.discountValue > 100
    ) {
      context.addIssue({
        code: "custom",
        message: "O desconto percentual não pode exceder 100%.",
        path: ["discountValue"],
      });
    }
  });

const siteSettingSchema = z
  .object({
    description: optionalText(500),
    group: z
      .enum(["business", "contact", "hours", "seo", "social"])
      .optional(),
    isPublic: z.boolean().optional(),
    key: z.enum(SITE_SETTING_KEYS),
    value: z.record(z.string(), z.union([z.string(), z.boolean()])),
  })
  .superRefine((setting, context) => {
    const expectedGroup = SITE_SETTING_GROUPS[setting.key];
    if (setting.group && setting.group !== expectedGroup) {
      context.addIssue({
        code: "custom",
        message: `O grupo de ${setting.key} deve ser ${expectedGroup}.`,
        path: ["group"],
      });
    }

    const expectedFields = new Set<string>(SITE_SETTING_FIELDS[setting.key]);
    for (const field of Object.keys(setting.value)) {
      if (!expectedFields.has(field)) {
        context.addIssue({
          code: "custom",
          message: `O campo ${field} não pertence a ${setting.key}.`,
          path: ["value", field],
        });
      }
    }

    for (const field of expectedFields) {
      if (!(field in setting.value)) {
        context.addIssue({
          code: "custom",
          message: `O campo ${field} é obrigatório.`,
          path: ["value", field],
        });
        continue;
      }

      const expectedType = BOOLEAN_SETTING_FIELDS.has(field)
        ? "boolean"
        : "string";
      if (typeof setting.value[field] !== expectedType) {
        context.addIssue({
          code: "custom",
          message: `O campo ${field} deve ser ${expectedType}.`,
          path: ["value", field],
        });
      }

      const value = setting.value[field];
      if (typeof value === "string" && value.length > 2_000) {
        context.addIssue({
          code: "custom",
          message: `O campo ${field} deve ter no máximo 2.000 caracteres.`,
          path: ["value", field],
        });
      }

      if (
        typeof value === "string" &&
        value.trim() &&
        ["siteUrl", "instagram", "facebook", "youtube"].includes(field)
      ) {
        try {
          const url = new URL(value);
          if (url.protocol !== "http:" && url.protocol !== "https:") {
            throw new Error("unsupported protocol");
          }
        } catch {
          context.addIssue({
            code: "custom",
            message: `Informe uma URL HTTP ou HTTPS válida em ${field}.`,
            path: ["value", field],
          });
        }
      }

      if (
        field === "email" &&
        typeof value === "string" &&
        value.trim() &&
        !z.email().safeParse(value).success
      ) {
        context.addIssue({
          code: "custom",
          message: "Informe um e-mail válido.",
          path: ["value", field],
        });
      }
    }
  });

export type ProductInput = z.input<typeof productSchema>;
export type BrandInput = z.input<typeof brandSchema>;
export type PostInput = z.input<typeof postSchema>;
export type PromotionInput = z.input<typeof promotionSchema>;
export type SiteSettingInput = z.input<typeof siteSettingSchema>;

class DatabaseOperationError extends Error {
  constructor(
    message: string,
    public readonly databaseCode?: string,
  ) {
    super(message);
    this.name = "DatabaseOperationError";
  }
}

function nullableText(value: string | null | undefined) {
  return value?.trim() || null;
}

function uniqueIds(ids: string[] | undefined) {
  return ids ? [...new Set(ids)] : undefined;
}

function validationFailure(error: z.ZodError): ActionState<never> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path[0]?.toString() ?? "_form";
    fieldErrors[field] ??= [];
    fieldErrors[field].push(issue.message);
  }

  return {
    code: "VALIDATION",
    fieldErrors,
    message: "Revise os campos destacados e tente novamente.",
    ok: false,
  };
}

function failure<T>(error: unknown): ActionState<T> {
  if (error instanceof SupabaseAuthError) {
    return {
      code: error.code,
      message: error.message,
      ok: false,
    };
  }

  if (error instanceof DatabaseOperationError) {
    if (error.databaseCode === "23505") {
      return {
        code: "CONFLICT",
        message: "Já existe um registro com este slug, SKU ou chave.",
        ok: false,
      };
    }

    if (error.databaseCode === "PGRST116") {
      return {
        code: "NOT_FOUND",
        message: "O registro solicitado não foi encontrado.",
        ok: false,
      };
    }

    if (error.databaseCode === "23503") {
      return {
        code: "CONFLICT",
        message:
          "Este registro possui vínculos ativos e não pode ser removido agora.",
        ok: false,
      };
    }

    if (error.databaseCode === "42501") {
      return {
        code: "FORBIDDEN",
        message: "Você não tem permissão para realizar esta operação.",
        ok: false,
      };
    }

    return {
      code: "DATABASE",
      message: "O banco de dados não conseguiu concluir a operação.",
      ok: false,
    };
  }

  return {
    code: "DATABASE",
    message: "Não foi possível concluir a operação. Tente novamente.",
    ok: false,
  };
}

function assertDatabaseResult<T>(
  error: { code?: string; message: string } | null,
  data: T | null,
): asserts data is T;
function assertDatabaseResult(
  error: { code?: string; message: string } | null,
): void;
function assertDatabaseResult<T>(
  error: { code?: string; message: string } | null,
  data?: T | null,
) {
  if (error) {
    throw new DatabaseOperationError(error.message, error.code);
  }

  if (arguments.length > 1 && data === null) {
    throw new DatabaseOperationError(
      "O registro solicitado não foi encontrado.",
      "PGRST116",
    );
  }
}

function productPayload(
  value: z.output<typeof productSchema>,
  update: boolean,
): TablesInsert<"products"> {
  const payload: TablesInsert<"products"> = {
    application: nullableText(value.application),
    brand_id: value.brandId ?? null,
    color: nullableText(value.color),
    compare_at_price: value.compareAtPrice ?? null,
    cost_price: value.costPrice ?? null,
    description: nullableText(value.description),
    finish: nullableText(value.finish),
    is_featured: value.isFeatured ?? false,
    name: value.name,
    package_size: nullableText(value.packageSize),
    price: value.price ?? null,
    published_at: toBusinessIsoDate(value.publishedAt),
    seo_description: nullableText(value.seoDescription),
    seo_title: nullableText(value.seoTitle),
    short_description: nullableText(value.shortDescription),
    sku: nullableText(value.sku),
    slug: value.slug,
    status: value.status ?? "draft",
    stock_quantity: value.stockQuantity ?? null,
    unit: value.unit?.trim() || "unidade",
  };

  if (value.metadata !== undefined) {
    payload.metadata = value.metadata;
  } else if (!update) {
    payload.metadata = {};
  }

  return payload;
}

function brandPayload(
  value: z.output<typeof brandSchema>,
): TablesInsert<"brands"> {
  return {
    description: nullableText(value.description),
    display_order: value.displayOrder ?? 0,
    is_active: value.isActive ?? true,
    is_featured: value.isFeatured ?? false,
    logo_path: nullableText(value.logoPath),
    name: value.name,
    seo_description: nullableText(value.seoDescription),
    seo_title: nullableText(value.seoTitle),
    slug: value.slug,
    website: nullableText(value.website),
  };
}

function postPayload(
  value: z.output<typeof postSchema>,
  authorId?: string,
): TablesInsert<"posts"> {
  return {
    author_id: authorId,
    content: value.content,
    cover_image_path: nullableText(value.coverImagePath),
    excerpt: nullableText(value.excerpt),
    published_at: toBusinessIsoDate(value.publishedAt),
    seo_description: nullableText(value.seoDescription),
    seo_title: nullableText(value.seoTitle),
    slug: value.slug,
    status: value.status ?? "draft",
    title: value.title,
  };
}

function promotionPayload(
  value: z.output<typeof promotionSchema>,
): TablesInsert<"promotions"> {
  return {
    badge: nullableText(value.badge),
    banner_path: nullableText(value.bannerPath),
    description: nullableText(value.description),
    discount_type: value.discountType ?? null,
    discount_value: value.discountValue ?? null,
    ends_at: toBusinessIsoDate(value.endsAt, true) as string,
    is_active: value.isActive ?? true,
    name: value.name,
    slug: value.slug,
    starts_at: toBusinessIsoDate(value.startsAt) as string,
    status: value.status ?? "draft",
    terms: nullableText(value.terms),
  };
}

function revalidateCatalog() {
  updateTag(PUBLIC_CACHE_TAGS.catalog);
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/produtos/[slug]", "page");
  revalidatePath("/admin", "layout");
}

function revalidateBlog() {
  updateTag(PUBLIC_CACHE_TAGS.blog);
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/admin", "layout");
}

function revalidatePromotions() {
  updateTag(PUBLIC_CACHE_TAGS.catalog);
  revalidatePath("/");
  revalidatePath("/promocoes");
  revalidatePath("/admin", "layout");
}

async function verifyForeignIds(
  table: "categories" | "post_categories" | "post_tags" | "products",
  ids: string[] | undefined,
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"],
) {
  const distinctIds = uniqueIds(ids);
  if (!distinctIds?.length) {
    return distinctIds;
  }

  const { data, error } = await supabase
    .from(table)
    .select("id")
    .in("id", distinctIds);
  assertDatabaseResult(error, data);

  if (data.length !== distinctIds.length) {
    throw new DatabaseOperationError(
      "Um ou mais vínculos selecionados não estão disponíveis.",
      "PGRST116",
    );
  }

  return distinctIds;
}

async function syncProductCategories(
  productId: string,
  categoryIds: string[] | undefined,
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"],
) {
  if (categoryIds === undefined) {
    return;
  }

  const deleteResult = await supabase
    .from("product_categories")
    .delete()
    .eq("product_id", productId);
  assertDatabaseResult(deleteResult.error);

  if (categoryIds.length) {
    const insertResult = await supabase.from("product_categories").insert(
      categoryIds.map((categoryId) => ({
        category_id: categoryId,
        product_id: productId,
      })),
    );
    assertDatabaseResult(insertResult.error);
  }
}

function primaryImageFromMetadata(metadata: Json | undefined) {
  if (
    metadata &&
    !Array.isArray(metadata) &&
    typeof metadata === "object" &&
    typeof metadata.primaryImagePath === "string"
  ) {
    return metadata.primaryImagePath;
  }

  return null;
}

async function hasValidImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());

  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (file.type === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((byte, index) => bytes[index] === byte);
  }

  if (file.type === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }

  if (file.type === "image/avif") {
    const box = String.fromCharCode(...bytes.slice(4, 12));
    return (
      box.startsWith("ftyp") &&
      ["avif", "avis", "mif1"].some((brand) => box.endsWith(brand))
    );
  }

  return false;
}

async function syncPrimaryProductImage(
  product: Tables<"products">,
  metadata: Json | undefined,
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"],
) {
  const path = primaryImageFromMetadata(metadata);
  if (!path) {
    return;
  }

  const clearResult = await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", product.id)
    .eq("is_primary", true);
  assertDatabaseResult(clearResult.error);

  const imageResult = await supabase.from("product_images").upsert(
    {
      alt_text: product.name,
      is_primary: true,
      product_id: product.id,
      storage_path: path,
    },
    { onConflict: "storage_path" },
  );
  assertDatabaseResult(imageResult.error);
}

async function syncPostTaxonomies(
  postId: string,
  categoryIds: string[] | undefined,
  tagIds: string[] | undefined,
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"],
) {
  if (categoryIds !== undefined) {
    const deleteCategories = await supabase
      .from("post_category_assignments")
      .delete()
      .eq("post_id", postId);
    assertDatabaseResult(deleteCategories.error);

    if (categoryIds.length) {
      const insertCategories = await supabase
        .from("post_category_assignments")
        .insert(
          categoryIds.map((categoryId) => ({
            category_id: categoryId,
            post_id: postId,
          })),
        );
      assertDatabaseResult(insertCategories.error);
    }
  }

  if (tagIds !== undefined) {
    const deleteTags = await supabase
      .from("post_tag_assignments")
      .delete()
      .eq("post_id", postId);
    assertDatabaseResult(deleteTags.error);

    if (tagIds.length) {
      const insertTags = await supabase.from("post_tag_assignments").insert(
        tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })),
      );
      assertDatabaseResult(insertTags.error);
    }
  }
}

async function syncPromotionProducts(
  promotionId: string,
  products: z.output<typeof promotionProductSchema>[] | undefined,
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"],
) {
  if (products === undefined) {
    return;
  }

  const deleteResult = await supabase
    .from("promotion_products")
    .delete()
    .eq("promotion_id", promotionId);
  assertDatabaseResult(deleteResult.error);

  if (products.length) {
    const insertResult = await supabase.from("promotion_products").insert(
      products.map((product) => ({
        product_id: product.productId,
        promotional_price: product.promotionalPrice ?? null,
        promotion_id: promotionId,
      })),
    );
    assertDatabaseResult(insertResult.error);
  }
}

export async function listProductsAction(): Promise<
  ActionState<Tables<"products">[]>
> {
  try {
    const { supabase } = await requireRole(STAFF_ROLES);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    assertDatabaseResult(error, data);

    return {
      data,
      message: "Produtos carregados.",
      ok: true,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function createProductAction(
  input: ProductInput,
): Promise<ActionState<Tables<"products">>> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return validationFailure(parsed.error);
  }

  try {
    const { supabase } = await requireRole(CONTENT_ROLES);
    const categoryIds = await verifyForeignIds(
      "categories",
      parsed.data.categoryIds,
      supabase,
    );
    const { data, error } = await supabase
      .from("products")
      .insert(productPayload(parsed.data, false))
      .select("*")
      .single();
    assertDatabaseResult(error, data);

    try {
      await syncProductCategories(data.id, categoryIds, supabase);
      await syncPrimaryProductImage(data, parsed.data.metadata, supabase);
    } catch (syncError) {
      await supabase.from("products").delete().eq("id", data.id);
      throw syncError;
    }

    revalidateCatalog();
    return {
      data,
      message: "Produto criado com sucesso.",
      ok: true,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function updateProductAction(
  id: string,
  input: ProductInput,
): Promise<ActionState<Tables<"products">>> {
  const parsedId = uuidSchema.safeParse(id);
  const parsed = productSchema.safeParse(input);
  if (!parsedId.success) {
    return validationFailure(parsedId.error);
  }
  if (!parsed.success) {
    return validationFailure(parsed.error);
  }

  try {
    const { supabase } = await requireRole(CONTENT_ROLES);
    const categoryIds = await verifyForeignIds(
      "categories",
      parsed.data.categoryIds,
      supabase,
    );
    const { data, error } = await supabase
      .from("products")
      .update(productPayload(parsed.data, true))
      .eq("id", parsedId.data)
      .is("deleted_at", null)
      .select("*")
      .single();
    assertDatabaseResult(error, data);

    await syncProductCategories(data.id, categoryIds, supabase);
    await syncPrimaryProductImage(data, parsed.data.metadata, supabase);
    revalidateCatalog();

    return {
      data,
      message: "Produto atualizado com sucesso.",
      ok: true,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteProductAction(
  id: string,
): Promise<ActionState<{ id: string }>> {
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return validationFailure(parsedId.error);
  }

  try {
    const { supabase } = await requireRole(CONTENT_ROLES);
    const { data, error } = await supabase
      .from("products")
      .update({
        deleted_at: new Date().toISOString(),
        is_featured: false,
        status: "archived",
      })
      .eq("id", parsedId.data)
      .is("deleted_at", null)
      .select("id")
      .single();
    assertDatabaseResult(error, data);
    revalidateCatalog();

    return {
      data,
      message: "Produto arquivado com sucesso.",
      ok: true,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function listBrandsAction(): Promise<
  ActionState<Tables<"brands">[]>
> {
  try {
    const { supabase } = await requireRole(STAFF_ROLES);
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("display_order")
      .order("name");
    assertDatabaseResult(error, data);

    return { data, message: "Marcas carregadas.", ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function listCategoriesAction(): Promise<
  ActionState<Tables<"categories">[]>
> {
  try {
    const { supabase } = await requireRole(STAFF_ROLES);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order")
      .order("name");
    assertDatabaseResult(error, data);

    return { data, message: "Categorias carregadas.", ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function createBrandAction(
  input: BrandInput,
): Promise<ActionState<Tables<"brands">>> {
  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) {
    return validationFailure(parsed.error);
  }

  try {
    const { supabase } = await requireRole(CONTENT_ROLES);
    const { data, error } = await supabase
      .from("brands")
      .insert(brandPayload(parsed.data))
      .select("*")
      .single();
    assertDatabaseResult(error, data);
    revalidateCatalog();

    return { data, message: "Marca criada com sucesso.", ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function updateBrandAction(
  id: string,
  input: BrandInput,
): Promise<ActionState<Tables<"brands">>> {
  const parsedId = uuidSchema.safeParse(id);
  const parsed = brandSchema.safeParse(input);
  if (!parsedId.success) {
    return validationFailure(parsedId.error);
  }
  if (!parsed.success) {
    return validationFailure(parsed.error);
  }

  try {
    const { supabase } = await requireRole(CONTENT_ROLES);
    const { data, error } = await supabase
      .from("brands")
      .update(brandPayload(parsed.data))
      .eq("id", parsedId.data)
      .select("*")
      .single();
    assertDatabaseResult(error, data);
    revalidateCatalog();

    return { data, message: "Marca atualizada com sucesso.", ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteBrandAction(
  id: string,
): Promise<ActionState<{ id: string }>> {
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return validationFailure(parsedId.error);
  }

  try {
    const { supabase } = await requireRole(CONTENT_ROLES);
    const { data, error } = await supabase
      .from("brands")
      .delete()
      .eq("id", parsedId.data)
      .select("id")
      .single();
    assertDatabaseResult(error, data);
    revalidateCatalog();

    return { data, message: "Marca removida com sucesso.", ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function listPostsAction(): Promise<
  ActionState<Tables<"posts">[]>
> {
  try {
    const { supabase } = await requireRole(STAFF_ROLES);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    assertDatabaseResult(error, data);

    return { data, message: "Artigos carregados.", ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function listPostCategoriesAction(): Promise<
  ActionState<Tables<"post_categories">[]>
> {
  try {
    const { supabase } = await requireRole(STAFF_ROLES);
    const { data, error } = await supabase
      .from("post_categories")
      .select("*")
      .order("display_order")
      .order("name");
    assertDatabaseResult(error, data);

    return {
      data,
      message: "Categorias do blog carregadas.",
      ok: true,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function createPostAction(
  input: PostInput,
): Promise<ActionState<Tables<"posts">>> {
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return validationFailure(parsed.error);
  }

  try {
    const { supabase, user } = await requireRole(CONTENT_ROLES);
    const categoryIds = await verifyForeignIds(
      "post_categories",
      parsed.data.categoryIds,
      supabase,
    );
    const tagIds = await verifyForeignIds(
      "post_tags",
      parsed.data.tagIds,
      supabase,
    );
    const { data, error } = await supabase
      .from("posts")
      .insert(postPayload(parsed.data, user.id))
      .select("*")
      .single();
    assertDatabaseResult(error, data);

    try {
      await syncPostTaxonomies(data.id, categoryIds, tagIds, supabase);
    } catch (syncError) {
      await supabase.from("posts").delete().eq("id", data.id);
      throw syncError;
    }

    revalidateBlog();
    return { data, message: "Artigo criado com sucesso.", ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function updatePostAction(
  id: string,
  input: PostInput,
): Promise<ActionState<Tables<"posts">>> {
  const parsedId = uuidSchema.safeParse(id);
  const parsed = postSchema.safeParse(input);
  if (!parsedId.success) {
    return validationFailure(parsedId.error);
  }
  if (!parsed.success) {
    return validationFailure(parsed.error);
  }

  try {
    const { supabase } = await requireRole(CONTENT_ROLES);
    const categoryIds = await verifyForeignIds(
      "post_categories",
      parsed.data.categoryIds,
      supabase,
    );
    const tagIds = await verifyForeignIds(
      "post_tags",
      parsed.data.tagIds,
      supabase,
    );
    const payload = postPayload(parsed.data);
    delete payload.author_id;

    const { data, error } = await supabase
      .from("posts")
      .update(payload)
      .eq("id", parsedId.data)
      .is("deleted_at", null)
      .select("*")
      .single();
    assertDatabaseResult(error, data);

    await syncPostTaxonomies(data.id, categoryIds, tagIds, supabase);
    revalidateBlog();

    return { data, message: "Artigo atualizado com sucesso.", ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function deletePostAction(
  id: string,
): Promise<ActionState<{ id: string }>> {
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return validationFailure(parsedId.error);
  }

  try {
    const { supabase } = await requireRole(CONTENT_ROLES);
    const { data, error } = await supabase
      .from("posts")
      .update({
        deleted_at: new Date().toISOString(),
        status: "archived",
      })
      .eq("id", parsedId.data)
      .is("deleted_at", null)
      .select("id")
      .single();
    assertDatabaseResult(error, data);
    revalidateBlog();

    return { data, message: "Artigo arquivado com sucesso.", ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function listPromotionsAction(): Promise<
  ActionState<Tables<"promotions">[]>
> {
  try {
    const { supabase } = await requireRole(STAFF_ROLES);
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .is("deleted_at", null)
      .order("starts_at", { ascending: false });
    assertDatabaseResult(error, data);

    return { data, message: "Promoções carregadas.", ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function createPromotionAction(
  input: PromotionInput,
): Promise<ActionState<Tables<"promotions">>> {
  const parsed = promotionSchema.safeParse(input);
  if (!parsed.success) {
    return validationFailure(parsed.error);
  }

  try {
    const { supabase } = await requireRole(CONTENT_ROLES);
    const productIds = await verifyForeignIds(
      "products",
      parsed.data.products?.map(({ productId }) => productId),
      supabase,
    );
    const selectedProducts = parsed.data.products?.filter(({ productId }) =>
      productIds?.includes(productId),
    );
    const { data, error } = await supabase
      .from("promotions")
      .insert(promotionPayload(parsed.data))
      .select("*")
      .single();
    assertDatabaseResult(error, data);

    try {
      await syncPromotionProducts(data.id, selectedProducts, supabase);
    } catch (syncError) {
      await supabase.from("promotions").delete().eq("id", data.id);
      throw syncError;
    }

    revalidatePromotions();
    return { data, message: "Promoção criada com sucesso.", ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function updatePromotionAction(
  id: string,
  input: PromotionInput,
): Promise<ActionState<Tables<"promotions">>> {
  const parsedId = uuidSchema.safeParse(id);
  const parsed = promotionSchema.safeParse(input);
  if (!parsedId.success) {
    return validationFailure(parsedId.error);
  }
  if (!parsed.success) {
    return validationFailure(parsed.error);
  }

  try {
    const { supabase } = await requireRole(CONTENT_ROLES);
    const productIds = await verifyForeignIds(
      "products",
      parsed.data.products?.map(({ productId }) => productId),
      supabase,
    );
    const selectedProducts = parsed.data.products?.filter(({ productId }) =>
      productIds?.includes(productId),
    );
    const { data, error } = await supabase
      .from("promotions")
      .update(promotionPayload(parsed.data))
      .eq("id", parsedId.data)
      .is("deleted_at", null)
      .select("*")
      .single();
    assertDatabaseResult(error, data);

    await syncPromotionProducts(data.id, selectedProducts, supabase);
    revalidatePromotions();
    return { data, message: "Promoção atualizada com sucesso.", ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function deletePromotionAction(
  id: string,
): Promise<ActionState<{ id: string }>> {
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return validationFailure(parsedId.error);
  }

  try {
    const { supabase } = await requireRole(CONTENT_ROLES);
    const { data, error } = await supabase
      .from("promotions")
      .update({
        deleted_at: new Date().toISOString(),
        is_active: false,
        status: "archived",
      })
      .eq("id", parsedId.data)
      .is("deleted_at", null)
      .select("id")
      .single();
    assertDatabaseResult(error, data);
    revalidatePromotions();

    return { data, message: "Promoção arquivada com sucesso.", ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function listSiteSettingsAction(): Promise<
  ActionState<Tables<"site_settings">[]>
> {
  try {
    const { supabase } = await requireRole(ADMIN_ROLES);
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("setting_group")
      .order("key");
    assertDatabaseResult(error, data);

    return { data, message: "Configurações carregadas.", ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function upsertSiteSettingAction(
  input: SiteSettingInput,
): Promise<ActionState<Tables<"site_settings">>> {
  const parsed = siteSettingSchema.safeParse(input);
  if (!parsed.success) {
    return validationFailure(parsed.error);
  }

  try {
    const { supabase, user } = await requireRole(ADMIN_ROLES);
    const { data, error } = await supabase
      .from("site_settings")
      .upsert(
        {
          description: nullableText(parsed.data.description),
          is_public: parsed.data.isPublic ?? false,
          key: parsed.data.key,
          setting_group: SITE_SETTING_GROUPS[parsed.data.key],
          updated_by: user.id,
          value: parsed.data.value,
        },
        { onConflict: "key" },
      )
      .select("*")
      .single();
    assertDatabaseResult(error, data);
    updateTag(PUBLIC_CACHE_TAGS.settings);
    revalidatePath("/", "layout");

    return { data, message: "Configuração salva com sucesso.", ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteSiteSettingAction(
  key: string,
): Promise<ActionState<{ key: string }>> {
  const parsedKey = siteSettingSchema.shape.key.safeParse(key);
  if (!parsedKey.success) {
    return validationFailure(parsedKey.error);
  }

  try {
    const { supabase } = await requireRole(ADMIN_ROLES);
    const { data, error } = await supabase
      .from("site_settings")
      .delete()
      .eq("key", parsedKey.data)
      .select("key")
      .single();
    assertDatabaseResult(error, data);
    updateTag(PUBLIC_CACHE_TAGS.settings);
    revalidatePath("/", "layout");

    return { data, message: "Configuração removida.", ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function uploadMediaAction(
  formData: FormData,
): Promise<ActionState<{ path: string; publicUrl: string }>> {
  try {
    const { supabase } = await requireRole(CONTENT_ROLES);
    const file = formData.get("file");
    const folderResult = z
      .enum(MEDIA_FOLDERS)
      .safeParse(formData.get("folder"));
    const entityIdValue = formData.get("entityId");
    const entityId =
      typeof entityIdValue === "string" && entityIdValue
        ? entityIdValue
        : "general";

    if (!(file instanceof File)) {
      return {
        code: "VALIDATION",
        fieldErrors: { file: ["Selecione uma imagem."] },
        message: "Selecione uma imagem para enviar.",
        ok: false,
      };
    }

    if (!folderResult.success) {
      return {
        code: "VALIDATION",
        fieldErrors: { folder: ["Pasta de mídia inválida."] },
        message: "Não foi possível determinar o destino da imagem.",
        ok: false,
      };
    }

    const extension = MEDIA_EXTENSIONS[file.type];
    if (!extension) {
      return {
        code: "VALIDATION",
        fieldErrors: {
          file: ["Use uma imagem JPEG, PNG, WebP ou AVIF."],
        },
        message: "Formato de imagem não permitido.",
        ok: false,
      };
    }

    if (file.size <= 0 || file.size > MAX_MEDIA_SIZE) {
      return {
        code: "VALIDATION",
        fieldErrors: { file: ["A imagem deve ter no máximo 10 MB."] },
        message: "A imagem excede o tamanho permitido.",
        ok: false,
      };
    }

    if (!(await hasValidImageSignature(file))) {
      return {
        code: "VALIDATION",
        fieldErrors: { file: ["O conteúdo do arquivo não é uma imagem válida."] },
        message: "O arquivo selecionado não é uma imagem válida.",
        ok: false,
      };
    }

    const safeEntityId = entityId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
    const path = `${folderResult.data}/${safeEntityId || "general"}/${randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("media").upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });
    assertDatabaseResult(error);

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return {
      data: { path, publicUrl: data.publicUrl },
      message: "Imagem enviada com sucesso.",
      ok: true,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteMediaAction(
  path: string,
): Promise<ActionState<{ path: string }>> {
  const normalizedPath = path.trim();
  const isAllowedPath =
    normalizedPath.length > 0 &&
    normalizedPath.length <= 500 &&
    !normalizedPath.includes("..") &&
    MEDIA_FOLDERS.some((folder) =>
      normalizedPath.startsWith(`${folder}/`),
    );

  if (!isAllowedPath) {
    return {
      code: "VALIDATION",
      fieldErrors: { path: ["Caminho de mídia inválido."] },
      message: "Caminho de mídia inválido.",
      ok: false,
    };
  }

  try {
    const { supabase } = await requireRole(CONTENT_ROLES);
    const { error } = await supabase.storage
      .from("media")
      .remove([normalizedPath]);
    assertDatabaseResult(error);

    return {
      data: { path: normalizedPath },
      message: "Imagem removida com sucesso.",
      ok: true,
    };
  } catch (error) {
    return failure(error);
  }
}
