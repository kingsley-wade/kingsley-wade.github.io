import { describe, expect, it } from "vitest";

import type { SectionManifest } from "../../src/core/section-contract";
import {
  createSectionRegistry,
  sectionRegistry,
} from "../../src/core/section-registry";

const manifest = (overrides: Partial<SectionManifest> = {}): SectionManifest => ({
  id: "example",
  label: "Example",
  order: 10,
  kind: "content",
  contentCollection: "example",
  renderer: "default",
  audioScale: "c-major",
  visibility: "public",
  ...overrides,
});

const modules = (...manifests: SectionManifest[]) =>
  Object.fromEntries(
    manifests.map((entry, index) => [`module-${index}`, { default: entry }]),
  );

describe("section registry", () => {
  it("auto-discovers the six public modules in deterministic order", () => {
    expect(sectionRegistry.map(({ id }) => id)).toEqual([
      "about",
      "education",
      "research",
      "publications",
      "life",
      "playground",
    ]);
  });

  it("sorts manifests and filters hidden sections", () => {
    const registry = createSectionRegistry(
      modules(
        manifest({ id: "second", order: 20 }),
        manifest({ id: "hidden", order: 30, visibility: "hidden" }),
        manifest({ id: "first", order: 10 }),
      ),
    );
    expect(registry.map(({ id }) => id)).toEqual(["first", "second"]);
  });

  it("rejects duplicate IDs", () => {
    expect(() =>
      createSectionRegistry(
        modules(manifest(), manifest({ order: 20 })),
      ),
    ).toThrow(/duplicate id "example"/);
  });

  it("rejects duplicate orders", () => {
    expect(() =>
      createSectionRegistry(
        modules(manifest(), manifest({ id: "another" })),
      ),
    ).toThrow(/duplicate order 10/);
  });

  it("rejects missing or unknown renderers", () => {
    const invalid = manifest({ renderer: "missing" as SectionManifest["renderer"] });
    expect(() => createSectionRegistry(modules(invalid))).toThrow(
      /unknown renderer "missing"/,
    );
  });

  it("rejects unknown audio scales", () => {
    const invalid = manifest({
      audioScale: "unknown" as SectionManifest["audioScale"],
    });
    expect(() => createSectionRegistry(modules(invalid))).toThrow(
      /unknown audio scale "unknown"/,
    );
  });

  it.each([
    ["invalid id", { id: "Invalid ID" }, /invalid section id/],
    ["empty label", { label: "" }, /label is required/],
    ["negative order", { order: -1 }, /non-negative integer/],
    ["unknown kind", { kind: "other" }, /unknown section kind/],
    ["unknown visibility", { visibility: "private" }, /unknown visibility/],
    [
      "missing content collection",
      { contentCollection: undefined },
      /content sections require contentCollection/,
    ],
    ["unknown command", { terminalCommands: ["sudo"] }, /unknown terminal command/],
  ] as const)("rejects %s", (_label, override, expected) => {
    expect(() =>
      createSectionRegistry(
        modules(manifest(override as unknown as Partial<SectionManifest>)),
      ),
    ).toThrow(expected);
  });
});
