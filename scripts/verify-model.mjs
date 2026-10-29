import { build } from "esbuild";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const output = new URL(
  "../../../work/verify-campus-model.mjs",
  import.meta.url,
);
await mkdir(new URL("./", output), { recursive: true });
await build({
  entryPoints: [
    fileURLToPath(new URL("../src/model.test.ts", import.meta.url)),
  ],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: fileURLToPath(output),
  logLevel: "silent",
});
await import(output.href);
