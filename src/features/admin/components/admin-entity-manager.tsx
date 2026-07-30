"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  Archive,
  Check,
  ChevronLeft,
  ChevronRight,
  FileImage,
  Filter,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import {
  createBrandAction,
  createPostAction,
  createProductAction,
  createPromotionAction,
  deleteBrandAction,
  deletePostAction,
  deleteProductAction,
  deletePromotionAction,
  listBrandsAction,
  listCategoriesAction,
  listPostCategoriesAction,
  listPostsAction,
  listProductsAction,
  listPromotionsAction,
  updateBrandAction,
  updatePostAction,
  updateProductAction,
  updatePromotionAction,
  uploadMediaAction,
  type BarcodeProductMatch,
} from "@/features/admin/actions";
import { BarcodeProductField } from "@/features/admin/components/barcode-product-field";
import {
  entityConfigs,
  type AdminEntityKind,
  type AdminField,
  type AdminFieldOption,
  type AdminItem,
} from "@/features/admin/components/admin-entity-config";
import { toBusinessDateInput } from "@/lib/date";
import { cn } from "@/lib/utils";

type AdminEntityManagerProps = {
  kind: AdminEntityKind;
};

type ActionResult = {
  ok: boolean;
  data?: unknown;
  message: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
};

const statusStyles: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  draft: "bg-amber-50 text-amber-800 ring-amber-600/15",
  inactive: "bg-slate-100 text-slate-600 ring-slate-500/15",
  archived: "bg-slate-100 text-slate-600 ring-slate-500/15",
};

