import { expect, test } from "@playwright/test";

test("sound preference controls the persistent background track", async ({
  page,
}) => {
  const trackRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("theme-placeholder.ogg")) {
      trackRequests.push(request.url());
    }
  });
  await page.goto("/");
  await page.getByRole("button", { name: "ENTER MUTED" }).click();

  const player = page.locator("[data-audio-controls]");
  await expect(player).toContainText("Pastel Waltz (Original Placeholder)");
  await expect(player.locator("[data-audio-status]")).toContainText("Paused");

  await page.getByRole("button", { name: "Unmute background music" }).click();
  await page.getByRole("button", { name: "Play background music" }).click();
  await expect(page.getByRole("button", { name: "Pause background music" })).toBeVisible();
  await expect.poll(() => trackRequests.length).toBe(1);

  await page.getByRole("link", { name: /Research/ }).click();
  await expect(page.getByRole("button", { name: "Pause background music" })).toBeVisible();
  expect(trackRequests).toHaveLength(1);

  await page.getByRole("button", { name: "Mute background music" }).click();
  await expect(page.getByRole("button", { name: "Unmute background music" })).toBeVisible();
});

test("playground terminal executes a whitelist and treats input as text", async ({
  page,
}) => {
  await page.goto("/#playground");
  await page.getByRole("button", { name: "ENTER MUTED" }).click();

  const input = page.getByRole("textbox", { name: "Command" });
  const output = page.locator("[data-terminal-output]");
  await input.fill(" HELP ");
  await input.press("Enter");
  await expect(output).toContainText("help     list commands");

  await input.fill("<img src=x onerror=alert(1)>");
  await input.press("Enter");
  await expect(output).toContainText("command not found");
  await expect(output.locator("img")).toHaveCount(0);

  await expect(input).toHaveAttribute("maxlength", "80");
  await input.fill("x".repeat(80));
  expect(await input.inputValue()).toHaveLength(80);
  await input.press("Enter");
  await expect(output).toContainText("command not found");

  await input.fill("clear");
  await input.press("Enter");
  await expect(output.locator("li")).toHaveCount(0);
});
