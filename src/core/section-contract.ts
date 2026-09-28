export const sectionKinds = ["content", "interactive"] as const;
export type SectionKind = (typeof sectionKinds)[number];

export const sectionVisibility = ["public", "hidden"] as const;
export type SectionVisibility = (typeof sectionVisibility)[number];

export const rendererIds = [
  "default",
  "timeline",
  "publications",
  "life",
  "playground",
] as const;
export type RendererId = (typeof rendererIds)[number];

export const audioScaleIds = [
  "c-major",
  "g-major",
  "d-dorian",
  "a-minor-pentatonic",
  "e-minor-pentatonic",
  "e-blues",
] as const;
export type AudioScaleId = (typeof audioScaleIds)[number];

export const terminalCommandIds = [
  "help",
  "about",
  "books",
  "guitar",
  "fitness",
  "music",
  "clear",
] as const;
export type TerminalCommandId = (typeof terminalCommandIds)[number];

export type SectionManifest = {
  id: string;
  label: string;
  shortLabel?: string;
  emptyState?: string;
  order: number;
  kind: SectionKind;
  contentCollection?: string;
  renderer: RendererId;
  audioScale: AudioScaleId;
  terminalCommands?: TerminalCommandId[];
  visibility: SectionVisibility;
};

export const defineSection = (manifest: SectionManifest): SectionManifest => manifest;
