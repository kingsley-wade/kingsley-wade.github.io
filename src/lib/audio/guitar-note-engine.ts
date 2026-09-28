import type { AudioScaleId } from "../../core/section-contract";
import { audioConfig } from "../../config/audio";
import {
  noteSamplePath,
  selectScaleNote,
  type NoteId,
} from "./scales";

type Voice = {
  source: AudioBufferSourceNode;
  gain: GainNode;
};

export type GuitarPlayResult = {
  note: NoteId;
  played: boolean;
  reason?: "muted" | "missing-source" | "audio-unavailable";
};

export type GuitarNoteEngineOptions = {
  context: AudioContext;
  baseUrl?: string;
  random?: () => number;
  loadBuffer?: (url: string, context: AudioContext) => Promise<AudioBuffer | null>;
};

const defaultLoadBuffer = async (
  url: string,
  context: AudioContext,
): Promise<AudioBuffer | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await context.decodeAudioData(await response.arrayBuffer());
  } catch {
    return null;
  }
};

const joinBase = (base: string, path: string): string =>
  `${base.endsWith("/") ? base : `${base}/`}${path.replace(/^\/+/, "")}`;

export class GuitarNoteEngine {
  readonly #context: AudioContext;
  readonly #baseUrl: string;
  readonly #random: () => number;
  readonly #loadBuffer: NonNullable<GuitarNoteEngineOptions["loadBuffer"]>;
  readonly #buffers = new Map<string, Promise<AudioBuffer | null>>();
  readonly #previous = new Map<AudioScaleId, NoteId>();
  readonly #voices: Voice[] = [];
  #muted = true;

  constructor(options: GuitarNoteEngineOptions) {
    this.#context = options.context;
    this.#baseUrl = options.baseUrl ?? "/";
    this.#random = options.random ?? Math.random;
    this.#loadBuffer = options.loadBuffer ?? defaultLoadBuffer;
  }

  get activeVoiceCount(): number {
    return this.#voices.length;
  }

  setMuted(muted: boolean): void {
    this.#muted = muted;
  }

  async playScale(scaleId: AudioScaleId): Promise<GuitarPlayResult> {
    const note = selectScaleNote(
      scaleId,
      this.#previous.get(scaleId) ?? null,
      this.#random,
    );
    this.#previous.set(scaleId, note);
    if (this.#muted) return { note, played: false, reason: "muted" };

    try {
      if (this.#context.state === "suspended") await this.#context.resume();
      const url = joinBase(this.#baseUrl, noteSamplePath(note));
      const bufferPromise =
        this.#buffers.get(url) ?? this.#loadBuffer(url, this.#context);
      this.#buffers.set(url, bufferPromise);
      const buffer = await bufferPromise;
      if (!buffer) return { note, played: false, reason: "missing-source" };

      while (this.#voices.length >= audioConfig.guitar.maxVoices) {
        const oldest = this.#voices.shift();
        oldest?.source.stop();
      }

      const source = this.#context.createBufferSource();
      const gain = this.#context.createGain();
      const now = this.#context.currentTime;
      source.buffer = buffer;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(
        audioConfig.guitar.gain,
        now + audioConfig.guitar.attackSeconds,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + audioConfig.guitar.releaseSeconds,
      );
      source.connect(gain);
      gain.connect(this.#context.destination);

      const voice = { source, gain };
      this.#voices.push(voice);
      source.onended = () => {
        const index = this.#voices.indexOf(voice);
        if (index >= 0) this.#voices.splice(index, 1);
        source.disconnect();
        gain.disconnect();
      };
      source.start(now);
      source.stop(now + audioConfig.guitar.releaseSeconds);
      return { note, played: true };
    } catch {
      return { note, played: false, reason: "audio-unavailable" };
    }
  }
}
