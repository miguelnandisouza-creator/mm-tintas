import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { force: true, recursive: true });
await cp(".open-next", "dist", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await cp(".openai/hosting.json", "dist/.openai/hosting.json");
await cp("wrangler.jsonc", "dist/wrangler.jsonc");
