import type { Metadata } from "next";

import { AdminEntityManager } from "@/features/admin/components/admin-entity-manager";

export const metadata: Metadata = {
  title: "Marcas",
};

export default function AdminBrandsPage() {
  return <AdminEntityManager kind="brands" />;
}
