const baseUrl = new URL(process.env.BASE_URL ?? "http://127.0.0.1:3000");
const requiredPaths = [
  "/",
  "/catalogo",
  "/marcas",
  "/promocoes",
  "/calculadora",
  "/blog",
  "/sobre",
  "/contato",
  "/privacidade",
  "/login",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
];

const sitemapResponse = await fetch(new URL("/sitemap.xml", baseUrl));
if (!sitemapResponse.ok) {
  throw new Error(`Sitemap returned ${sitemapResponse.status}`);
}

const sitemap = await sitemapResponse.text();
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => new URL(match[1]))
  .map((url) => `${url.pathname}${url.search}`);
const paths = [...new Set([...requiredPaths, ...sitemapUrls])];
const failures = [];

for (const path of paths) {
  const response = await fetch(new URL(path, baseUrl));
  if (!response.ok) {
    failures.push(`${path}: HTTP ${response.status}`);
  }
}

const adminResponse = await fetch(new URL("/admin", baseUrl), {
  redirect: "manual",
});
const adminLocation = adminResponse.headers.get("location") ?? "";
if (
  ![307, 308].includes(adminResponse.status) ||
  !adminLocation.includes("/login")
) {
  failures.push(
    `/admin: expected auth redirect, received ${adminResponse.status} ${adminLocation}`,
  );
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Smoke test passed for ${paths.length} public URLs and the admin auth boundary.`,
  );
}
