import { mkdir, cp, writeFile, rm, lstat } from "node:fs/promises";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";
const root = new URL("../", import.meta.url);
const docs = new URL("docs/", root);
if (relative(fileURLToPath(root), fileURLToPath(docs)) !== "docs")
  throw new Error("Invalid generated directory");
const existing = await lstat(docs).catch(() => null);
if (existing?.isSymbolicLink())
  throw new Error("Generated docs must not be a link");
await rm(docs, { recursive: true, force: true });
await mkdir(new URL("docs/", root), { recursive: true });
await cp(new URL("dist/", root), new URL("docs/", root), { recursive: true });
await writeFile(new URL("docs/.nojekyll", root), "");
console.log(
  `GitHub Pages files ready: ${fileURLToPath(new URL("docs/", root))}`,
);
