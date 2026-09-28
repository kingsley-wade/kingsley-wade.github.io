import {
  themePresets,
  themeTokenNames,
  validateThemePreset,
  type ThemePreset,
  type ThemePresetId,
  type ThemeTokens,
} from "../themes/presets";

export const defaultThemePreset: ThemePresetId = "pastel-sky";

const configuredTheme = import.meta.env.PUBLIC_THEME_PRESET?.trim();
const selectedThemeId: ThemePresetId =
  configuredTheme && configuredTheme in themePresets
    ? (configuredTheme as ThemePresetId)
    : defaultThemePreset;

export const themeOverrides: Partial<ThemeTokens> = {};

export const activeTheme: ThemePreset = {
  ...themePresets[selectedThemeId],
  tokens: {
    ...themePresets[selectedThemeId].tokens,
    ...themeOverrides,
  },
};

const validationErrors = validateThemePreset(activeTheme);
if (validationErrors.length > 0) {
  throw new Error(`Invalid theme preset:\n${validationErrors.join("\n")}`);
}

const toKebabCase = (value: string): string =>
  value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

export const themeStyle = themeTokenNames
  .map((name) => `--theme-${toKebabCase(name)}:${activeTheme.tokens[name]}`)
  .join(";");
