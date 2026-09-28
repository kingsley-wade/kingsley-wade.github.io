import { describe, expect, it } from "vitest";

import {
  contrastRatio,
  themePresets,
  themeTokenNames,
  validateThemePreset,
} from "../../src/themes/presets";

describe("theme presets", () => {
  it.each(Object.values(themePresets))(
    "validates every token and contrast pair in $id",
    (preset) => {
      expect(Object.keys(preset.tokens).sort()).toEqual([...themeTokenNames].sort());
      expect(validateThemePreset(preset)).toEqual([]);
    },
  );

  it("records WCAG AA contrast for the primary pastel surfaces", () => {
    const { tokens } = themePresets["pastel-sky"];
    expect(contrastRatio(tokens.ink, tokens.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens.link, tokens.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens.accent, tokens.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it("rejects invalid colors and a deliberately low-contrast preset", () => {
    expect(() => contrastRatio("not-a-color", "#FFFFFF")).toThrow(
      /Invalid theme color/,
    );
    expect(
      validateThemePreset({
        ...themePresets["pastel-sky"],
        tokens: {
          ...themePresets["pastel-sky"].tokens,
          ink: "#FFFFFF",
          link: "#FFFFFF",
          accent: "#FFFFFF",
        },
      }),
    ).toEqual(expect.arrayContaining([expect.stringMatching(/below 4.5/)]));
  });
});
