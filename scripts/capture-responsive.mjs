import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { chromium } from "@playwright/test";

const viewports = [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
];
const output = "tests/e2e/screenshots";
await mkdir(output, { recursive: true });

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

const server = process.env.SCREENSHOT_URL
  ? null
  : createServer(async (request, response) => {
      const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
      const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      const filePath = normalize(join("dist", relative));
      if (!filePath.startsWith("dist/")) {
        response.writeHead(403).end();
        return;
      }
      try {
        const body = await readFile(filePath);
        response.writeHead(200, {
          "content-type": contentTypes[extname(filePath)] ?? "application/octet-stream",
        });
        response.end(body);
      } catch {
        response.writeHead(404).end();
      }
    });

if (server) {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
}
const address = server?.address();
const targetUrl =
  process.env.SCREENSHOT_URL ??
  `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}/`;

const browser = await chromium.launch();
const page = await browser.newPage();

for (const viewport of viewports) {
  await page.setViewportSize(viewport);
  await page.goto(targetUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const size = `${viewport.width}x${viewport.height}`;
  await page.screenshot({ path: `${output}/${size}-splash.png` });
  await page.getByRole("button", { name: "ENTER MUTED" }).click();
  await page.screenshot({ path: `${output}/${size}-main.png` });

  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    activePanels: document.querySelectorAll(
      '[data-section-panel][data-active="true"]',
    ).length,
    sectionHeadings: document.querySelectorAll("[data-section-panel] h2").length,
  }));
  if (metrics.scrollWidth > metrics.clientWidth) {
    throw new Error(`${size}: horizontal overflow ${JSON.stringify(metrics)}`);
  }
  if (metrics.activePanels !== 1 || metrics.sectionHeadings !== 6) {
    throw new Error(`${size}: invalid section state ${JSON.stringify(metrics)}`);
  }
  console.log(`${size}: ${JSON.stringify(metrics)}`);
}

await browser.close();
if (server) await new Promise((resolve) => server.close(resolve));
