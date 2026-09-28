import { gzipSync } from "node:zlib";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const root = resolve("dist");
const htmlPath = join(root, "index.html");
const apiPath = join(root, "api/v1/content.json");
const base = (process.env.BASE_URL ?? "/").replace(/^\/+|\/+$/g, "");

const fail = (message) => {
  console.error(`Build check failed: ${message}`);
  process.exitCode = 1;
};

const collectFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? collectFiles(path) : [path];
    }),
  );
  return nested.flat();
};

try {
  const html = await readFile(htmlPath, "utf8");
  const api = JSON.parse(await readFile(apiPath, "utf8"));
  const expectedItems = api.sections.flatMap((section) => section.items.map(({ id }) => id));
  const missingItems = expectedItems.filter((id) => !html.includes(`id="${id}"`));
  if (missingItems.length) fail(`content IDs missing from HTML: ${missingItems.join(", ")}`);
  if (api.schemaVersion !== "1.0") fail(`unexpected API schema ${api.schemaVersion}`);
  if (api.sections.length !== 6) fail(`expected 6 sections, found ${api.sections.length}`);

  const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map(([, value]) => value)
    .filter((value) => value && !/^(?:[a-z]+:|#|\/\/)/i.test(value));
  for (const asset of assets) {
    const pathname = decodeURIComponent(asset.split(/[?#]/, 1)[0]);
    const relativePath = base && pathname.startsWith(`/${base}/`)
      ? pathname.slice(base.length + 2)
      : pathname.replace(/^\//, "");
    if (!relativePath) continue;
    try {
      await stat(join(root, relativePath));
    } catch {
      fail(`local HTML asset does not exist: ${asset}`);
    }
  }

  const files = await collectFiles(root);
  const compressedBytes = await files.reduce(async (totalPromise, path) => {
    const total = await totalPromise;
    const pathname = relative(root, path).replaceAll("\\", "/");
    if (pathname.startsWith("audio/")) return total;
    const bytes = await readFile(path);
    return total + gzipSync(bytes).byteLength;
  }, Promise.resolve(0));
  if (compressedBytes > 1024 * 1024) {
    fail(`initial compressed output is ${(compressedBytes / 1024).toFixed(1)} KiB (budget 1024 KiB)`);
  }
  console.log(JSON.stringify({
    base: base ? `/${base}/` : "/",
    revision: api.revision,
    sections: api.sections.length,
    contentItems: expectedItems.length,
    compressedInitialKiB: Number((compressedBytes / 1024).toFixed(1)),
    budgetKiB: 1024,
  }, null, 2));
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
