import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

export const templateMarkers = [
  { id: "owner-identity", pattern: /Manting Guo|MANTING\.GUO|kingsley-wade|kingsleyrex@sjtu\.edu\.cn/i },
  { id: "private-source-material", pattern: /cvfor_applied_math|(?:^|[\\/])1\.jpg|idphoto\.jpg/i },
  { id: "restricted-media", pattern: /La La Land|Normal People|lalaland-theme/i },
  { id: "private-api-url", pattern: /https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/(?:api|private|internal|owner)(?:\/|$)/i },
];

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const ignored = new Set(["node_modules", ".pnpm-store", "dist", ".astro", "coverage", "test-results"]);
  const children = await Promise.all(entries.map(async (entry) => {
    if (ignored.has(entry.name) || entry.isSymbolicLink()) return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }));
  return children.flat();
};

export const inspectTemplate = async (directory) => {
  const root = resolve(directory);
  const findings = [];
  for (const path of await walk(root)) {
    const text = await readFile(path, "utf8");
    for (const marker of templateMarkers) {
      if (marker.pattern.test(text)) {
        findings.push(`${marker.id}: ${relative(root, path)}`);
      }
    }
    if (relative(root, path).startsWith("src/content/") && /mock\s*:\s*true/.test(text)) {
      findings.push(`mock-publication-as-real: ${relative(root, path)}`);
    }
  }
  return [...new Set(findings)].sort();
};

const target = process.argv[2];
if (target) {
  const findings = await inspectTemplate(target);
  if (findings.length) {
    console.error(`Template privacy check failed:\n${findings.map((finding) => `- ${finding}`).join("\n")}`);
    process.exitCode = 1;
  } else {
    console.log(`Template privacy check passed: ${target}`);
  }
}
