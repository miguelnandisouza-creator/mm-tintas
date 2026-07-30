export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "admin" | "editor" | "viewer";
export type PublicationStatus = "draft" | "published" | "archived";
export type DiscountType = "percentage" | "fixed_amount";
export type QuoteStatus =
  | "new"
  | "contacted"
  | "in_progress"
  | "converted"
  | "cancelled";

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type TableDefinition<
  Row,
  Insert,
  Update = Partial<Insert>,
  Relationships extends Relationship[] = [],
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

type ProfileRow = {
  active: boolean;
  avatar_path: string | null;
  created_at: string;
  full_name: string | null;
  id: string;
  phone: string | null;
  updated_at: string;
};

type UserRoleRow = {
  created_at: string;
  created_by: string | null;
  role: AppRole;
  user_id: string;
};

type BrandRow = {
  created_at: string;
  description: string | null;
  display_order: number;
  id: string;
  is_active: boolean;
  is_featured: boolean;
  logo_path: string | null;
  name: string;
  seo_description: string | null;
  seo_title: string | null;
  slug: string;
  updated_at: string;
  website: string | null;
};

type CategoryRow = {
  created_at: string;
  description: string | null;
  display_order: number;
  id: string;
  image_path: string | null;
  is_active: boolean;
  name: string;
  seo_description: string | null;
  seo_title: string | null;
  slug: string;
  updated_at: string;
};

type ProductRow = {
  application: string | null;
  brand_id: string | null;
  color: string | null;
  compare_at_price: number | null;
  cost_price: number | null;
  created_at: string;
  deleted_at: string | null;
  description: string | null;
  finish: string | null;
  id: string;
  is_featured: boolean;
  metadata: Json;
  name: string;
  package_size: string | null;
  price: number | null;
  published_at: string | null;
  seo_description: string | null;
  seo_title: string | null;
  short_description: string | null;
  sku: string | null;
  slug: string;
  status: PublicationStatus;
  stock_quantity: number | null;
  unit: string;
  updated_at: string;
};

type PublicProductRow = Omit<
  ProductRow,
  "cost_price" | "metadata" | "stock_quantity"
>;

type ProductImageRow = {
  alt_text: string | null;
  created_at: string;
  display_order: number;
  height: number | null;
  id: string;
  is_primary: boolean;
  mime_type: string | null;
  product_id: string;
  storage_path: string;
  width: number | null;
};

type ProductCategoryRow = {
  category_id: string;
  created_at: string;
  product_id: string;
};

type PromotionRow = {
  badge: string | null;
  banner_path: string | null;
  created_at: string;
  deleted_at: string | null;
  description: string | null;
  discount_type: DiscountType | null;
  discount_value: number | null;
  ends_at: string;
  id: string;
  is_active: boolean;
  name: string;
  published_at: string | null;
  slug: string;
  starts_at: string;
  status: PublicationStatus;
  terms: string | null;
  updated_at: string;
};

type PromotionProductRow = {
  created_at: string;
  product_id: string;
  promotional_price: number | null;
  promotion_id: string;
};

type QuoteRequestRow = {
  assigned_to: string | null;
  city: string | null;
  contacted_at: string | null;
  converted_at: string | null;
  created_at: string;
  customer_name: string;
  email: string | null;
  estimated_total: number | null;
  id: string;
  marketing_consent: boolean;
  message: string | null;
  neighborhood: string | null;
  phone: string;
  privacy_consent: boolean;
  protocol: string;
  source: string;
  status: QuoteStatus;
  updated_at: string;
};

type QuoteItemRow = {
  created_at: string;
  id: string;
  notes: string | null;
  product_id: string | null;
  product_name: string;
  quantity: number;
  quote_request_id: string;
  unit: string;
};

type PostCategoryRow = {
  created_at: string;
  description: string | null;
  display_order: number;
  id: string;
  name: string;
  slug: string;
  updated_at: string;
};

type PostTagRow = {
  created_at: string;
  id: string;
  name: string;
  slug: string;
};

type PostRow = {
  author_id: string | null;
  content: string;
  cover_image_path: string | null;
  created_at: string;
  deleted_at: string | null;
  excerpt: string | null;
  id: string;
  published_at: string | null;
  seo_description: string | null;
  seo_title: string | null;
  slug: string;
  status: PublicationStatus;
  title: string;
  updated_at: string;
};

