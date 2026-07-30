import type { Metadata } from "next";

import {
  listBrandsAction,
  listPostsAction,
  listProductsAction,
  listPromotionsAction,
} from "@/features/admin/actions";
import {
  DashboardOverview,
  type AdminDashboardData,
} from "@/features/admin/components/dashboard-overview";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Visão geral",
};

export default async function AdminDashboardPage() {
  const demoMode = !isSupabaseConfigured();

  if (demoMode) {
    return <DashboardOverview demoMode />;
  }

  const [products, brands, promotions, posts] = await Promise.all([
    listProductsAction(),
    listBrandsAction(),
    listPromotionsAction(),
    listPostsAction(),
  ]);

  let data: AdminDashboardData | null = null;

  if (products.ok && brands.ok && promotions.ok && posts.ok) {
    data = {
      products: products.data.length,
      publishedProducts: products.data.filter(
        (product) => product.status === "published",
      ).length,
      brands: brands.data.length,
      activeBrands: brands.data.filter((brand) => brand.is_active).length,
      promotions: promotions.data.length,
      activePromotions: promotions.data.filter(
        (promotion) =>
          promotion.is_active && promotion.status === "published",
      ).length,
      posts: posts.data.length,
      publishedPosts: posts.data.filter((post) => post.status === "published")
        .length,
    };
  }

  return <DashboardOverview data={data} demoMode={false} />;
}
