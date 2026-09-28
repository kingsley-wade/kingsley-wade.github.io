import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createSectionRouter,
  sectionIdFromHash,
  type RouteAdapter,
  type SectionRoute,
} from "../../src/lib/navigation/router";

const routes: SectionRoute[] = [
  { id: "about", label: "About Me" },
  { id: "education", label: "Education" },
  { id: "research", label: "Research" },
  { id: "publications", label: "Publications" },
  { id: "life", label: "Misc 01 / Life" },
  { id: "playground", label: "Misc 02 / Playground" },
];

const createAdapter = (initialHash = "#about") => {
  let hash = initialHash;
  const calls = {
    applied: [] as string[],
    focusedPanels: [] as string[],
    focusedMenus: [] as string[],
    titles: [] as string[],
    pushes: [] as string[],
    replacements: [] as string[],
    fallbacks: [] as string[],
  };
  const adapter: RouteAdapter = {
    readHash: () => hash,
    pushHash: (next) => {
      hash = next;
      calls.pushes.push(next);
    },
    replaceHash: (next) => {
      hash = next;
      calls.replacements.push(next);
    },
    applyActive: (id) => calls.applied.push(id),
    focusPanel: (id) => calls.focusedPanels.push(id),
    focusMenu: (id) => calls.focusedMenus.push(id),
    setTitle: (label) => calls.titles.push(label),
    reportFallback: (invalid) => calls.fallbacks.push(invalid),
  };
  return { adapter, calls, setHash: (next: string) => (hash = next) };
};

describe("section router", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("normalizes hash values", () => {
    expect(sectionIdFromHash("#Research")).toBe("research");
    expect(sectionIdFromHash("#misc%2001")).toBe("misc 01");
  });

  it("initializes from a deep link", () => {
    const { adapter, calls } = createAdapter("#research");
    const router = createSectionRouter(routes, adapter);
    expect(router.activeId).toBe("research");
    expect(calls.applied).toEqual(["research"]);
    expect(calls.titles).toEqual(["Research"]);
  });

  it("uses replaceState for empty and unknown hashes", () => {
    const empty = createAdapter("");
    expect(createSectionRouter(routes, empty.adapter).activeId).toBe("about");
    expect(empty.calls.replacements).toEqual(["#about"]);

    const unknown = createAdapter("#missing");
    expect(createSectionRouter(routes, unknown.adapter).activeId).toBe("about");
    expect(unknown.calls.fallbacks).toEqual(["#missing"]);
    expect(unknown.calls.replacements).toEqual(["#about"]);
  });

  it("uses the same selection path for pointer activation", () => {
    const { adapter, calls } = createAdapter();
    const router = createSectionRouter(routes, adapter);
    expect(router.select("education")).toBe(true);
    expect(calls.pushes).toEqual(["#education"]);
    expect(calls.focusedPanels).toEqual(["education"]);
  });

  it("maps number keys and Escape without intercepting modifiers", () => {
    const { adapter, calls } = createAdapter();
    const router = createSectionRouter(routes, adapter);
    expect(router.handleShortcut({ key: "6", target: null })).toBe(true);
    expect(router.activeId).toBe("playground");
    expect(router.handleShortcut({ key: "Escape", target: null })).toBe(true);
    expect(calls.focusedMenus).toEqual(["playground"]);
    expect(
      router.handleShortcut({ key: "2", target: null, metaKey: true }),
    ).toBe(false);
  });

  it("restores browser history from changed hashes", () => {
    const state = createAdapter("#about");
    const router = createSectionRouter(routes, state.adapter);
    state.setHash("#life");
    router.syncFromLocation(true);
    expect(router.activeId).toBe("life");
    expect(state.calls.focusedPanels).toEqual(["life"]);
  });
});
