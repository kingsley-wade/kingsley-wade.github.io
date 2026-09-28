import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const output = resolve(process.argv[2] ?? join(root, "template-dist"));
const omittedNames = new Set([
  ".git", ".astro", "node_modules", "dist", "coverage", "test-results",
  "playwright-report", "template-dist", "specs", "cvfor_applied_math",
]);
const omittedPaths = new Set([
  "docs/CONTENT_GUIDE.md",
  "docs/REFERENCE_COMPARISON.md",
  "docs/DEPLOYMENT.md",
  "TEMPLATE_UPSTREAM.md",
  "tests/e2e",
  "scripts/create-pixel-avatar.py",
  "scripts/create-guitar-samples.py",
  "scripts/create-theme-placeholder.py",
  "scripts/create-template-snapshot.mjs",
  "scripts/verify-template-boundary.mjs",
  "tests/unit/template-boundary.test.ts",
  "template-seed",
  "1.jpg",
  "idphoto.jpg",
]);

const copyTree = async (source, destination) => {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (omittedNames.has(entry.name) || entry.name.startsWith(".env.") && entry.name !== ".env.example") continue;
    const from = join(source, entry.name);
    const to = join(destination, entry.name);
    const path = relative(root, from).replaceAll("\\", "/");
    if (omittedPaths.has(path)) continue;
    if (entry.isDirectory()) await copyTree(from, to);
    else if (entry.name !== ".env") await cp(from, to);
  }
};

await rm(output, { recursive: true, force: true });
await copyTree(root, output);

const replace = async (path, value) => {
  const destination = join(output, path);
  await mkdir(join(destination, ".."), { recursive: true });
  await writeFile(destination, value);
};

const seed = join(root, "template-seed");
await replace("src/config/site.ts", await readFile(join(seed, "config/site.ts"), "utf8"));
await rm(join(output, "src/content"), { recursive: true, force: true });
await cp(join(seed, "content"), join(output, "src/content"), { recursive: true });
await rm(join(output, "public/images"), { recursive: true, force: true });
await mkdir(join(output, "public/images"), { recursive: true });
await cp(join(seed, "public/avatar-placeholder.svg"), join(output, "public/images/avatar-placeholder.svg"));

const avatarComponent = await readFile(join(output, "src/components/PixelPortrait.astro"), "utf8");
await replace(
  "src/components/PixelPortrait.astro",
  avatarComponent
    .replaceAll("images/avatar-pixel.webp", "images/avatar-placeholder.svg")
    .replaceAll("images/avatar-pixel@2x.webp", "images/avatar-placeholder.svg")
    .replace("width=\"384\"", "width=\"96\"")
    .replace("height=\"384\"", "height=\"96\"")
    .replace("Pixel portrait of Manting Guo", "Pixel avatar placeholder"),
);

for (const [path, replacements] of [
  ["src/components/SplashGate.astro", [["MANTING.GUO", "YOUR.NAME"]]],
  ["src/config/audio.ts", [["lalaland-theme", "personal-theme"], ["La La Land Theme", "Personal Theme"]]],
  ["astro.config.mjs", [["https://kingsley-wade.github.io", "https://example.github.io"]]],
]) {
  let content = await readFile(join(output, path), "utf8");
  for (const [search, value] of replacements) content = content.replaceAll(search, value);
  await replace(path, content);
}

const packageJson = JSON.parse(await readFile(join(output, "package.json"), "utf8"));
packageJson.name = "pixel-terminal-homepage";
await replace("package.json", `${JSON.stringify(packageJson, null, 2)}\n`);

const schemaTest = await readFile(join(output, "tests/unit/content-schema.test.ts"), "utf8");
await replace("tests/unit/content-schema.test.ts", schemaTest.replaceAll("sjtu-undergraduate", "example-degree"));

await replace(".env.example", `# Public settings only. Never put secrets in PUBLIC_* values.\nPUBLIC_SITE_URL=https://example.github.io\nBASE_URL=/\nPUBLIC_THEME_PRESET=classic-terminal\nPUBLIC_COMMIT_SHA=\nPUBLIC_ASSISTANT_API_BASE_URL=\nPUBLIC_BACKGROUND_AUDIO_URL=\nPUBLIC_BACKGROUND_AUDIO_TITLE=Personal Theme\nPUBLIC_BACKGROUND_AUDIO_ARTIST=Configured source\n`);
await replace(".gitignore", `node_modules/\n.venv/\ndist/\n.astro/\ncoverage/\nplaywright-report/\ntest-results/\n.env\n.env.*\n!.env.example\n/private/\n*.jpg\n*.jpeg\n*.png\n.DS_Store\n*.swp\n*.swo\n`);
const license = await readFile(join(output, "LICENSE"), "utf8");
await replace("LICENSE", license.replace(/Copyright \(c\) 2026 .*/, "Copyright (c) 2026 Your Name"));
const workflowPath = join(output, ".github/workflows/deploy-pages.yml");
const workflow = await readFile(workflowPath, "utf8");
await replace(workflowPath.slice(output.length + 1), workflow.replace("https://kingsley-wade.github.io", "https://${{ github.repository_owner }}.github.io"));
await replace("README.md", `# Pixel Terminal Homepage\n\nA customizable Astro personal homepage template for GitHub Pages or static VPS hosting.\n\n## Quick start\n\n\`\`\`sh\npnpm install --frozen-lockfile\npnpm dev\n\`\`\`\n\nEdit \`src/config/site.ts\`, \`.env\`, theme tokens, and Markdown/YAML files under \`src/content/\`. Add sections with manifests under \`src/modules/\`; see [Module Development](docs/MODULE_DEVELOPMENT.md).\n\nRun \`pnpm check\`, \`pnpm test\`, and \`pnpm build\`. Deployment and assistant boundaries are documented under \`docs/\`. Code is MIT licensed.\n`);
await replace("docs/DEPLOYMENT.md", `# Deployment\n\nBuild a static site for the GitHub Pages project path or a VPS root:\n\n\`\`\`sh\nBASE_URL=/your-repository/ PUBLIC_SITE_URL=https://your-name.github.io pnpm build\nBASE_URL=/ pnpm build\n\`\`\`\n\nUpload the generated \`dist/\` directory to GitHub Pages or a static web server. A VPS can serve it with Nginx or Caddy; no Node server is required at runtime. See \`README.md\` for local commands.\n`);
await replace("THIRD_PARTY_NOTICES.md", `# Third-Party Notices\n\nPress Start 2P and IBM Plex Mono are distributed under the SIL Open Font License 1.1. Their package notices are included with the corresponding Fontsource dependencies.\n\nThe bundled guitar samples and background placeholder are original generated assets distributed under this project's MIT license. Review any replacement media license before publishing.\n`);
console.log(`Created template snapshot at ${output}`);
