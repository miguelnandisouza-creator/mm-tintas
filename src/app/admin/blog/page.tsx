import type { Metadata } from "next";

import { AdminEntityManager } from "@/features/admin/components/admin-entity-manager";

export const metadata: Metadata = {
  title: "Blog",
};

export default function AdminBlogPage() {
  return <AdminEntityManager kind="posts" />;
}
