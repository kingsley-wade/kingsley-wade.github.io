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

  it("publishes share kinds and keeps Link metadata in details", () => {
    const link = {
      id: "os-guide",
      collection: "shares",
      data: {
        id: "os-guide",
        title: "OS guide",
        summary: "A useful guide.",
        kind: "link",
        source: "LinuxToy",
        sourceUrl: "https://i.linuxtoy.org/docs/guide/index.html",
        order: 1,
        links: [],
        tags: ["os"],
        visibility: "public",
        updatedAt: "2026-10-04",
      },
    } as SerializablePublicEntry;
    const note = {
      id: "local-note",
      collection: "shares",
      data: {
        id: "local-note",
        title: "Local note",
        kind: "note",
        order: 2,
        links: [],
        tags: [],
        visibility: "public",
        updatedAt: "2026-10-04",
      },
      rendered: { html: "<p>Markdown body</p>" },
    } as SerializablePublicEntry;

    expect(toPublicContentItem("playground", link).details).toEqual({
      kind: "link",
      source: "LinuxToy",
      sourceUrl: "https://i.linuxtoy.org/docs/guide/index.html",
    });
    expect(toPublicContentItem("playground", note)).toMatchObject({
      section: "playground",
      bodyHtml: "<p>Markdown body</p>",
      details: { kind: "note" },
    });
  });
});
