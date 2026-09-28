export const themeTokenNames = [
  "canvas",
  "surface",
  "surfaceMint",
  "surfaceLavender",
  "surfaceCoral",
  "ink",
  "inkMuted",
  "link",
  "accent",
  "highlight",
  "focus",
  "terminalBorder",
] as const;

export type ThemeTokenName = (typeof themeTokenNames)[number];
export type ThemeTokens = Record<ThemeTokenName, string>;

export type ThemePreset = {
  id: string;
  label: string;
  tokens: ThemeTokens;
};

export const themePresets = {
  "pastel-sky": {
    id: "pastel-sky",
    label: "Pastel Sky",
    tokens: {
      canvas: "#DDEFFC",
      surface: "#F8FCFF",
      surfaceMint: "#DDF4E8",
      surfaceLavender: "#E9E1F7",
      surfaceCoral: "#F6D7DF",
      ink: "#18324A",
      inkMuted: "#49657A",
      link: "#075E75",
      accent: "#96324F",
      highlight: "#8A5B00",
      focus: "#6B4FA1",
      terminalBorder: "#49657A",
    },
  },
  "classic-terminal": {
    id: "classic-terminal",
    label: "Classic Terminal",
    tokens: {
      canvas: "#050A07",
      surface: "#09150E",
      surfaceMint: "#0D2116",
      surfaceLavender: "#171528",
      surfaceCoral: "#26151B",
      ink: "#C7FFD8",
      inkMuted: "#83C997",
      link: "#62E6F2",
      accent: "#FFD65A",
      highlight: "#FFB86B",
      focus: "#D6A8FF",
      terminalBorder: "#4DD878",
    },
  },
} satisfies Record<string, ThemePreset>;

export type ThemePresetId = keyof typeof themePresets;

const hexToRgb = (hex: string): [number, number, number] => {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`Invalid theme color: ${hex}`);
  const value = Number.parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const relativeLuminance = (hex: string): number => {
  const channels = hexToRgb(hex).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

export const contrastRatio = (foreground: string, background: string): number => {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
};

export const validateThemePreset = (preset: ThemePreset): string[] => {
  const errors: string[] = [];
  for (const name of themeTokenNames) {
    if (!preset.tokens[name]) errors.push(`Missing theme token: ${name}`);
  }

  const textChecks: Array<[string, string, string]> = [
    ["ink/canvas", preset.tokens.ink, preset.tokens.canvas],
    ["ink/surface", preset.tokens.ink, preset.tokens.surface],
    ["ink/mint", preset.tokens.ink, preset.tokens.surfaceMint],
    ["ink/lavender", preset.tokens.ink, preset.tokens.surfaceLavender],
    ["ink/coral", preset.tokens.ink, preset.tokens.surfaceCoral],
    ["link/canvas", preset.tokens.link, preset.tokens.canvas],
    ["link/surface", preset.tokens.link, preset.tokens.surface],
    ["accent/canvas", preset.tokens.accent, preset.tokens.canvas],
    ["accent/surface", preset.tokens.accent, preset.tokens.surface],
  ];

  for (const [label, foreground, background] of textChecks) {
    const ratio = contrastRatio(foreground, background);
    if (ratio < 4.5) errors.push(`${label} contrast ${ratio.toFixed(2)} is below 4.5`);
  }
  return errors;
};
