import { describe, expect, it } from "vitest";

import { sharesSchema } from "../../src/lib/content/schemas";
import { toShareLinkCard } from "../../src/lib/content/share-view";
import { representativeShareLinks } from "../fixtures/shares/links/representative-links";

describe("share link fixtures", () => {
  it("preserves representative external URL formats without network access", () => {
    for (const fixture of representativeShareLinks) {
      const parsed = sharesSchema.parse({
        ...fixture,
        order: 1,
        updatedAt: "2026-10-04",
      });
      expect(parsed.kind).toBe("link");
      if (parsed.kind === "link") {
        expect(parsed.sourceUrl).toBe(fixture.sourceUrl);
        expect(toShareLinkCard(parsed)).toEqual({
          id: fixture.id,
          kind: "link",
          title: fixture.title,
          summary: fixture.summary,
          ...("source" in fixture ? { source: fixture.source } : {}),
          href: fixture.sourceUrl,
        });
      }
    }
  });

  it("rejects non-http external URLs", () => {
    expect(() =>
      sharesSchema.parse({
        id: "bad-link",
        kind: "link",
        title: "Bad link",
        summary: "Invalid protocol",
        sourceUrl: "ftp://example.com/file",
        order: 1,
        updatedAt: "2026-10-04",
      }),
    ).toThrow();
  });
});
