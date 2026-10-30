import { expect, test, type Page } from "@playwright/test";

const openMenu = (page: Page) =>
  page.getByRole("button", { name: "FILES" }).click();

test("splash entry keeps the identity area in view", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "WELCOME IN" })).toBeVisible();
  await page.getByRole("button", { name: "ENTER MUTED" }).click();

  await expect(page.locator("[data-splash-gate]")).toBeHidden();
  const identityHeading = page.getByRole("heading", { name: "Manting Guo" });
  await expect(identityHeading).toBeVisible();
  await expect(page.locator('[data-section-panel="about"]')).toBeHidden();
  await expect(page.locator("[data-home-hint]")).toBeVisible();
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

  await openMenu(page);
  await page.getByRole("link", { name: /Education/ }).click();
  await expect(page).toHaveURL(/#education$/);
  await expect(page.locator('[data-section-panel="education"]')).toBeVisible();
  await expect(page.locator(".terminal-identity")).toBeHidden();

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

test("unknown section hashes fall back to the home screen", async ({ page }) => {
  await page.goto("/#not-a-section");
  await page.getByRole("button", { name: "ENTER MUTED" }).click();

  await expect(page).toHaveURL(/#home$/);
  await expect(page.locator('[data-section-panel="about"]')).toBeHidden();
  await expect(page.locator("[data-home-hint]")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute(
    "data-route-fallback",
    "#not-a-section",
  );

  await openMenu(page);
  await page.getByRole("link", { name: /Education/ }).click();
  await expect(page.locator('[data-section-panel="education"]')).toBeVisible();
});

test("publications groups by status and misc content is available", async ({ page }) => {
  await page.goto("/#publications");
  await page.getByRole("button", { name: "ENTER MUTED" }).click();

  const panel = page.locator('[data-section-panel="publications"]');
  await expect(panel.locator('[data-publication-group="published"]')).toContainText(
    "Biomolecular condensates",
  );
  await expect(panel.locator('[data-publication-group="under-review"]')).toContainText(
    "OpenReview",
  );
  await expect(panel.locator('[data-publication-group="preprint"]')).toContainText(
    "Subcube Partitions",
  );

  await openMenu(page);
  await page.getByRole("link", { name: /Life/ }).click();
  await expect(page.locator('[data-section-panel="life"]')).toContainText(
    "fingerstyle guitar",
  );
  await expect(page.locator('[data-section-panel="life"]')).toContainText(
    "Normal People",
  );
});

test("assistant status stays hidden without making a network request", async ({
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
  await expect(page.locator("[data-assistant-status]")).toHaveCount(0);
  expect(assistantRequests).toEqual([]);
});

test("playground terminal explores sections as a local filesystem", async ({ page }) => {
  await page.goto("/#playground");
  await page.getByRole("button", { name: "ENTER MUTED" }).click();

  await page.keyboard.press("Control+K");
  const terminal = page.locator("[data-terminal]");
  const input = terminal.locator("input[name=command]");
  await input.fill("ls");
  await input.press("Enter");
  await expect(terminal).toContainText("research/");

  await input.fill("cd lab");
  await input.press("Enter");
  await expect(page).toHaveURL(/#research$/);
  await expect(page.locator("[data-terminal-wrapper]")).toBeHidden();

  await page.keyboard.press("Control+K");
  await openMenu(page);
  await page.getByRole("link", { name: /Playground/ }).click();
  await input.fill("pwd");
  await input.press("Enter");
  await expect(terminal).toContainText("/playground$ pwd");
  await page.keyboard.press("Control+K");

  const note = page.locator('[data-share-id="example-markdown-note"]');
  const links = page.locator('[data-share-kind="link"]');
  await page.locator('[data-playground-card="reading"] > summary').click();
  await expect(note).toContainText("public example");
  await expect(links).toHaveCount(4);
  await expect(page.locator('[data-share-id="linuxtoy-os-guide"] a'))
    .toHaveAttribute("href", "https://i.linuxtoy.org/docs/guide/index.html");
  await expect(page.locator('[data-share-id="lmsys-blog"] a'))
    .toHaveAttribute("href", "https://www.lmsys.org/blog/");
  await expect(page.locator('[data-share-id="csdiy-guide"] a'))
    .toHaveAttribute("href", "https://csdiy.wiki/%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97/");
  await expect(page.locator('[data-share-id="lil-log"] a'))
    .toHaveAttribute("href", "https://lilianweng.github.io/");

  await page.keyboard.press("Control+K");
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
  await expect(page.locator("[data-terminal-wrapper]")).toBeHidden();
  await page.keyboard.press("Control+K");
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
  await expect(page.locator("[data-terminal-wrapper]")).toBeHidden();
  await page.keyboard.press("Control+K");
  await input.fill("cd ..");
  await input.press("Enter");
  await input.fill("pwd");
  await input.press("Enter");
  await expect(terminal).toContainText("guest@local:/$ pwd");

  await input.fill("cd playground/notes");
  await input.press("Enter");
  await expect(links.first()).toBeHidden();
  const readingCard = page.locator('[data-playground-card="reading"]');
  await readingCard.locator("> summary").click();
  await expect(readingCard).not.toHaveAttribute("open");
  await page.keyboard.press("Control+K");
  await openMenu(page);
  await page.getByRole("link", { name: /Education/ }).click();
  await openMenu(page);
  await page.getByRole("link", { name: /Playground/ }).click();
  await readingCard.locator("> summary").click();
  await expect(note).toBeHidden();
  await expect(links.first()).toBeVisible();
});

test("site terminal opens anywhere and navigates sections", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "ENTER MUTED" }).click();
  await expect(page.locator("[data-terminal-wrapper]")).toBeHidden();

  await page.keyboard.press("Control+K");
  await expect(page.locator("[data-terminal-wrapper]")).toBeVisible();

  const input = page.getByRole("textbox", { name: "Command" });
  await input.fill("cd research");
  await input.press("Enter");
  await expect(page).toHaveURL(/#research$/);
  await expect(page.locator("[data-terminal-prompt]")).toHaveText("guest@local:/research$");
  await expect(page.locator("[data-terminal-wrapper]")).toBeHidden();

  await page.keyboard.press("Control+K");
  await input.fill("cd ~");
  await input.press("Enter");
  await expect(page).toHaveURL(/#home$/);
  await expect(page.locator('[data-section-panel="research"]')).toBeHidden();
  await expect(page.locator("[data-home-hint]")).toBeVisible();
  await expect(page.locator(".terminal-identity")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.locator("[data-terminal-wrapper]")).toBeHidden();
});

test("motivation exe panel and terminal commands share state", async ({ page }) => {
  await page.goto("/#publications");
  await page.getByRole("button", { name: "ENTER MUTED" }).click();

  const panel = page.locator("[data-motivation]");
  await panel.scrollIntoViewIfNeeded();
  await expect(panel.locator(".motivation-exe__line")).toHaveCount(2);
  await expect(panel).toContainText("any new papers?");

  await panel.getByRole("button", { name: "Push Manting" }).click();
  await expect(panel).toContainText("[PUSHED MANTING] harder, please.");
  await expect(panel.locator(".motivation-exe__line")).toHaveCount(4);
  await expect(panel.locator("[data-motivation-status]")).toContainText("nudges: 1");

  await panel.getByRole("button", { name: "Ask Einstein" }).click();
  await expect(panel).toContainText("would you donate your brain");
  await expect(panel.locator("[data-motivation-status]")).toContainText(/\d+\.\d+%/);

  await page.keyboard.press("Control+K");
  const input = page.getByRole("textbox", { name: "Command" });
  await input.fill("ask einstein");
  await input.press("Enter");
  await expect(page.locator("[data-terminal]")).toContainText(
    /einstein's generosity: (6\.28|9\.42)%/,
  );
  await expect(panel.locator("[data-motivation-status]")).toContainText(/(6\.28|9\.42)%/);
});
