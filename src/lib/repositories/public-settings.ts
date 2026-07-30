import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import { siteConfig } from "@/config/site";
import { PUBLIC_CACHE_TAGS } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";

export type PublicSiteSettings = {
  businessName: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  weekdayHours: string;
  saturdayHours: string;
  sundayHours: string;
  seoTitle: string;
  seoDescription: string;
  siteUrl: string;
  instagram: string;
  facebook: string;
  youtube: string;
  whatsappEnabled: boolean;
  pricesEnabled: boolean;
};

const defaults: PublicSiteSettings = {
  businessName: siteConfig.name,
  description: siteConfig.description,
  phone: "",
  whatsapp: siteConfig.whatsapp,
  email: siteConfig.email,
  address: "",
  neighborhood: "",
  city: siteConfig.city,
  state: siteConfig.region,
  postalCode: "",
  weekdayHours: "",
  saturdayHours: "",
  sundayHours: "",
  seoTitle: siteConfig.name,
  seoDescription: siteConfig.description,
  siteUrl: siteConfig.url,
  instagram: "",
  facebook: "",
  youtube: "",
  whatsappEnabled: Boolean(siteConfig.whatsapp),
  pricesEnabled: false,
};

function normalizeSettings(
  settings: PublicSiteSettings,
): PublicSiteSettings {
  const businessName = settings.businessName.trim() || defaults.businessName;
  const description = settings.description.trim() || defaults.description;

  return {
    ...settings,
    businessName,
    city: settings.city.trim() || defaults.city,
    description,
    seoDescription: settings.seoDescription.trim() || description,
    seoTitle: settings.seoTitle.trim() || businessName,
    siteUrl: settings.siteUrl.trim() || defaults.siteUrl,
    state: settings.state.trim() || defaults.state,
    whatsappEnabled:
      settings.whatsappEnabled && Boolean(settings.whatsapp.replace(/\D/g, "")),
  };
}

async function loadPublicSettings(): Promise<PublicSiteSettings> {
  const supabase = createPublicClient();
  if (!supabase) return normalizeSettings(defaults);

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("is_public", true)
    .in("key", [
      "business_profile",
      "contact_profile",
      "opening_hours",
      "seo_defaults",
      "social_and_features",
    ]);

  if (error || !data) return normalizeSettings(defaults);

  const values: Record<string, string | boolean> = { ...defaults };

  for (const row of data) {
    if (!row.value || typeof row.value !== "object" || Array.isArray(row.value)) {
      continue;
    }

    for (const [key, value] of Object.entries(row.value)) {
      if (
        key in defaults &&
        (typeof value === "string" || typeof value === "boolean")
      ) {
        values[key] = value;
      }
    }
  }

  return normalizeSettings(values as PublicSiteSettings);
}

const getCachedPublicSettings = unstable_cache(
  loadPublicSettings,
  ["mm-tintas-public-settings-v1"],
  {
    revalidate: 300,
    tags: [PUBLIC_CACHE_TAGS.settings],
  },
);

export const getPublicSettings = cache(getCachedPublicSettings);
