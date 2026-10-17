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
  {
    id: "playground",
    label: "Playground",
    order: 3,
    kind: "interactive",
    renderer: "playground",
    audioScale: "e-blues",
    visibility: "public",
  },
];

const shares = [
  { id: "local-note", kind: "note" as const, title: "Local note" },
  { id: "os-guide", kind: "link" as const, title: "OS guide" },
];

describe("terminal filesystem", () => {
  it("lists public sections and resolves aliases", () => {
    const filesystem = createTerminalFilesystem(sections);
    expect(filesystem.list()).toBe("about/  research/  playground/");
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
      "available: about/  research/  playground/",
    ]);
  });

  it("renders a bounded tree with declared actions", () => {
    const filesystem = createTerminalFilesystem(sections);
    expect(filesystem.tree()).toEqual([
      "/",
      "|- about/  [section content]",
      "|- research/  [status]",
      "|- playground/\n|  |- notes/  [empty]\n|  |- links/  [empty]",
    ]);
  });

  it("navigates playground categories and opens share IDs", () => {
    const filesystem = createTerminalFilesystem(sections, shares);
    expect(filesystem.navigate("playground").currentPath).toBe("/playground");
    expect(filesystem.list()).toBe("about/  research/  playground/  notes/  links/");
    expect(filesystem.navigate("notes").currentPath).toBe("/playground/notes");
    expect(filesystem.list()).toBe("local-note/");
    expect(filesystem.open("local-note")).toMatchObject({ focusItemId: "local-note" });
    expect(filesystem.navigate("/playground/links").currentPath).toBe("/playground/links");
    expect(filesystem.list()).toBe("os-guide/");
    expect(filesystem.navigate("missing").currentPath).toBe("/playground/links");
    expect(filesystem.navigate("missing").lines[0]).toBe("path not found: missing");
    expect(filesystem.navigate("..").currentPath).toBe("/playground");
  });
});
