import { siteConfig } from "@/config/site";

export function getSafeBaseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return new URL(siteConfig.url);
  }
}

export function absoluteSiteUrl(path: string, siteUrl: string) {
  return new URL(path, getSafeBaseUrl(siteUrl)).toString();
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
