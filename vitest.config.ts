import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "coverage",
      include: [
        "src/themes/presets.ts",
        "src/core/section-registry.ts",
        "src/lib/assistant/*.ts",
        "src/lib/audio/*.ts",
        "src/lib/content/mock-guard.ts",
        "src/lib/content/public-content-model.ts",
        "src/lib/content/publication-view.ts",
        "src/lib/navigation/router.ts",
        "src/lib/terminal/*.ts",
      ],
    },
  },
});
