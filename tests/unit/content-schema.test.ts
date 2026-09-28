import { describe, expect, it } from "vitest";

import { mockPublications } from "../fixtures/publications.mock";
import {
  educationSchema,
  publicationSchema,
  stableIdSchema,
} from "../../src/lib/content/schemas";
import { assertNoProductionMocks } from "../../src/lib/content/mock-guard";

describe("content schemas", () => {
  it("accepts a valid education entry", () => {
    expect(
      educationSchema.safeParse({
        id: "sjtu-undergraduate",
        title: "Undergraduate study",
        institution: "Shanghai Jiao Tong University",
        period: "2020-2024",
        detail: "Applied Mathematics",
        order: 10,
        updatedAt: "2026-09-28",
      }).success,
    ).toBe(true);
  });

  it("rejects unstable IDs and invalid links", () => {
    expect(stableIdSchema.safeParse("Changing ID").success).toBe(false);
    expect(
      educationSchema.safeParse({
        id: "entry",
        title: "Entry",
        institution: "Institution",
        period: "2026",
        detail: "Detail",
        order: 0,
        updatedAt: "2026-09-28",
        links: [{ label: "Broken", url: "not a URL" }],
      }).success,
    ).toBe(false);
  });

  it("validates publication kinds and statuses", () => {
    const valid = {
      id: "paper-one",
      title: "Paper One",
      authors: ["Example Author"],
      kind: "working-paper",
      status: "in-progress",
      updatedAt: "2026-09-28",
    };
    expect(publicationSchema.safeParse(valid).success).toBe(true);
    expect(
      publicationSchema.safeParse({ ...valid, status: "definitely-published" })
        .success,
    ).toBe(false);
  });
});

describe("production mock isolation", () => {
  it("fails a deliberate production mock import with a clear diagnostic", () => {
    expect(() => assertNoProductionMocks(mockPublications, true)).toThrow(
      /Production content includes mock publications: mock-journal-entry, .*mock-working-paper/,
    );
  });

  it("permits the same fixture in tests and development", () => {
    expect(() => assertNoProductionMocks(mockPublications, false)).not.toThrow();
  });
});
