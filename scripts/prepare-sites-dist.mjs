import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { force: true, recursive: true });
await mkdir("dist/server", { recursive: true });
await cp(".open-next", "dist/server", { recursive: true });
await cp(".open-next/worker.js", "dist/server/index.js");
await cp(".open-next/assets", "dist/client", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await cp(".openai/hosting.json", "dist/.openai/hosting.json");
await cp("wrangler.jsonc", "dist/server/wrangler.jsonc");
