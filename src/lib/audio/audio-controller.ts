import { audioConfig, type BackgroundTrack } from "../../config/audio";

export const AUDIO_PREFERENCE_KEY = "pixel-terminal.audio.v1";

export type AudioStatus =
  | "idle"
  | "playing"
  | "paused"
  | "blocked"
  | "unavailable"
  | "error";

export type AudioState = {
  status: AudioStatus;
  muted: boolean;
  volume: number;
  available: boolean;
  message: string;
};

type StoredPreference = Pick<AudioState, "muted" | "volume">;

export type MediaElementLike = {
  src: string;
  preload: string;
  loop: boolean;
  muted: boolean;
  volume: number;
  paused: boolean;
  currentTime: number;
  play: () => Promise<void>;
  pause: () => void;
  addEventListener: (type: string, listener: () => void) => void;
};

export type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export type BackgroundAudioControllerOptions = {
  track: BackgroundTrack;
  tracks?: readonly BackgroundTrack[];
  defaultMuted?: boolean;
  defaultVolume?: number;
  storage?: StorageLike | null;
  createMedia?: () => MediaElementLike;
};

const clampVolume = (volume: number): number =>
  Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : 0));

const readPreference = (
  storage: StorageLike | null,
  fallback: StoredPreference,
): StoredPreference => {
  if (!storage) return fallback;
  try {
    const parsed = JSON.parse(storage.getItem(AUDIO_PREFERENCE_KEY) ?? "null") as
      | Partial<StoredPreference>
      | null;
    return {
      muted: typeof parsed?.muted === "boolean" ? parsed.muted : fallback.muted,
      volume:
        typeof parsed?.volume === "number"
          ? clampVolume(parsed.volume)
          : fallback.volume,
    };
  } catch {
    return fallback;
  }
};

export class BackgroundAudioController {
  #track: BackgroundTrack;
  readonly #tracks: readonly BackgroundTrack[];
  readonly #storage: StorageLike | null;
  readonly #media: MediaElementLike | null;
  readonly #listeners = new Set<(state: AudioState) => void>();
  #state: AudioState;

  constructor(options: BackgroundAudioControllerOptions) {
    this.#track = options.track;
    this.#tracks = options.tracks?.length ? options.tracks : [options.track];
    this.#storage = options.storage ?? null;
    const preference = readPreference(this.#storage, {
      muted: options.defaultMuted ?? true,
      volume: clampVolume(options.defaultVolume ?? 0.35),
    });

    this.#media = this.#track.source ? (options.createMedia?.() ?? null) : null;
    this.#state = {
      status: this.#media ? "idle" : "unavailable",
      muted: preference.muted,
      volume: preference.volume,
      available: Boolean(this.#media),
      message: this.#media ? "Ready" : "Background track unavailable",
    };

