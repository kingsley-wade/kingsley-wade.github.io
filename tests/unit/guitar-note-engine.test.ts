import { describe, expect, it, vi } from "vitest";

import { GuitarNoteEngine } from "../../src/lib/audio/guitar-note-engine";
import { scaleDefinitions, selectScaleNote } from "../../src/lib/audio/scales";

const createAudioContext = () => {
  const sources: Array<{
    stop: ReturnType<typeof vi.fn>;
    onended: (() => void) | null;
  }> = [];
  const gainParam = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  const context = {
    state: "running",
    currentTime: 1,
    destination: {},
    resume: vi.fn(async () => undefined),
    createBufferSource: vi.fn(() => {
      const source = {
        buffer: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null as (() => void) | null,
      };
      sources.push(source);
      return source;
    }),
    createGain: vi.fn(() => ({
      gain: gainParam,
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
  };
  return { context: context as unknown as AudioContext, sources, gainParam };
};

describe("scale note selection", () => {
  it("keeps every selected note inside its scale", () => {
    for (const [scaleId, notes] of Object.entries(scaleDefinitions)) {
      for (const random of [0, 0.25, 0.5, 0.999]) {
        expect(notes).toContain(
          selectScaleNote(scaleId as keyof typeof scaleDefinitions, null, () => random),
        );
      }
    }
  });

  it("avoids an immediate repeat when alternatives exist", () => {
    expect(selectScaleNote("c-major", "C4", () => 0)).not.toBe("C4");
  });
});

describe("guitar note engine", () => {
  it("applies its gain envelope and plays a loaded sample", async () => {
    const { context, gainParam } = createAudioContext();
    const engine = new GuitarNoteEngine({
      context,
      random: () => 0,
      loadBuffer: vi.fn(async () => ({}) as AudioBuffer),
    });
    engine.setMuted(false);
    await expect(engine.playScale("c-major")).resolves.toMatchObject({ played: true });
    expect(gainParam.setValueAtTime).toHaveBeenCalledWith(0.0001, 1);
    expect(gainParam.exponentialRampToValueAtTime).toHaveBeenCalledTimes(2);
  });

  it("caps concurrency at three voices and stops the oldest", async () => {
    const { context, sources } = createAudioContext();
    const engine = new GuitarNoteEngine({
      context,
      loadBuffer: vi.fn(async () => ({}) as AudioBuffer),
    });
    engine.setMuted(false);
    await Promise.all([
      engine.playScale("c-major"),
      engine.playScale("g-major"),
      engine.playScale("d-dorian"),
    ]);
    await engine.playScale("e-blues");
    expect(engine.activeVoiceCount).toBe(3);
    expect(sources[0].stop).toHaveBeenCalled();
  });

  it("fails gracefully when a source is missing or audio is muted", async () => {
    const { context } = createAudioContext();
    const engine = new GuitarNoteEngine({
      context,
      loadBuffer: vi.fn(async () => null),
    });
    await expect(engine.playScale("c-major")).resolves.toMatchObject({
      played: false,
      reason: "muted",
    });
    engine.setMuted(false);
    await expect(engine.playScale("c-major")).resolves.toMatchObject({
      played: false,
      reason: "missing-source",
    });
  });
});
