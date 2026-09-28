import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("main experience has no serious or critical accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "ENTER MUTED" }).click();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );

  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
});

test("keyboard entry transfers focus to the primary menu", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-splash-gate]")).toBeHidden();
  await expect(page.locator('[data-section-link="about"]')).toBeFocused();
});
