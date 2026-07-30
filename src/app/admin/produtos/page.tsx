import type { Metadata } from "next";

import { AdminEntityManager } from "@/features/admin/components/admin-entity-manager";

export const metadata: Metadata = {
  title: "Produtos",
};

export default function AdminProductsPage() {
  return <AdminEntityManager kind="products" />;
}
