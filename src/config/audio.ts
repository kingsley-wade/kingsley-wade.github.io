import { withBase } from "./site";

export type BackgroundTrack = {
  id: string;
  title: string;
  artist: string;
  source: string | null;
  sourceKind: "bundled-placeholder" | "owner-supplied" | "external-legal-source";
  licenseNote: string;
  loop: boolean;
};

export type AudioConfig = {
  enabled: boolean;
  defaultMuted: boolean;
  defaultVolume: number;
  requestedBackgroundTrack: {
    id: string;
    title: string;
  };
  backgroundTrack: BackgroundTrack;
  guitar: {
    gain: number;
    attackSeconds: number;
    releaseSeconds: number;
    maxVoices: number;
  };
};

const configuredTrackUrl = import.meta.env.PUBLIC_BACKGROUND_AUDIO_URL?.trim();

export const audioConfig: AudioConfig = {
  enabled: true,
  defaultMuted: true,
  defaultVolume: 0.35,
  requestedBackgroundTrack: {
    id: "lalaland-theme",
    title: "La La Land Theme",
  },
  backgroundTrack: configuredTrackUrl
    ? {
        id: "personal-theme",
        title: import.meta.env.PUBLIC_BACKGROUND_AUDIO_TITLE ?? "Personal Theme",
        artist: import.meta.env.PUBLIC_BACKGROUND_AUDIO_ARTIST ?? "Configured source",
        source: configuredTrackUrl,
        sourceKind: "external-legal-source",
        licenseNote: "Owner-configured legal source; verify its terms before publishing.",
        loop: true,
      }
    : {
        id: "pastel-waltz-placeholder",
        title: "Pastel Waltz (Original Placeholder)",
        artist: "Generated for this project",
        source: withBase("audio/mock/theme-placeholder.ogg"),
        sourceKind: "bundled-placeholder",
        licenseNote: "Original generated audio distributed under the project MIT license.",
        loop: true,
      },
  guitar: {
    gain: 0.32,
    attackSeconds: 0.008,
    releaseSeconds: 0.72,
    maxVoices: 3,
  },
};
