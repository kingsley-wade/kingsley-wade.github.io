import { describe, expect, it } from "vitest";

import {
  toPublicContentItem,
  type SerializablePublicEntry,
} from "../../src/lib/content/public-content-model";

describe("public content serialization", () => {
  it("keeps stable IDs, rendered body and public fields", () => {
    const entry = {
      id: "research-item",
      collection: "research",
      data: {
        id: "research-item",
        title: "Research Item",
        summary: "Summary",
        period: "2026",
        role: "Investigator",
        order: 10,
        links: [{ label: "Record", url: "https://example.com/record" }],
        tags: ["math"],
        visibility: "public",
        updatedAt: "2026-09-28",
      },
      rendered: { html: "<p>Rendered body</p>" },
    } as SerializablePublicEntry;

    expect(toPublicContentItem("research", entry)).toEqual({
      id: "research-item",
      section: "research",
      title: "Research Item",
      summary: "Summary",
      bodyHtml: "<p>Rendered body</p>",
      links: [{ label: "Record", url: "https://example.com/record" }],
      tags: ["math"],
      visibility: "public",
      updatedAt: "2026-09-28",
      details: { period: "2026", role: "Investigator" },
    });
  });
});
