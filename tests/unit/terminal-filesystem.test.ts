import { describe, expect, it } from "vitest";

import { createTerminalFilesystem } from "../../src/lib/terminal/filesystem";
import type { SectionManifest } from "../../src/core/section-contract";

const sections: SectionManifest[] = [
  {
    id: "about",
    label: "About Me",
    order: 1,
    kind: "content",
    renderer: "default",
    audioScale: "c-major",
    terminalAliases: ["me"],
    visibility: "public",
  },
  {
    id: "research",
    label: "Research",
    order: 2,
    kind: "content",
    renderer: "default",
    audioScale: "d-dorian",
    terminalAliases: ["lab"],
    terminalCommands: ["status"],
    visibility: "public",
  },
];

describe("terminal filesystem", () => {
  it("lists public sections and resolves aliases", () => {
    const filesystem = createTerminalFilesystem(sections);
    expect(filesystem.list()).toBe("about/  research/");
    expect(filesystem.navigate("lab")).toMatchObject({
      currentPath: "/research",
      navigateTo: "research",
    });
  });

  it("returns home with cd .. and reports unknown paths", () => {
    const filesystem = createTerminalFilesystem(sections);
    filesystem.navigate("research");
    expect(filesystem.navigate("..")).toMatchObject({ currentPath: "/" });
    expect(filesystem.navigate("missing").lines).toEqual([
      "path not found: missing",
      "available: about  research",
    ]);
  });

  it("renders a bounded tree with declared actions", () => {
    const filesystem = createTerminalFilesystem(sections);
    expect(filesystem.tree()).toEqual([
      "/",
      "|- about/  [section content]",
      "|- research/  [status]",
    ]);
  });
});
