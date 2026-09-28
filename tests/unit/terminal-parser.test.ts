import { describe, expect, it, vi } from "vitest";

import { executeTerminalCommand } from "../../src/lib/terminal/commands";
import {
  normalizeTerminalInput,
  parseTerminalInput,
} from "../../src/lib/terminal/parser";
import { createSectionRouter, type RouteAdapter } from "../../src/lib/navigation/router";

describe("terminal parser", () => {
  it("normalizes case, leading space, and repeated space", () => {
    expect(normalizeTerminalInput("  GuItAr  ")).toBe("guitar");
    expect(parseTerminalInput("  HELP  ")).toEqual({
      kind: "command",
      command: "help",
    });
  });

  it.each(["help", "about", "books", "guitar", "fitness", "music", "clear"])(
    "accepts the %s command",
    (command) => {
      expect(parseTerminalInput(command)).toMatchObject({ kind: "command", command });
    },
  );

  it("connects reading and fitness commands to bounded interactions", () => {
    expect(executeTerminalCommand("books")).toMatchObject({ interaction: "reading" });
    expect(executeTerminalCommand("fitness")).toMatchObject({ interaction: "fitness" });
  });

  it("rejects unknown, multi-word, and overlong input", () => {
    expect(parseTerminalInput("open https://example.com")).toMatchObject({
      kind: "error",
    });
    expect(parseTerminalInput("x".repeat(81))).toEqual({
      kind: "error",
      message: "input too long (81/80)",
    });
  });

  it("preserves HTML-like input as inert error text", () => {
    const parsed = parseTerminalInput('<img src=x onerror="alert(1)">');
    expect(parsed.kind).toBe("error");
    if (parsed.kind === "error") {
      expect(parsed.message).toContain("<img src=x");
    }
  });

  it("returns bounded effects instead of executing commands", () => {
    expect(executeTerminalCommand("about")).toMatchObject({ navigateTo: "about" });
    expect(executeTerminalCommand("guitar")).toMatchObject({ audio: "guitar" });
    expect(executeTerminalCommand("clear")).toEqual({ lines: [], clear: true });
  });
});

describe("navigation while terminal input is focused", () => {
  it("does not intercept numeric keys from an input", () => {
    class FakeElement {
      tagName = "INPUT";
      isContentEditable = false;
    }
    vi.stubGlobal("HTMLElement", FakeElement);
    const adapter: RouteAdapter = {
      readHash: () => "#about",
      pushHash: vi.fn(),
      replaceHash: vi.fn(),
      applyActive: vi.fn(),
      focusPanel: vi.fn(),
      focusMenu: vi.fn(),
      setTitle: vi.fn(),
      reportFallback: vi.fn(),
    };
    const router = createSectionRouter(
      [
        { id: "about", label: "About" },
        { id: "education", label: "Education" },
      ],
      adapter,
    );
    expect(
      router.handleShortcut({
        key: "2",
        target: new FakeElement() as unknown as EventTarget,
      }),
    ).toBe(false);
    expect(adapter.pushHash).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