const statusLabels: Record<string, string> = {
  published: "Publicado",
  active: "Ativa",
  draft: "Rascunho",
  inactive: "Inativa",
  archived: "Arquivado",
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getInitialValues(kind: AdminEntityKind) {
  const config = entityConfigs[kind];
  const values: Record<string, string | boolean> = {};

  config.fields.forEach((field) => {
    if (field.type === "checkbox") {
      values[field.name] =
        field.name === "isActive" || field.name === "isFeatured"
          ? field.name === "isActive"
          : false;
    } else if (field.name === "status") {
      values[field.name] = "published";
    } else if (field.name === "discountType") {
      values[field.name] = "percentage";
    } else {
      values[field.name] = "";
    }
  });

  if (kind === "promotions") {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    values.startsAt = today.toISOString().slice(0, 10);
    values.endsAt = nextWeek.toISOString().slice(0, 10);
    values.isActive = true;
  }

  return values;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function boolValue(value: unknown) {
  return value === true;
}

function imagePathFromMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  return stringValue((value as Record<string, unknown>).primaryImagePath);
}

function formatUpdatedAt(value: unknown) {
  const text = stringValue(value);
  if (!text) return "Agora";
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return "Agora";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function currency(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
}

function mapRemoteItem(kind: AdminEntityKind, raw: unknown): AdminItem {
  const row = asRecord(raw);
  const id = stringValue(row.id);

  if (kind === "products") {
    const name = stringValue(row.name);
    const sku = stringValue(row.sku);
    const packageSize = stringValue(row.package_size);
    return {
      id,
      title: name,
      subtitle: [sku || "Sem SKU", packageSize].filter(Boolean).join(" • "),
      status: stringValue(row.status) || "draft",
      badge: boolValue(row.is_featured) ? "Destaque" : undefined,
      detail: currency(row.price) || "Preço sob consulta",
      updatedAt: formatUpdatedAt(row.updated_at),
      values: {
        name,
        slug: stringValue(row.slug),
        sku,
        brandId: stringValue(row.brand_id),
        categoryId: "",
        application: stringValue(row.application),
        finish: stringValue(row.finish),
        color: stringValue(row.color),
        packageSize,
        unit: stringValue(row.unit),
        price: stringValue(row.price),
        compareAtPrice: stringValue(row.compare_at_price),
        costPrice: stringValue(row.cost_price),
        stockQuantity: stringValue(row.stock_quantity),
        status: stringValue(row.status) || "draft",
        shortDescription: stringValue(row.short_description),
        description: stringValue(row.description),
        publishedAt: toBusinessDateInput(row.published_at),
        seoTitle: stringValue(row.seo_title),
        seoDescription: stringValue(row.seo_description),
        mediaPath: imagePathFromMetadata(row.metadata),
        isFeatured: boolValue(row.is_featured),
      },
    };
  }

  if (kind === "brands") {
    const name = stringValue(row.name);
    const isActive = boolValue(row.is_active);
    return {
      id,
      title: name,
      subtitle: stringValue(row.description) || "Marca do catálogo",
      status: isActive ? "active" : "inactive",
      badge: boolValue(row.is_featured) ? "Destaque" : undefined,
      detail: `Ordem ${stringValue(row.display_order) || "0"}`,
      updatedAt: formatUpdatedAt(row.updated_at),
      values: {
        name,
        slug: stringValue(row.slug),
        website: stringValue(row.website),
        displayOrder: stringValue(row.display_order),
        description: stringValue(row.description),
        seoTitle: stringValue(row.seo_title),
        seoDescription: stringValue(row.seo_description),
        mediaPath: stringValue(row.logo_path),
        isActive,
        isFeatured: boolValue(row.is_featured),
      },
    };
  }

  if (kind === "promotions") {
    const name = stringValue(row.name);
    const discountType = stringValue(row.discount_type);
    const discountValue = stringValue(row.discount_value);
    const subtitle =
      discountType === "percentage"
        ? `${discountValue}% de desconto`
        : `${currency(discountValue)} de desconto`;
    return {
      id,
      title: name,
      subtitle,
      status: stringValue(row.status) || "draft",
      badge: boolValue(row.is_active) ? "Ativa" : undefined,
      detail: toBusinessDateInput(row.ends_at)
        ? `Até ${new Intl.DateTimeFormat("pt-BR").format(
            new Date(`${toBusinessDateInput(row.ends_at)}T12:00:00`),
          )}`
        : "Sem data",
      updatedAt: formatUpdatedAt(row.updated_at),
      values: {
        name,
        slug: stringValue(row.slug),
        badge: stringValue(row.badge),
        discountType: discountType || "percentage",
        discountValue,
        startsAt: toBusinessDateInput(row.starts_at),
        endsAt: toBusinessDateInput(row.ends_at),
        status: stringValue(row.status) || "draft",
        productId: "",
        promotionalPrice: "",
        description: stringValue(row.description),
        terms: stringValue(row.terms),
        mediaPath: stringValue(row.banner_path),
        isActive: boolValue(row.is_active),
      },
    };
  }

  const title = stringValue(row.title);
  return {
    id,
    title,
    subtitle: stringValue(row.excerpt) || "Artigo do blog",
    status: stringValue(row.status) || "draft",
    badge: undefined,
    detail: toBusinessDateInput(row.published_at)
      ? new Intl.DateTimeFormat("pt-BR").format(
          new Date(`${toBusinessDateInput(row.published_at)}T12:00:00`),
        )
      : "Não publicado",
    updatedAt: formatUpdatedAt(row.updated_at),
    values: {
      title,
      slug: stringValue(row.slug),
      categoryId: "",
      status: stringValue(row.status) || "draft",
      publishedAt: toBusinessDateInput(row.published_at),
      excerpt: stringValue(row.excerpt),
      content: stringValue(row.content),
      seoTitle: stringValue(row.seo_title),
      seoDescription: stringValue(row.seo_description),
      mediaPath: stringValue(row.cover_image_path),
    },
  };
}

function optionalText(value: string | boolean | undefined) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || undefined;
}

function optionalNumber(value: string | boolean | undefined) {
  const number = Number(value);
  return Number.isFinite(number) && String(value).trim() !== ""
    ? number
    : undefined;
}

async function listRemote(kind: AdminEntityKind): Promise<ActionResult> {
  switch (kind) {
    case "products":
      return listProductsAction();
    case "brands":
      return listBrandsAction();
    case "promotions":
      return listPromotionsAction();
    case "posts":
      return listPostsAction();
  }
}

function optionsFromResult(result: ActionResult): AdminFieldOption[] {
  if (!result.ok || !Array.isArray(result.data)) return [];

  return result.data
    .map((raw) => {
      const row = asRecord(raw);
      const value = stringValue(row.id);
      const label = stringValue(row.name || row.title);
      return value && label ? { label, value } : null;
    })
    .filter((option): option is AdminFieldOption => option !== null);
}

async function loadRemoteOptions(
  kind: AdminEntityKind,
): Promise<Record<string, AdminFieldOption[]>> {
  if (kind === "products") {
    const [brands, categories] = await Promise.all([
      listBrandsAction(),
      listCategoriesAction(),
    ]);
    return {
      brandId: optionsFromResult(brands),
      categoryId: optionsFromResult(categories),
    };
  }

  if (kind === "posts") {
    const categories = await listPostCategoriesAction();
    return { categoryId: optionsFromResult(categories) };
  }

  if (kind === "promotions") {
    const products = await listProductsAction();
    return { productId: optionsFromResult(products) };
  }

  return {};
}

async function createRemote(
  kind: AdminEntityKind,
  values: Record<string, string | boolean>,
  mediaPath?: string,
): Promise<ActionResult> {
  switch (kind) {
    case "products":
      return createProductAction({
        name: String(values.name),
        slug: String(values.slug),
        sku: optionalText(values.sku),
        brandId: optionalText(values.brandId),
        categoryIds: optionalText(values.categoryId)
          ? [String(values.categoryId)]
          : undefined,
        shortDescription: optionalText(values.shortDescription),
        application: optionalText(values.application),
        finish: optionalText(values.finish),
        color: optionalText(values.color),
        packageSize: optionalText(values.packageSize),
        unit: optionalText(values.unit),
        price: optionalNumber(values.price),
        compareAtPrice: optionalNumber(values.compareAtPrice),
        costPrice: optionalNumber(values.costPrice),
        stockQuantity: optionalNumber(values.stockQuantity),
        isFeatured: Boolean(values.isFeatured),
        status: String(values.status) as "draft" | "published" | "archived",
        description: optionalText(values.description),
        publishedAt: optionalText(values.publishedAt),
        seoTitle: optionalText(values.seoTitle),
        seoDescription: optionalText(values.seoDescription),
        metadata:
          mediaPath || optionalText(values.mediaPath)
            ? {
                primaryImagePath:
                  mediaPath ?? String(optionalText(values.mediaPath)),
              }
            : undefined,
      });
    case "brands":
      return createBrandAction({
        name: String(values.name),
        slug: String(values.slug),
        description: optionalText(values.description),
        website: optionalText(values.website),
        displayOrder: optionalNumber(values.displayOrder),
        logoPath: mediaPath ?? optionalText(values.mediaPath),
        isActive: Boolean(values.isActive),
        isFeatured: Boolean(values.isFeatured),
        seoTitle: optionalText(values.seoTitle),
        seoDescription: optionalText(values.seoDescription),
      });
    case "promotions":
      return createPromotionAction({
        name: String(values.name),
        slug: String(values.slug),
        description: optionalText(values.description),
        badge: optionalText(values.badge),
        discountType: String(values.discountType) as
          | "percentage"
          | "fixed_amount",
        discountValue: optionalNumber(values.discountValue),
        bannerPath: mediaPath ?? optionalText(values.mediaPath),
        startsAt: String(values.startsAt),
        endsAt: String(values.endsAt),
        isActive: Boolean(values.isActive),
        status: String(values.status) as "draft" | "published" | "archived",
        products: optionalText(values.productId)
          ? [
              {
                productId: String(values.productId),
                promotionalPrice: optionalNumber(values.promotionalPrice),
              },
            ]
          : undefined,
        terms: optionalText(values.terms),
      });
    case "posts":
      return createPostAction({
        title: String(values.title),
        slug: String(values.slug),
        excerpt: optionalText(values.excerpt),
        content: String(values.content),
        coverImagePath: mediaPath ?? optionalText(values.mediaPath),
        status: String(values.status) as "draft" | "published" | "archived",
        publishedAt: optionalText(values.publishedAt),
        seoTitle: optionalText(values.seoTitle),
        seoDescription: optionalText(values.seoDescription),
        categoryIds: optionalText(values.categoryId)
          ? [String(values.categoryId)]
          : undefined,
      });
  }
}

async function updateRemote(
  kind: AdminEntityKind,
  id: string,
  values: Record<string, string | boolean>,
  mediaPath?: string,
): Promise<ActionResult> {
  switch (kind) {
    case "products":
      return updateProductAction(id, {
        name: String(values.name),
        slug: String(values.slug),
        sku: optionalText(values.sku),
        brandId: optionalText(values.brandId),
        categoryIds: optionalText(values.categoryId)
          ? [String(values.categoryId)]
          : undefined,
        shortDescription: optionalText(values.shortDescription),
        application: optionalText(values.application),
        finish: optionalText(values.finish),
        color: optionalText(values.color),
        packageSize: optionalText(values.packageSize),
        unit: optionalText(values.unit),
        price: optionalNumber(values.price),
        compareAtPrice: optionalNumber(values.compareAtPrice),
        costPrice: optionalNumber(values.costPrice),
        stockQuantity: optionalNumber(values.stockQuantity),
        isFeatured: Boolean(values.isFeatured),
        status: String(values.status) as "draft" | "published" | "archived",
        description: optionalText(values.description),
        publishedAt: optionalText(values.publishedAt),
        seoTitle: optionalText(values.seoTitle),
        seoDescription: optionalText(values.seoDescription),
        metadata:
          mediaPath || optionalText(values.mediaPath)
            ? {
                primaryImagePath:
                  mediaPath ?? String(optionalText(values.mediaPath)),
              }
            : undefined,
      });
    case "brands":
      return updateBrandAction(id, {
        name: String(values.name),
        slug: String(values.slug),
        description: optionalText(values.description),
        website: optionalText(values.website),
        displayOrder: optionalNumber(values.displayOrder),
        logoPath: mediaPath ?? optionalText(values.mediaPath),
        isActive: Boolean(values.isActive),
        isFeatured: Boolean(values.isFeatured),
        seoTitle: optionalText(values.seoTitle),
        seoDescription: optionalText(values.seoDescription),
      });
    case "promotions":
      return updatePromotionAction(id, {
        name: String(values.name),
        slug: String(values.slug),
        description: optionalText(values.description),
        badge: optionalText(values.badge),
        discountType: String(values.discountType) as
          | "percentage"
          | "fixed_amount",
        discountValue: optionalNumber(values.discountValue),
        bannerPath: mediaPath ?? optionalText(values.mediaPath),
        startsAt: String(values.startsAt),
        endsAt: String(values.endsAt),
        isActive: Boolean(values.isActive),
        status: String(values.status) as "draft" | "published" | "archived",
        products: optionalText(values.productId)
          ? [
              {
                productId: String(values.productId),
                promotionalPrice: optionalNumber(values.promotionalPrice),
              },
            ]
          : undefined,
        terms: optionalText(values.terms),
      });
    case "posts":
      return updatePostAction(id, {
        title: String(values.title),
        slug: String(values.slug),
        excerpt: optionalText(values.excerpt),
        content: String(values.content),
        coverImagePath: mediaPath ?? optionalText(values.mediaPath),
        status: String(values.status) as "draft" | "published" | "archived",
        publishedAt: optionalText(values.publishedAt),
        seoTitle: optionalText(values.seoTitle),
        seoDescription: optionalText(values.seoDescription),
        categoryIds: optionalText(values.categoryId)
          ? [String(values.categoryId)]
          : undefined,
      });
  }
}

async function deleteRemote(
  kind: AdminEntityKind,
  id: string,
): Promise<ActionResult> {
  switch (kind) {
    case "products":
      return deleteProductAction(id);
    case "brands":
      return deleteBrandAction(id);
    case "promotions":
      return deletePromotionAction(id);
    case "posts":
      return deletePostAction(id);
  }
}

function buildLocalItem(
  kind: AdminEntityKind,
  values: Record<string, string | boolean>,
  current?: AdminItem | null,
): AdminItem {
  const title = String(kind === "posts" ? values.title : values.name);
  let subtitle = "";
  let detail = "";
  let status = String(values.status || "draft");

  if (kind === "products") {
    subtitle = [values.brandId, values.application]
      .filter(Boolean)
      .join(" • ");
    detail = optionalNumber(values.price)
      ? currency(values.price)
      : "Preço sob consulta";
  } else if (kind === "brands") {
    subtitle = String(values.description || "Marca do catálogo");
    status = values.isActive ? "active" : "inactive";
    detail = `Ordem ${values.displayOrder || "0"}`;
  } else if (kind === "promotions") {
    subtitle =
      values.discountType === "percentage"
        ? `${values.discountValue || "0"}% de desconto`
        : `${currency(values.discountValue)} de desconto`;
    detail = values.endsAt
      ? `Até ${new Intl.DateTimeFormat("pt-BR").format(
          new Date(`${values.endsAt}T12:00:00`),
        )}`
      : "Sem data";
  } else {
    subtitle = String(values.categoryId || values.excerpt || "Artigo do blog");
    detail = values.publishedAt
      ? new Intl.DateTimeFormat("pt-BR").format(
          new Date(`${values.publishedAt}T12:00:00`),
        )
      : "Não publicado";
  }

  const featured =
    Boolean(values.isFeatured) ||
    (kind === "promotions" && Boolean(values.isActive));

  return {
    id: current?.id ?? `local-${kind}-${crypto.randomUUID()}`,
    title,
    subtitle,
    status,
    badge: featured ? (kind === "promotions" ? "Ativa" : "Destaque") : undefined,
    detail,
    updatedAt: "Agora",
    values,
  };
}

function FieldControl({
  field,
  value,
  error,
  onChange,
  onFileChange,
}: {
  field: AdminField;
  value: string | boolean | undefined;
  error?: string;
  onChange: (name: string, value: string | boolean) => void;
  onFileChange: (file: File | null) => void;
}) {
  const controlId = useId();
  const messageId = `${controlId}-${error ? "error" : "help"}`;
  const describedBy = error || field.help ? messageId : undefined;

  if (field.type === "checkbox") {
    return (
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
          value
            ? "border-blue-200 bg-blue-50/60"
            : "border-slate-200 bg-white hover:bg-slate-50",
        )}
      >
        <input
          aria-describedby={error ? messageId : undefined}
          aria-invalid={Boolean(error)}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(field.name, event.target.checked)}
          className="mt-0.5 size-4 rounded border-slate-300 text-blue-700 accent-blue-700"
        />
        <span className="text-sm font-semibold leading-5 text-slate-800">
          {field.label}
        </span>
        {error ? (
          <span id={messageId} className="text-xs font-medium text-red-600">
            {error}
          </span>
        ) : null}
      </label>
    );
  }

  if (field.type === "file") {
    return (
      <label className="group block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-blue-400 hover:bg-blue-50/40">
        <input
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="sr-only"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
        <UploadCloud className="mx-auto size-6 text-slate-400 transition group-hover:text-blue-700" />
        <span className="mt-2 block text-sm font-semibold text-slate-800">
          {typeof value === "string" && value
            ? value
            : "Escolha uma imagem ou arraste aqui"}
        </span>
        {field.help ? (
          <span
            id={error ? undefined : messageId}
            className="mt-1 block text-xs text-slate-500"
          >
            {field.help}
          </span>
        ) : null}
        {error ? (
          <span id={messageId} className="mt-1 block text-xs font-medium text-red-600">
            {error}
          </span>
        ) : null}
      </label>
    );
  }

  const baseClass = cn(
    "w-full rounded-xl border bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4",
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
      : "border-slate-200 focus:border-blue-600 focus:ring-blue-600/10",
    field.type === "textarea" ? "min-h-28 py-3 leading-6" : "h-11",
  );

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">
        {field.label}
        {field.required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      {field.type === "textarea" ? (
        <textarea
          id={controlId}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={baseClass}
          required={field.required}
        />
      ) : field.type === "select" ? (
        <select
          id={controlId}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          value={String(value ?? "")}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={baseClass}
          required={field.required}
        >
          <option value="">Selecione</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={controlId}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          type={field.type}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          min={field.min}
          step={field.step}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={baseClass}
          required={field.required}
        />
      )}
      {error ? (
        <span
          id={messageId}
          className="mt-1.5 block text-xs font-medium text-red-600"
        >
          {error}
        </span>
      ) : field.help ? (
        <span id={messageId} className="mt-1.5 block text-xs text-slate-500">
          {field.help}
        </span>
      ) : null}
    </label>
  );
}

