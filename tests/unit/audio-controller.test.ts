import { afterEach, describe, expect, it, vi } from "vitest";

import type { BackgroundTrack } from "../../src/config/audio";
import {
  AUDIO_PREFERENCE_KEY,
  BackgroundAudioController,
  getBackgroundAudioController,
  resetBackgroundAudioControllerForTests,
  type MediaElementLike,
  type StorageLike,
} from "../../src/lib/audio/audio-controller";

const track: BackgroundTrack = {
  id: "test-track",
  title: "Test Track",
  artist: "Test Artist",
  source: "/audio/test.ogg",
  sourceKind: "bundled-placeholder",
  licenseNote: "Test fixture",
  loop: true,
  snippetStartSeconds: 0,
  snippetDurationSeconds: 30,
};

const createMedia = () => {
  const listeners = new Map<string, () => void>();
  const media = {
    src: "",
    preload: "",
    loop: false,
    muted: true,
    volume: 1,
    paused: true as boolean,
    currentTime: 0,
    play: vi.fn(async () => {
      media.paused = false;
      listeners.get("playing")?.();
    }),
    pause: vi.fn(() => {
      media.paused = true;
      listeners.get("pause")?.();
    }),
    addEventListener: vi.fn((type: string, listener: () => void) => {
      listeners.set(type, listener);
    }),
  } satisfies MediaElementLike;
  return media;
};

const createStorage = (initial?: string) => {
  const values = new Map<string, string>();
  if (initial) values.set(AUDIO_PREFERENCE_KEY, initial);
  return {
    storage: {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    } satisfies StorageLike,
    values,
  };
};

afterEach(() => resetBackgroundAudioControllerForTests());

describe("background audio controller", () => {
  it("creates one persistent media instance and does not restart it", async () => {
    const factory = vi.fn(createMedia);
    const first = getBackgroundAudioController({ track, createMedia: factory });
    const second = getBackgroundAudioController({ track, createMedia: factory });
    expect(first).toBe(second);
    expect(factory).toHaveBeenCalledTimes(1);

    const media = factory.mock.results[0].value;
    media.currentTime = 12;
    await first.play();
    await second.play();
    expect(media.play).toHaveBeenCalledTimes(2);
    expect(media.src).toBe(track.source);
    expect(media.currentTime).toBe(12);
  });

  it("loads and persists mute and volume preferences", () => {
    const stored = JSON.stringify({ muted: false, volume: 0.6 });
    const { storage, values } = createStorage(stored);
    const media = createMedia();
    const controller = new BackgroundAudioController({
      track,
      storage,
      createMedia: () => media,
    });
    expect(controller.state).toMatchObject({ muted: false, volume: 0.6 });
    expect(media.muted).toBe(false);
    expect(media.volume).toBe(0.6);

    controller.setMuted(true);
    controller.setVolume(0.4);
    expect(JSON.parse(values.get(AUDIO_PREFERENCE_KEY) ?? "{}")).toEqual({
      muted: true,
      volume: 0.4,
    });
  });

  it("reports an autoplay rejection without throwing", async () => {
    const media = createMedia();
    media.play.mockRejectedValueOnce(new Error("NotAllowedError"));
    const controller = new BackgroundAudioController({
      track,
      createMedia: () => media,
    });
    await expect(controller.play()).resolves.toBe(false);
    expect(controller.state).toMatchObject({
      status: "blocked",
      message: "Tap play to enable sound",
    });
  });

  it("degrades cleanly when no source is configured", async () => {
    const factory = vi.fn(createMedia);
    const controller = new BackgroundAudioController({
      track: { ...track, source: null },
      createMedia: factory,
    });
    expect(factory).not.toHaveBeenCalled();
    expect(controller.state).toMatchObject({
      status: "unavailable",
      available: false,
    });
    await expect(controller.play()).resolves.toBe(false);
  });
});
