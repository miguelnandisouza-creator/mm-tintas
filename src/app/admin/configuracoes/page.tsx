import type { Metadata } from "next";

import { AdminSettingsForm } from "@/features/admin/components/admin-settings-form";

export const metadata: Metadata = {
  title: "Configurações",
};

export default function AdminSettingsPage() {
  return <AdminSettingsForm />;
}