export function AdminEntityManager({ kind }: AdminEntityManagerProps) {
  const config = entityConfigs[kind];
  const demoMode = !(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
  const storageKey = `mm-tintas-admin-${kind}`;
  const [items, setItems] = useState<AdminItem[]>(config.items);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminItem | null>(null);
  const [values, setValues] = useState<Record<string, string | boolean>>(() =>
    getInitialValues(kind),
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [relationOptions, setRelationOptions] = useState<
    Record<string, AdminFieldOption[]>
  >({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!demoMode);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const slugEdited = useRef(false);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    if (demoMode) {
      let active = true;

      async function hydrateLocalItems() {
        await Promise.resolve();
        if (!active) return;

        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          try {
            setItems(JSON.parse(saved) as AdminItem[]);
          } catch {
            window.localStorage.removeItem(storageKey);
          }
        }
        setStorageReady(true);
      }

      void hydrateLocalItems();
      return () => {
        active = false;
      };
    }

    let active = true;

    async function loadItems() {
      const [result, options] = await Promise.all([
        listRemote(kind),
        loadRemoteOptions(kind),
      ]);
      if (!active) return;

      if (result.ok && Array.isArray(result.data)) {
        setItems(result.data.map((row) => mapRemoteItem(kind, row)));
      } else {
        setRequestError(result.message);
      }
      setRelationOptions(options);
      setIsLoading(false);
    }

    void loadItems();
    return () => {
      active = false;
    };
  }, [demoMode, kind, storageKey]);

  useEffect(() => {
    if (demoMode && storageReady) {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [demoMode, items, storageKey, storageReady]);

  useEffect(() => {
    if (!isEditorOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !savingRef.current) {
        setIsEditorOpen(false);
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("hidden"));
      const first = focusable[0];
      const last = focusable.at(-1);

      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleEscape);
      previousFocusRef.current?.focus();
    };
  }, [isEditorOpen]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return items.filter((item) => {
      const matchesFilter = filter === "all" || item.status === filter;
      const matchesSearch =
        !term ||
        `${item.title} ${item.subtitle} ${item.detail ?? ""}`
          .toLocaleLowerCase("pt-BR")
          .includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [filter, items, search]);

  function openCreate() {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setEditingItem(null);
    setValues(getInitialValues(kind));
    setSelectedFile(null);
    setFieldErrors({});
    setRequestError(null);
    slugEdited.current = false;
    setIsEditorOpen(true);
  }

  function openEdit(item: AdminItem) {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setEditingItem(item);
    setValues({ ...getInitialValues(kind), ...item.values });
    setSelectedFile(null);
    setFieldErrors({});
    setRequestError(null);
    slugEdited.current = true;
    setIsEditorOpen(true);
  }

  function closeEditor() {
    if (isSaving) return;
    setIsEditorOpen(false);
  }

  function updateValue(name: string, value: string | boolean) {
    setValues((current) => {
      const next = { ...current, [name]: value };
      const titleField = kind === "posts" ? "title" : "name";

      if (name === "slug") {
        slugEdited.current = true;
      }

      if (name === titleField && !editingItem && !slugEdited.current) {
        next.slug = slugify(String(value));
      }

      return next;
    });

    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function handleFileChange(file: File | null) {
    if (file && file.size > 10 * 1024 * 1024) {
      setFieldErrors((current) => ({
        ...current,
        image: "A imagem deve ter no máximo 10 MB.",
      }));
      return;
    }

    setSelectedFile(file);
    const fileField = config.fields.find((field) => field.type === "file");
    if (fileField) {
      updateValue(fileField.name, file?.name ?? "");
    }
  }

  function handleBarcodeResolved(match: BarcodeProductMatch) {
    updateValue("sku", match.barcode);
    updateValue("name", match.name);

    if (!values.description && match.description) {
      updateValue("description", match.description);
    }

    if (match.brand) {
      const brand = relationOptions.brandId?.find(
        (option) =>
          option.label.toLocaleLowerCase("pt-BR") ===
          match.brand?.toLocaleLowerCase("pt-BR"),
      );
      if (brand) updateValue("brandId", brand.value);
    }

    if (match.category) {
      const externalCategory = match.category.toLocaleLowerCase("pt-BR");
      const category = relationOptions.categoryId?.find((option) =>
        externalCategory.includes(option.label.toLocaleLowerCase("pt-BR")),
      );
      if (category) updateValue("categoryId", category.value);
    }
  }

  function validate() {
    const errors: Record<string, string> = {};

    config.fields.forEach((field) => {
      if (
        field.required &&
        field.type !== "file" &&
        String(values[field.name] ?? "").trim() === ""
      ) {
        errors[field.name] = "Preencha este campo.";
      }
    });

    if (
      kind === "promotions" &&
      values.startsAt &&
      values.endsAt &&
      String(values.endsAt) < String(values.startsAt)
    ) {
      errors.endsAt = "O término deve ser posterior ao início.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function uploadSelectedMedia() {
    if (!selectedFile || demoMode) return undefined;

    const folder =
      kind === "products"
        ? "products"
        : kind === "brands"
          ? "brands"
          : kind === "posts"
            ? "posts"
            : "site";
    const data = new FormData();
    data.append("file", selectedFile);
    data.append("folder", folder);
    if (editingItem) data.append("entityId", editingItem.id);

    const result = await uploadMediaAction(data);
    if (!result.ok) throw new Error(result.message);
    return result.data.path;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestError(null);
    if (!validate()) return;

    setIsSaving(true);
    savingRef.current = true;

    try {
      if (demoMode) {
        const nextItem = buildLocalItem(kind, values, editingItem);
        setItems((current) =>
          editingItem
            ? current.map((item) =>
                item.id === editingItem.id ? nextItem : item,
              )
            : [nextItem, ...current],
        );
        setFeedback(
          `${config.singular[0].toUpperCase()}${config.singular.slice(1)} ${
            editingItem ? "atualizado" : "criado"
          } com sucesso.`,
        );
      } else {
        const mediaPath = await uploadSelectedMedia();
        const result = editingItem
          ? await updateRemote(kind, editingItem.id, values, mediaPath)
          : await createRemote(kind, values, mediaPath);

        if (!result.ok) {
          if (result.fieldErrors) {
            const errors = Object.fromEntries(
              Object.entries(result.fieldErrors).map(([key, messages]) => [
                key,
                messages[0],
              ]),
            );
            setFieldErrors(errors);
          }
          throw new Error(result.message);
        }

        const updated = mapRemoteItem(kind, result.data);
        setItems((current) =>
          editingItem
            ? current.map((item) =>
                item.id === editingItem.id ? updated : item,
              )
            : [updated, ...current],
        );
        setFeedback(result.message);
      }

      setIsEditorOpen(false);
      window.setTimeout(() => setFeedback(null), 4500);
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar. Tente novamente.",
      );
    } finally {
      setIsSaving(false);
      savingRef.current = false;
    }
  }

  async function handleDelete(item: AdminItem) {
    const confirmed = window.confirm(
      `Deseja realmente excluir “${item.title}”? Essa ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    setRequestError(null);

    try {
      if (!demoMode) {
        const result = await deleteRemote(kind, item.id);
        if (!result.ok) throw new Error(result.message);
        setFeedback(result.message);
      } else {
        setFeedback(`${item.title} foi removido da demonstração.`);
      }

      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
      window.setTimeout(() => setFeedback(null), 4500);
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o registro.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Gestão de conteúdo
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-[-0.025em] text-slate-950 sm:text-3xl">
            {config.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {config.description}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white shadow-lg shadow-blue-700/15 transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20"
        >
          <Plus className="size-4" />
          {config.createLabel}
        </button>
      </section>

      <section
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        aria-label={`Resumo de ${config.plural}`}
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">
            {kind === "brands" ? "Ativas" : "Publicados"}
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {
              items.filter((item) =>
                kind === "brands"
                  ? item.status === "active"
                  : item.status === "published",
              ).length
            }
          </p>
        </div>
        <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-1">
          <p className="text-xs font-medium text-slate-500">
            {kind === "brands" ? "Inativas" : "Rascunhos"}
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            {
              items.filter((item) =>
                kind === "brands"
                  ? item.status === "inactive"
                  : item.status === "draft",
              ).length
            }
          </p>
        </div>
      </section>

      {requestError && !isEditorOpen ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-bold">Não foi possível concluir a operação</p>
            <p className="mt-1">{requestError}</p>
          </div>
        </div>
      ) : null}

      {feedback ? (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[70] flex max-w-sm items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-2xl"
        >
          <span className="grid size-6 place-items-center rounded-full bg-emerald-500">
            <Check className="size-3.5" />
          </span>
          {feedback}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-lg">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              aria-label={`Buscar ${config.plural}`}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={config.searchPlaceholder}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <Filter className="mr-1 size-4 shrink-0 text-slate-400" />
            {[{ label: "Todos", value: "all" }, ...config.statusOptions].map(
              (option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  aria-pressed={filter === option.value}
                  className={cn(
                    "h-9 shrink-0 rounded-lg px-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                    filter === option.value
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                  )}
                >
                  {option.label}
                </button>
              ),
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid min-h-72 place-items-center">
            <div className="text-center text-sm text-slate-500">
              <LoaderCircle className="mx-auto mb-3 size-6 animate-spin text-blue-700" />
              Carregando {config.plural}…
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="grid min-h-72 place-items-center px-6 py-12 text-center">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                <Archive className="size-5" />
              </span>
              <h2 className="mt-4 text-base font-bold text-slate-900">
                Nenhum resultado encontrado
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Ajuste a busca ou crie um novo {config.singular}.
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white"
              >
                <Plus className="size-4" />
                {config.createLabel}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <th className="px-5 py-3.5">{config.singular}</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Informação</th>
                    <th className="px-5 py-3.5">Atualizado</th>
                    <th className="w-28 px-5 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-black text-slate-600">
                            {item.title.slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="max-w-xs truncate text-sm font-bold text-slate-900">
                                {item.title}
                              </p>
                              {item.badge ? (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                  {item.badge}
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 max-w-sm truncate text-xs text-slate-500">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset",
                            statusStyles[item.status] ??
                              "bg-slate-100 text-slate-600 ring-slate-500/15",
                          )}
                        >
                          <span className="size-1.5 rounded-full bg-current opacity-70" />
                          {statusLabels[item.status] ?? item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                        {item.detail}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {item.updatedAt}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                            aria-label={`Editar ${item.title}`}
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(item)}
                            disabled={deletingId === item.id}
                            className="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-50"
                            aria-label={`Excluir ${item.title}`}
                          >
                            {deletingId === item.id ? (
                              <LoaderCircle className="size-4 animate-spin" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {filteredItems.map((item) => (
                <article key={item.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-xs font-black text-slate-600">
                      {item.title.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {item.title}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {item.subtitle}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                            aria-label={`Editar ${item.title}`}
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(item)}
                            disabled={deletingId === item.id}
                            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                            aria-label={`Excluir ${item.title}`}
                          >
                            {deletingId === item.id ? (
                              <LoaderCircle className="size-4 animate-spin" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-1 text-[10px] font-bold ring-1 ring-inset",
                            statusStyles[item.status],
                          )}
                        >
                          {statusLabels[item.status] ?? item.status}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {item.detail}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Exibindo <strong className="text-slate-700">{filteredItems.length}</strong>{" "}
                de <strong className="text-slate-700">{items.length}</strong>{" "}
                {config.plural}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled
                  className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 disabled:opacity-40"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="grid size-8 place-items-center rounded-lg bg-slate-950 font-bold text-white">
                  1
                </span>
                <button
                  type="button"
                  disabled
                  className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 disabled:opacity-40"
                  aria-label="Próxima página"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {isEditorOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closeEditor();
          }}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="entity-editor-title"
            aria-describedby="entity-editor-description"
            className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
                  {editingItem ? "Editar registro" : "Novo cadastro"}
                </p>
                <h2
                  id="entity-editor-title"
                  className="mt-1 text-xl font-bold tracking-tight text-slate-950"
                >
                  {editingItem
                    ? `Editar ${config.singular}`
                    : config.createLabel}
                </h2>
                <p
                  id="entity-editor-description"
                  className="mt-1 text-xs text-slate-500"
                >
                  Campos marcados com asterisco são obrigatórios.
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeEditor}
                disabled={isSaving}
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                aria-label="Fechar formulário"
              >
                <X className="size-4" />
              </button>
            </header>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto px-5 py-6 sm:grid-cols-2 sm:px-7">
                {config.fields.map((field) => (
                  <div
                    key={field.name}
                    className={field.fullWidth ? "sm:col-span-2" : undefined}
                  >
                    {kind === "products" && field.name === "sku" ? (
                      <BarcodeProductField
                        value={String(values.sku ?? "")}
                        error={fieldErrors.sku}
                        onChange={(value) => updateValue("sku", value)}
                        onResolved={handleBarcodeResolved}
                      />
                    ) : (
                    <FieldControl
                      field={
                        relationOptions[field.name]
                          ? {
                              ...field,
                              options: relationOptions[field.name],
                            }
                          : field
                      }
                      value={
                        field.type === "file" && selectedFile
                          ? selectedFile.name
                          : values[field.name]
                      }
                      error={
                        fieldErrors[field.name] ??
                        (field.type === "file"
                          ? fieldErrors.image
                          : undefined)
                      }
                      onChange={updateValue}
                      onFileChange={handleFileChange}
                    />
                    )}
                  </div>
                ))}

                {requestError ? (
                  <div
                    role="alert"
                    className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:col-span-2"
                  >
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    {requestError}
                  </div>
                ) : null}

                {selectedFile ? (
                  <div className="flex items-center gap-3 rounded-xl bg-slate-100 p-3 sm:col-span-2">
                    <FileImage className="size-5 text-blue-700" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={isSaving}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20 disabled:pointer-events-none disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Salvando…
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      {editingItem ? "Salvar alterações" : "Criar e salvar"}
                    </>
                  )}
                </button>
              </footer>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
