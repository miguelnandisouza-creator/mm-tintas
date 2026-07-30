import type { Metadata } from "next";

import { AdminEntityManager } from "@/features/admin/components/admin-entity-manager";

export const metadata: Metadata = {
  title: "Promoções",
};

export default function AdminPromotionsPage() {
  return <AdminEntityManager kind="promotions" />;
}
