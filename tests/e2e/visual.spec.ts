import { expect, test } from "@playwright/test";

const viewports = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

test("all approved viewports fit without horizontal overflow", async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.getByRole("button", { name: "ENTER MUTED" }).click();
    await expect(page.locator("[data-section-panel='about']")).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(dimensions.documentWidth, JSON.stringify({ viewport, ...dimensions })).toBeLessThanOrEqual(
      dimensions.viewportWidth,
    );
    await expect(page.getByRole("navigation", { name: "Primary sections" })).toBeVisible();
    await expect(page.locator("[data-audio-controls]")).toBeVisible();
  }
});

test("reduced motion disables decorative animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const duration = await page.locator("[data-splash-gate] h1").evaluate((element) =>
    getComputedStyle(element).animationDuration,
  );
  expect(duration).toBe("1e-05s");
});
