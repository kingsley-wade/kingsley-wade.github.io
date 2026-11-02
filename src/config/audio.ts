import { withBase } from "./site";

export type BackgroundTrack = {
  id: string;
  title: string;
  artist: string;
  source: string | null;
  sourceKind: "bundled-placeholder" | "owner-supplied" | "external-legal-source";
  licenseNote: string;
  loop: boolean;
  snippetStartSeconds: number;
  snippetDurationSeconds: number;
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
  backgroundTracks: readonly BackgroundTrack[];
  guitar: {
    gain: number;
    attackSeconds: number;
    releaseSeconds: number;
    maxVoices: number;
  };
};

const configuredTrackUrl = import.meta.env.PUBLIC_BACKGROUND_AUDIO_URL?.trim();

// Full-track loop: snippetDurationSeconds >= track duration keeps the
// timeupdate watchdog from restarting playback; `loop: true` handles replay.
const bundledTracks: readonly BackgroundTrack[] = [
  {
    id: "coffee-on-the-balcony",
    title: "Coffee on the Balcony",
    artist: "Owner supplied",
    source: withBase("audio/coffee-on-the-balcony.mp3"),
    sourceKind: "owner-supplied",
    licenseNote: "Confirm publishing rights before deploying this file publicly.",
    loop: true,
    snippetStartSeconds: 0,
    snippetDurationSeconds: 181,
  },
];

const configuredTrack: BackgroundTrack | null = configuredTrackUrl
  ? {
      id: "personal-theme",
      title: import.meta.env.PUBLIC_BACKGROUND_AUDIO_TITLE ?? "Personal Theme",
      artist: import.meta.env.PUBLIC_BACKGROUND_AUDIO_ARTIST ?? "Configured source",
      source: configuredTrackUrl,
      sourceKind: "external-legal-source",
      licenseNote: "Owner-configured legal source; verify its terms before publishing.",
      loop: false,
      snippetStartSeconds: 0,
      snippetDurationSeconds: 30,
    }
  : null;

export const audioConfig: AudioConfig = {
  enabled: true,
  defaultMuted: true,
  defaultVolume: 0.35,
  requestedBackgroundTrack: {
    id: "lalaland-theme",
    title: "La La Land Theme",
  },
  backgroundTrack: configuredTrack ?? bundledTracks[0],
  backgroundTracks: configuredTrack ? [configuredTrack] : bundledTracks,
  guitar: {
    gain: 0.32,
    attackSeconds: 0.008,
    releaseSeconds: 0.72,
    maxVoices: 3,
  },
};
