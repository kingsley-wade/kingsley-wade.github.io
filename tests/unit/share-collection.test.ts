import { describe, expect, it } from "vitest";

import { selectPublicShares } from "../../src/lib/content/share-collection";

describe("public share selection", () => {
  it("omits hidden entries and sorts public entries by owner order", () => {
    const selected = selectPublicShares([
      { id: "later", data: { visibility: "public" as const, order: 20 } },
      { id: "draft", data: { visibility: "hidden" as const, order: 0 } },
      { id: "first", data: { visibility: "public" as const, order: 10 } },
    ]);
    expect(selected.map(({ id }) => id)).toEqual(["first", "later"]);
  });
});
