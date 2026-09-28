import type { TerminalCommandId } from "../../core/section-contract";

export type TerminalEffect = {
  lines: string[];
  clear?: boolean;
  navigateTo?: string;
  audio?: "guitar" | "toggle-music";
  interaction?: "fitness" | "reading";
};

export const terminalHelp = [
  "help     list commands",
  "about    open About Me",
  "books    inspect the public reading list",
  "guitar   play one scale note",
  "fitness  trigger a training break",
  "music    toggle the background track",
  "clear    clear this output",
] as const;

export const executeTerminalCommand = (
  command: TerminalCommandId,
): TerminalEffect => {
  switch (command) {
    case "help":
      return { lines: [...terminalHelp] };
    case "about":
      return { lines: ["opening /about"], navigateTo: "about" };
    case "books":
      return {
        lines: ["reading list: no public entries yet", "turning one quiet page"],
        interaction: "reading",
      };
    case "guitar":
      return { lines: ["requesting one guitar note"], audio: "guitar" };
    case "fitness":
      return {
        lines: ["training break: 20 seconds of movement"],
        interaction: "fitness",
      };
    case "music":
      return { lines: ["toggling background track"], audio: "toggle-music" };
    case "clear":
      return { lines: [], clear: true };
  }
};
