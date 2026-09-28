import { describe, expect, it } from "vitest";

import { mockPublicationEntries } from "../fixtures/publications.mock";
import {
  groupPublicationViews,
  toPublicationView,
} from "../../src/lib/content/publication-view";

describe("publication view model", () => {
  it("renders all supported status labels", () => {
    expect(mockPublicationEntries.map(toPublicationView).map(({ statusLabel }) => statusLabel))
      .toEqual(["Published", "Accepted", "Under review", "In progress"]);
  });

  it("groups completed and active work", () => {
    const groups = groupPublicationViews(mockPublicationEntries);
    expect(groups.published).toHaveLength(2);
    expect(groups["work-in-progress"]).toHaveLength(2);
  });

  it("uses DOI first and tolerates missing DOI or URL", () => {
    expect(toPublicationView(mockPublicationEntries[0]).primaryUrl).toBe(
      "https://doi.org/10.0000/example.1",
    );
    expect(toPublicationView(mockPublicationEntries[1]).primaryUrl).toBe(
      "https://example.com/accepted",
    );
    expect(toPublicationView(mockPublicationEntries[2]).primaryUrl).toBeNull();
  });
});
