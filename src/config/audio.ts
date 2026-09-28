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

const bundledTracks: readonly BackgroundTrack[] = [
  {
    id: "track-770908273",
    title: "Track 770908273",
    artist: "Owner supplied",
    source: withBase("audio/mock/770908273-1-30232.ogg"),
    sourceKind: "owner-supplied",
    licenseNote: "Confirm publishing rights before deploying this file publicly.",
    loop: false,
    snippetStartSeconds: 0,
    snippetDurationSeconds: 30,
  },
  {
    id: "waltz-for-window-seat",
    title: "A Waltz for the Window Seat",
    artist: "Owner supplied",
    source: withBase("audio/mock/A_Waltz_for_the_Window_Seat.ogg"),
    sourceKind: "owner-supplied",
    licenseNote: "Confirm publishing rights before deploying this file publicly.",
    loop: false,
    snippetStartSeconds: 0,
    snippetDurationSeconds: 30,
  },
  {
    id: "midnight-on-the-balcony",
    title: "Midnight on the Balcony",
    artist: "Owner supplied",
    source: withBase("audio/mock/Midnight_on_the_Balcony.ogg"),
    sourceKind: "owner-supplied",
    licenseNote: "Confirm publishing rights before deploying this file publicly.",
    loop: false,
    snippetStartSeconds: 0,
    snippetDurationSeconds: 30,
  },
  {
    id: "room-still-holds-you",
    title: "The Room Still Holds You",
    artist: "Owner supplied",
    source: withBase("audio/mock/The_Room_Still_Holds_You.ogg"),
    sourceKind: "owner-supplied",
    licenseNote: "Confirm publishing rights before deploying this file publicly.",
    loop: false,
    snippetStartSeconds: 0,
    snippetDurationSeconds: 30,
  },
  {
    id: "city-of-stars-fingerstyle",
    title: "City of Stars (Fingerstyle)",
    artist: "Owner supplied",
    source: withBase("audio/mock/city_of_stars_fingerstyle%202.ogg"),
    sourceKind: "owner-supplied",
    licenseNote: "Confirm publishing rights before deploying this file publicly.",
    loop: false,
    snippetStartSeconds: 0,
    snippetDurationSeconds: 30,
  },
  {
    id: "original-piece",
    title: "Original Piece",
    artist: "Owner supplied",
    source: withBase("audio/mock/original_piece_30s.ogg"),
    sourceKind: "owner-supplied",
    licenseNote: "Confirm publishing rights before deploying this file publicly.",
    loop: false,
    snippetStartSeconds: 0,
    snippetDurationSeconds: 30,
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