    if (!this.#media || !this.#track.source) return;
    this.#media.src = this.#track.source;
    this.#media.preload = "none";
    this.#media.loop = this.#track.loop;
    this.#media.muted = preference.muted;
    this.#media.volume = preference.volume;
    this.#media.addEventListener("playing", () => {
      this.#setState({ status: "playing", message: "Playing" });
    });
    this.#media.addEventListener("pause", () => {
      if (this.#state.status !== "blocked") {
        this.#setState({ status: "paused", message: "Paused" });
      }
    });
    this.#media.addEventListener("timeupdate", () => {
      const end =
        this.#track.snippetStartSeconds + this.#track.snippetDurationSeconds;
      if (this.#media && this.#media.currentTime >= end) {
        void this.#playNextTrack();
      }
    });
    this.#media.addEventListener("ended", () => void this.#playNextTrack());
    this.#media.addEventListener("error", () => {
      this.#setState({
        status: "error",
        available: false,
        message: "Background track unavailable",
      });
    });
  }

  get state(): Readonly<AudioState> {
    return { ...this.#state };
  }

  get track(): Readonly<BackgroundTrack> {
    return this.#track;
  }

  #pickNextTrack(): BackgroundTrack {
    if (this.#tracks.length === 1) return this.#tracks[0];
    const candidates = this.#tracks.filter((track) => track.id !== this.#track.id);
    return candidates[Math.floor(Math.random() * candidates.length)] ?? this.#tracks[0];
  }

  async #playNextTrack(): Promise<boolean> {
    if (!this.#media || !this.#state.available) return false;
    const nextTrack = this.#pickNextTrack();
    this.#track = nextTrack;
    this.#media.pause();
    this.#media.src = nextTrack.source ?? "";
    this.#media.loop = nextTrack.loop;
    this.#media.currentTime = nextTrack.snippetStartSeconds;
    return this.play();
  }

  subscribe(listener: (state: AudioState) => void): () => void {
    this.#listeners.add(listener);
    listener(this.state);
    return () => this.#listeners.delete(listener);
  }

  async play(): Promise<boolean> {
    if (!this.#media || !this.#state.available) {
      this.#setState({
        status: "unavailable",
        message: "Background track unavailable",
      });
      return false;
    }
    try {
      const end =
        this.#track.snippetStartSeconds + this.#track.snippetDurationSeconds;
      if (
        this.#media.currentTime < this.#track.snippetStartSeconds ||
        this.#media.currentTime >= end
      ) {
        this.#media.currentTime = this.#track.snippetStartSeconds;
      }
      await this.#media.play();
      this.#setState({ status: "playing", message: "Playing" });
      return true;
    } catch {
      this.#setState({
        status: "blocked",
        message: "Tap play to enable sound",
      });
      return false;
    }
  }

  pause(): void {
    this.#media?.pause();
    this.#setState({ status: "paused", message: "Paused" });
  }

  async togglePlayback(): Promise<boolean> {
    if (!this.#media || !this.#state.available) return this.play();
    if (this.#state.status === "playing" && !this.#media.paused) {
      this.pause();
      return false;
    }
    return this.play();
  }

  setMuted(muted: boolean): void {
    if (this.#media) this.#media.muted = muted;
    this.#setState({ muted });
    this.#persist();
  }

  toggleMuted(): void {
    this.setMuted(!this.#state.muted);
  }

  setVolume(volume: number): void {
    const nextVolume = clampVolume(volume);
    if (this.#media) this.#media.volume = nextVolume;
    this.#setState({ volume: nextVolume });
    this.#persist();
  }

  #persist(): void {
    try {
      this.#storage?.setItem(
        AUDIO_PREFERENCE_KEY,
        JSON.stringify({ muted: this.#state.muted, volume: this.#state.volume }),
      );
    } catch {
      // Storage can be unavailable in private browsing; audio remains usable.
    }
  }

  #setState(update: Partial<AudioState>): void {
    this.#state = { ...this.#state, ...update };
    for (const listener of this.#listeners) listener(this.state);
  }
}

let backgroundAudioController: BackgroundAudioController | null = null;

export const getBackgroundAudioController = (
  options?: Partial<BackgroundAudioControllerOptions>,
): BackgroundAudioController => {
  if (backgroundAudioController) return backgroundAudioController;
  const storage =
    options?.storage === undefined && typeof window !== "undefined"
      ? window.localStorage
      : (options?.storage ?? null);
  const createMedia =
    options?.createMedia ??
    (typeof Audio === "undefined"
      ? undefined
      : () => new Audio() as unknown as MediaElementLike);
  const tracks = options?.tracks ?? audioConfig.backgroundTracks;
  const selectedTrack =
    options?.track ?? tracks[Math.floor(Math.random() * tracks.length)] ?? audioConfig.backgroundTrack;
  backgroundAudioController = new BackgroundAudioController({
    track: selectedTrack,
    defaultMuted: options?.defaultMuted ?? audioConfig.defaultMuted,
    defaultVolume: options?.defaultVolume ?? audioConfig.defaultVolume,
    storage,
    createMedia,
  });
  return backgroundAudioController;
};

export const resetBackgroundAudioControllerForTests = (): void => {
  backgroundAudioController?.pause();
  backgroundAudioController = null;
};
