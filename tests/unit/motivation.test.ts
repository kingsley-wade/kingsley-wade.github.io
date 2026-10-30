import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  EINSTEIN_EXCUSES,
  EINSTEIN_FINALE,
  EINSTEIN_POSITIVES,
  GENEROSITY_MAX_ASKS,
  MANTING_LINES,
  MANTING_POSITIVES,
  formatEinsteinLine,
  generosityForAsks,
  pickMantingLine,
  pickRandom,
} from "../../src/lib/motivation/lines";
import { createMotivationStore } from "../../src/lib/motivation/store";

describe("motivation lines", () => {
  it("keeps the pools generously sized", () => {
    expect(MANTING_LINES.length).toBeGreaterThanOrEqual(15);
    expect(MANTING_POSITIVES.length).toBeGreaterThanOrEqual(10);
    expect(EINSTEIN_EXCUSES.length).toBeGreaterThanOrEqual(14);
    expect(EINSTEIN_POSITIVES.length).toBeGreaterThanOrEqual(6);
  });

  it("computes generosity in pi-flavored steps and locks at the finale", () => {
    expect(generosityForAsks(0)).toBe(0);
    expect(generosityForAsks(1)).toBe(3.14);
    expect(generosityForAsks(5)).toBe(15.7);
    expect(generosityForAsks(GENEROSITY_MAX_ASKS)).toBe(100);
    expect(generosityForAsks(GENEROSITY_MAX_ASKS + 3)).toBe(100);
  });

  it("adds einstein's positive bonus on top of the ask steps", () => {
    expect(generosityForAsks(1, 3.14)).toBe(6.28);
    expect(generosityForAsks(2, 3.14)).toBe(9.42);
    expect(generosityForAsks(1, 200)).toBe(100);
  });

  it("picks deterministically under a seeded random", () => {
    expect(pickRandom(["a", "b", "c"], () => 0)).toBe("a");
    expect(pickRandom(["a", "b", "c"], () => 0.99)).toBe("c");
  });

  it("splits manting replies evenly between self-deprecation and positivity", () => {
    expect(pickMantingLine(() => 0.1)).toBe(pickRandom(MANTING_POSITIVES, () => 0.1));
    expect(pickMantingLine(() => 0.9)).toBe(pickRandom(MANTING_LINES, () => 0.9));
  });

  it("formats einstein lines with the current percentage", () => {
    expect(formatEinsteinLine("still {pct}% pending", 9.42)).toBe("still 9.42% pending");
  });
});

describe("motivation store", () => {
  const memory = new Map<string, string>();
  const shim = {
    localStorage: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => void memory.set(key, value),
      clear: () => memory.clear(),
    },
    dispatchEvent: () => true,
  };

  beforeEach(() => {
    memory.clear();
    (globalThis as { window?: unknown }).window = shim;
  });

  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it("starts from zero and persists counters", () => {
    const store = createMotivationStore();
    expect(store.snapshot()).toMatchObject({ nudges: 0, asks: 0, generosity: 0 });

    store.nudge();
    store.nudge();
    expect(createMotivationStore().snapshot()).toMatchObject({ nudges: 2 });
  });

  it("appends a random manting reply on nudge", () => {
    const store = createMotivationStore();
    const turns = store.nudge();
    expect(turns[0].speaker).toBe("you");
    expect(turns[1].speaker).toBe("manting");
    expect([...MANTING_LINES, ...MANTING_POSITIVES]).toContain(turns[1].text);
  });

  it("escalates generosity per ask and resets after the finale", () => {
    const skeptical = createMotivationStore(() => 0.9);
    const first = skeptical.askEinstein();
    expect(first[1].text).toContain("3.14%");

    for (let i = 0; i < GENEROSITY_MAX_ASKS - 2; i += 1) skeptical.askEinstein();
    const finale = createMotivationStore(() => 0.9).askEinstein();
    expect(finale[1].text).toBe(EINSTEIN_FINALE);
    expect(createMotivationStore(() => 0.9).snapshot()).toMatchObject({ asks: 0, generosity: 0 });
  });

  it("grants a pi bonus when einstein is feeling generous", () => {
    const generous = createMotivationStore(() => 0.1);
    const turns = generous.askEinstein();
    expect(EINSTEIN_POSITIVES.some((line) => turns[1].text.startsWith(line.slice(0, -7)))).toBe(true);
    expect(turns[1].text).toContain("6.28%");
    expect(createMotivationStore(() => 0.1).snapshot().generosity).toBe(6.28);
  });

  it("syncs between separate store instances through storage", () => {
    const panelStore = createMotivationStore();
    panelStore.nudge();
    const terminalStore = createMotivationStore();
    expect(terminalStore.snapshot().nudges).toBe(1);
  });
});