type PostCategoryAssignmentRow = {
  category_id: string;
  created_at: string;
  post_id: string;
};

type PostTagAssignmentRow = {
  created_at: string;
  post_id: string;
  tag_id: string;
};

type SiteSettingRow = {
  created_at: string;
  description: string | null;
  is_public: boolean;
  key: string;
  setting_group: string;
  updated_at: string;
  updated_by: string | null;
  value: Json;
};

type AuditLogRow = {
  action: string;
  actor_id: string | null;
  created_at: string;
  id: number;
  new_data: Json | null;
  old_data: Json | null;
  record_id: string | null;
  table_name: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDefinition<
        ProfileRow,
        Partial<Omit<ProfileRow, "id">> & Pick<ProfileRow, "id">,
        Partial<Omit<ProfileRow, "id">>,
        []
      >;
      user_roles: TableDefinition<
        UserRoleRow,
        Partial<Omit<UserRoleRow, "user_id" | "role">> &
          Pick<UserRoleRow, "user_id" | "role">,
        Partial<UserRoleRow>,
        [
          {
            foreignKeyName: "user_roles_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
      brands: TableDefinition<
        BrandRow,
        Partial<Omit<BrandRow, "name" | "slug">> &
          Pick<BrandRow, "name" | "slug">
      >;
      categories: TableDefinition<
        CategoryRow,
        Partial<Omit<CategoryRow, "name" | "slug">> &
          Pick<CategoryRow, "name" | "slug">
      >;
      products: TableDefinition<
        ProductRow,
        Partial<Omit<ProductRow, "name" | "slug">> &
          Pick<ProductRow, "name" | "slug">,
        Partial<ProductRow>,
        [
          {
            foreignKeyName: "products_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          },
        ]
      >;
      product_images: TableDefinition<
        ProductImageRow,
        Partial<
          Omit<ProductImageRow, "product_id" | "storage_path">
        > &
          Pick<ProductImageRow, "product_id" | "storage_path">,
        Partial<ProductImageRow>,
        [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ]
      >;
      product_categories: TableDefinition<
        ProductCategoryRow,
        Partial<Omit<ProductCategoryRow, "product_id" | "category_id">> &
          Pick<ProductCategoryRow, "product_id" | "category_id">,
        Partial<ProductCategoryRow>,
        [
          {
            foreignKeyName: "product_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_categories_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ]
      >;
      promotions: TableDefinition<
        PromotionRow,
        Partial<Omit<PromotionRow, "name" | "slug" | "starts_at" | "ends_at">> &
          Pick<PromotionRow, "name" | "slug" | "starts_at" | "ends_at">
      >;
      promotion_products: TableDefinition<
        PromotionProductRow,
        Partial<
          Omit<PromotionProductRow, "promotion_id" | "product_id">
        > &
          Pick<PromotionProductRow, "promotion_id" | "product_id">,
        Partial<PromotionProductRow>,
        [
          {
            foreignKeyName: "promotion_products_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "promotion_products_promotion_id_fkey";
            columns: ["promotion_id"];
            isOneToOne: false;
            referencedRelation: "promotions";
            referencedColumns: ["id"];
          },
        ]
      >;
      quote_requests: TableDefinition<
        QuoteRequestRow,
        Partial<
          Omit<
            QuoteRequestRow,
            "customer_name" | "phone" | "privacy_consent"
          >
        > &
          Pick<
            QuoteRequestRow,
            "customer_name" | "phone" | "privacy_consent"
          >,
        Partial<QuoteRequestRow>,
        [
          {
            foreignKeyName: "quote_requests_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
      quote_items: TableDefinition<
        QuoteItemRow,
        Partial<
          Omit<QuoteItemRow, "quote_request_id" | "product_name">
        > &
          Pick<QuoteItemRow, "quote_request_id" | "product_name">,
        Partial<QuoteItemRow>,
        [
          {
            foreignKeyName: "quote_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quote_items_quote_request_id_fkey";
            columns: ["quote_request_id"];
            isOneToOne: false;
            referencedRelation: "quote_requests";
            referencedColumns: ["id"];
          },
        ]
      >;
      post_categories: TableDefinition<
        PostCategoryRow,
        Partial<Omit<PostCategoryRow, "name" | "slug">> &
          Pick<PostCategoryRow, "name" | "slug">
      >;
      post_tags: TableDefinition<
        PostTagRow,
        Partial<Omit<PostTagRow, "name" | "slug">> &
          Pick<PostTagRow, "name" | "slug">
      >;
      posts: TableDefinition<
        PostRow,
        Partial<Omit<PostRow, "title" | "slug" | "content">> &
          Pick<PostRow, "title" | "slug" | "content">,
        Partial<PostRow>,
        [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
      post_category_assignments: TableDefinition<
        PostCategoryAssignmentRow,
        Partial<
          Omit<PostCategoryAssignmentRow, "post_id" | "category_id">
        > &
          Pick<PostCategoryAssignmentRow, "post_id" | "category_id">,
        Partial<PostCategoryAssignmentRow>,
        [
          {
            foreignKeyName: "post_category_assignments_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "post_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_category_assignments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ]
      >;
      post_tag_assignments: TableDefinition<
        PostTagAssignmentRow,
        Partial<Omit<PostTagAssignmentRow, "post_id" | "tag_id">> &
          Pick<PostTagAssignmentRow, "post_id" | "tag_id">,
        Partial<PostTagAssignmentRow>,
        [
          {
            foreignKeyName: "post_tag_assignments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_tag_assignments_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "post_tags";
            referencedColumns: ["id"];
          },
        ]
      >;
      site_settings: TableDefinition<
        SiteSettingRow,
        Partial<Omit<SiteSettingRow, "key" | "value">> &
          Pick<SiteSettingRow, "key" | "value">,
        Partial<SiteSettingRow>,
        [
          {
            foreignKeyName: "site_settings_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
      audit_logs: TableDefinition<
        AuditLogRow,
        Partial<Omit<AuditLogRow, "action" | "table_name">> &
          Pick<AuditLogRow, "action" | "table_name">,
        Partial<AuditLogRow>,
        [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
    };
    Views: {
      public_products: {
        Row: PublicProductRow;
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      can_manage_content: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      generate_quote_protocol: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      has_role: {
        Args: { required_role: AppRole };
        Returns: boolean;
      };
      is_post_public: {
        Args: { target_post_id: string };
        Returns: boolean;
      };
      is_product_public: {
        Args: { target_product_id: string };
        Returns: boolean;
      };
      is_promotion_public: {
        Args: { target_promotion_id: string };
        Returns: boolean;
      };
      is_staff: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      submit_quote_request: {
        Args: { payload: Json };
        Returns: { id: string; protocol: string }[];
      };
    };
    Enums: {
      app_role: AppRole;
      discount_type: DiscountType;
      publication_status: PublicationStatus;
      quote_status: QuoteStatus;
    };
    CompositeTypes: Record<never, never>;
  };
};

type PublicSchema = Database["public"];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Omit<Database, "__InternalSupabase"> },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Omit<Database, "__InternalSupabase">;
  }
    ? keyof Omit<Database, "__InternalSupabase">[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends {
  schema: keyof Omit<Database, "__InternalSupabase">;
}
  ? Omit<Database, "__InternalSupabase">[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Row: infer Row;
    }
    ? Row
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Row: infer Row;
      }
      ? Row
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Omit<Database, "__InternalSupabase"> },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Omit<Database, "__InternalSupabase">;
  }
    ? keyof Omit<Database, "__InternalSupabase">[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends {
  schema: keyof Omit<Database, "__InternalSupabase">;
}
  ? Omit<Database, "__InternalSupabase">[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer Insert;
    }
    ? Insert
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer Insert;
      }
      ? Insert
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Omit<Database, "__InternalSupabase"> },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Omit<Database, "__InternalSupabase">;
  }
    ? keyof Omit<Database, "__InternalSupabase">[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends {
  schema: keyof Omit<Database, "__InternalSupabase">;
}
  ? Omit<Database, "__InternalSupabase">[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer Update;
    }
    ? Update
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer Update;
      }
      ? Update
      : never
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "viewer"],
      discount_type: ["percentage", "fixed_amount"],
      publication_status: ["draft", "published", "archived"],
      quote_status: [
        "new",
        "contacted",
        "in_progress",
        "converted",
        "cancelled",
      ],
    },
  },
} as const;
