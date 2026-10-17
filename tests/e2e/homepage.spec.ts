import { expect, test } from "@playwright/test";

test("splash entry keeps the identity area in view", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "INSERT COIN" })).toBeVisible();
  await page.getByRole("button", { name: "ENTER MUTED" }).click();

  await expect(page.locator("[data-splash-gate]")).toBeHidden();
  const identityHeading = page.getByRole("heading", { name: "Manting Guo" });
  await expect(identityHeading).toBeVisible();
  await expect(page.locator("[data-audio-status]")).toContainText("Paused");
  const headingBounds = await identityHeading.boundingBox();
  expect(headingBounds?.y).toBeGreaterThanOrEqual(0);
  expect(headingBounds?.y).toBeLessThan(await page.evaluate(() => window.innerHeight));
});

test("section navigation supports hashes, keyboard, and browser history", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/#research");
  await page.getByRole("button", { name: "ENTER MUTED" }).click();
  await expect(page.locator('[data-section-panel="research"]')).toBeVisible();

  await page.getByRole("link", { name: /Education/ }).click();
  await expect(page).toHaveURL(/#education$/);
  await expect(page.locator('[data-section-panel="education"]')).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/#research$/);
  await expect(page.locator('[data-section-panel="research"]')).toBeVisible();

  await page.keyboard.press("5");
  await expect(page).toHaveURL(/#life$/);
  await expect(page.locator('[data-section-panel="life"]')).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.locator('[data-section-link="life"]')).toBeFocused();
  expect(pageErrors).toEqual([]);
});

test("unknown section hashes fall back to About Me", async ({ page }) => {
  await page.goto("/#not-a-section");
  await page.getByRole("button", { name: "ENTER MUTED" }).click();

  await expect(page).toHaveURL(/#about$/);
  await expect(page.locator('[data-section-panel="about"]')).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute(
    "data-route-fallback",
    "#not-a-section",
  );
});

test("publications shows its honest empty state and misc content is available", async ({
  page,
}) => {
  await page.goto("/#publications");
  await page.getByRole("button", { name: "ENTER MUTED" }).click();
  await expect(page.locator('[data-section-panel="publications"]')).toContainText(
    "Publications are being prepared.",
  );

  await page.getByRole("link", { name: /Life/ }).click();
  await expect(page.locator('[data-section-panel="life"]')).toContainText(
    "fingerstyle guitar",
  );
  await expect(page.locator('[data-section-panel="life"]')).toContainText(
    "Normal People",
  );
});

test("assistant remains offline without making a network request", async ({
  page,
}) => {
  const assistantRequests: string[] = [];
  page.on("request", (request) => {
    if (
      ["fetch", "xhr"].includes(request.resourceType()) &&
      request.url().includes("assistant")
    ) {
      assistantRequests.push(request.url());
    }
  });

  await page.goto("/#playground");
  await page.getByRole("button", { name: "ENTER MUTED" }).click();
  await expect(page.locator("[data-assistant-label]")).toHaveText(
    "assistant: offline / not configured",
  );
  await expect(page.locator("[data-assistant-status] input")).toHaveCount(0);
  expect(assistantRequests).toEqual([]);
});

test("playground terminal explores sections as a local filesystem", async ({ page }) => {
  await page.goto("/#playground");
  await page.getByRole("button", { name: "ENTER MUTED" }).click();

  const terminal = page.locator("[data-terminal]");
  const input = terminal.locator("input[name=command]");
  await input.fill("ls");
  await input.press("Enter");
  await expect(terminal).toContainText("research/");

  await input.fill("cd lab");
  await input.press("Enter");
  await expect(page).toHaveURL(/#research$/);

  await page.getByRole("link", { name: /Playground/ }).click();
  await input.fill("pwd");
  await input.press("Enter");
  await expect(terminal).toContainText("/playground$ pwd");

  const note = page.locator('[data-share-id="example-markdown-note"]');
  const links = page.locator('[data-share-kind="link"]');
  await expect(note).toContainText("public example");
  await expect(links).toHaveCount(4);
  await expect(page.locator('[data-link-card="linuxtoy-os-guide"] a'))
    .toHaveAttribute("href", "https://i.linuxtoy.org/docs/guide/index.html");
  await expect(page.locator('[data-share-id="external-markdown-guide"] a'))
    .toHaveAttribute("href", "https://example.com/notes/guide.md");
  await expect(page.locator('[data-share-id="arxiv-paper"] a'))
    .toHaveAttribute("href", "https://arxiv.org/abs/2401.00001");
  await expect(page.locator('[data-share-id="engineering-blog"] a'))
    .toHaveAttribute("href", "https://example.com/blog/engineering-notes");

  await input.fill("cd notes");
  await input.press("Enter");
  await expect(terminal).toContainText("moved to /playground/notes");
  await expect(note).toBeVisible();
  await expect(links.first()).toBeHidden();
  await input.fill("open example-markdown-note");
  await input.press("Enter");
  await expect(note).toBeFocused();

  await input.fill("cd ..");
  await input.press("Enter");
  await input.fill("cd links");
  await input.press("Enter");
  await expect(terminal).toContainText("moved to /playground/links");
  await expect(note).toBeHidden();
  await expect(links.first()).toBeVisible();
  await input.fill("open linuxtoy-os-guide");
  await input.press("Enter");
  await expect(page.locator('[data-share-id="linuxtoy-os-guide"]')).toBeFocused();

  await input.fill("cd ..");
  await input.press("Enter");
  await input.fill("cd ..");
  await input.press("Enter");
  await input.fill("pwd");
  await input.press("Enter");
  await expect(terminal).toContainText("guest@local:/$ pwd");

  await input.fill("cd playground/notes");
  await input.press("Enter");
  await expect(links.first()).toBeHidden();
  await page.getByRole("link", { name: /Education/ }).click();
  await page.getByRole("link", { name: /Playground/ }).click();
  await expect(note).toBeVisible();
  await expect(links.first()).toBeVisible();
});
