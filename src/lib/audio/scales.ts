import type { AudioScaleId } from "../../core/section-contract";

export const noteIds = [
  "A3",
  "C4",
  "D4",
  "E4",
  "F4",
  "Fs4",
  "G4",
  "A4",
  "Bb4",
  "B4",
  "C5",
  "D5",
] as const;

export type NoteId = (typeof noteIds)[number];

export type NoteSource = {
  id: NoteId;
  label: string;
  frequency: number;
  filename: string;
};

export const noteSources: Record<NoteId, NoteSource> = {
  A3: { id: "A3", label: "A3", frequency: 220, filename: "a3.wav" },
  C4: { id: "C4", label: "C4", frequency: 261.63, filename: "c4.wav" },
  D4: { id: "D4", label: "D4", frequency: 293.66, filename: "d4.wav" },
  E4: { id: "E4", label: "E4", frequency: 329.63, filename: "e4.wav" },
  F4: { id: "F4", label: "F4", frequency: 349.23, filename: "f4.wav" },
  Fs4: { id: "Fs4", label: "F#4", frequency: 369.99, filename: "fs4.wav" },
  G4: { id: "G4", label: "G4", frequency: 392, filename: "g4.wav" },
  A4: { id: "A4", label: "A4", frequency: 440, filename: "a4.wav" },
  Bb4: { id: "Bb4", label: "Bb4", frequency: 466.16, filename: "bb4.wav" },
  B4: { id: "B4", label: "B4", frequency: 493.88, filename: "b4.wav" },
  C5: { id: "C5", label: "C5", frequency: 523.25, filename: "c5.wav" },
  D5: { id: "D5", label: "D5", frequency: 587.33, filename: "d5.wav" },
};

export const scaleDefinitions: Record<AudioScaleId, readonly NoteId[]> = {
  "c-major": ["C4", "D4", "E4", "F4", "G4", "A4", "B4"],
  "g-major": ["G4", "A4", "B4", "C5", "D5", "E4", "Fs4"],
  "d-dorian": ["D4", "E4", "F4", "G4", "A4", "B4", "C5"],
  "a-minor-pentatonic": ["A3", "C4", "D4", "E4", "G4"],
  "e-minor-pentatonic": ["E4", "G4", "A4", "B4", "D5"],
  "e-blues": ["E4", "G4", "A4", "Bb4", "B4", "D5"],
};

export const selectScaleNote = (
  scaleId: AudioScaleId,
  previous: NoteId | null,
  random: () => number = Math.random,
): NoteId => {
  const scale = scaleDefinitions[scaleId];
  const candidates =
    previous && scale.length > 1 ? scale.filter((note) => note !== previous) : scale;
  const index = Math.min(
    candidates.length - 1,
    Math.max(0, Math.floor(random() * candidates.length)),
  );
  return candidates[index];
};

export const noteSamplePath = (note: NoteId): string =>
  `audio/guitar/${noteSources[note].filename}`;
