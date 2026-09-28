import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { inspectTemplate, templateMarkers } from "../../scripts/verify-template-boundary.mjs";

const temporaryRoots: string[] = [];

const createTemplate = async () => {
  const root = await mkdtemp(join(tmpdir(), "homepage-template-"));
  temporaryRoots.push(root);
  await mkdir(join(root, "src/content/publications"), { recursive: true });
  await writeFile(join(root, "README.md"), "A neutral starter site.\n");
  return root;
};

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("template privacy boundary", () => {
  it.each([
    ["owner-identity", "Manting Guo"],
    ["private-source-material", "cvfor_applied_math/cv.tex"],
    ["restricted-media", "Normal People"],
    ["private-api-url", "http://localhost:7332/private"],
  ])("reports the injected %s marker", async (id, marker) => {
    const root = await createTemplate();
    await writeFile(join(root, "README.md"), marker);
    expect((await inspectTemplate(root)).some((finding) => finding.startsWith(`${id}:`))).toBe(true);
  });

  it("rejects a mock publication in public content", async () => {
    const root = await createTemplate();
    await writeFile(join(root, "src/content/publications/example.yaml"), "mock: true\n");
    expect(await inspectTemplate(root)).toContain("mock-publication-as-real: src/content/publications/example.yaml");
  });

  it("keeps the marker catalog explicit", () => {
    expect(templateMarkers.map(({ id }) => id)).toEqual([
      "owner-identity",
      "private-source-material",
      "restricted-media",
      "private-api-url",
    ]);
  });
});
