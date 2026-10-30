import type { TerminalCommandId } from "../../core/section-contract";
import {
  createMotivationStore,
} from "../motivation/store";
import type { TerminalFilesystem } from "./filesystem";

export type TerminalEffect = {
  lines: string[];
  clear?: boolean;
  navigateTo?: string;
  currentPath?: string;
  pathChanged?: boolean;
  focusItemId?: string;
  audio?: "guitar" | "toggle-music";
  interaction?: "fitness" | "reading" | "arcade";
};

export const terminalHelp = [
  "NAVIGATION",
  "ls       list the current directory",
  "cd PATH  navigate directories (cd .. moves to the parent, cd ~ returns home)",
  "pwd      print the current path",
  "open ITEM_ID  focus a playground share",
  "tree     show sections and playground shares",
  "",
  "INTERACTIONS",
  "about    open About Me",
  "books    inspect the public reading list",
  "guitar   play one scale note",
  "fitness  trigger a training break",
  "music    toggle the background track",
  "arcade   start the Playground side quest",
  "nudge    push manting to write",
  "ask WHO  ask manting or einstein (ask einstein negotiates brain donation)",
  "status   show the current section",
  "",
  "UTILITIES",
  "help     list commands",
  "clear    clear this output",
] as const;

export const executeTerminalCommand = (
  command: TerminalCommandId,
  args: string[] = [],
  filesystem?: TerminalFilesystem,
): TerminalEffect => {
  switch (command) {
    case "help":
      return { lines: [...terminalHelp] };
    case "ls":
      return filesystem
        ? { lines: [filesystem.list()], currentPath: filesystem.currentPath }
        : { lines: ["filesystem unavailable"] };
  case "cd":
      if (!filesystem) return { lines: ["filesystem unavailable"] };
      if (!args[0]) return { lines: ["usage: cd PATH"] };
      return filesystem.navigate(args[0]);
    case "open":
      if (!filesystem) return { lines: ["filesystem unavailable"] };
      if (!args[0]) return { lines: ["usage: open ITEM_ID"] };
      return filesystem.open(args[0]);
    case "pwd":
      return filesystem ? { lines: [filesystem.currentPath], currentPath: filesystem.currentPath } : { lines: ["/"] };
    case "tree":
      return filesystem ? { lines: filesystem.tree(), currentPath: filesystem.currentPath } : { lines: ["filesystem unavailable"] };
    case "status":
      return filesystem
        ? { lines: [`path: ${filesystem.currentPath}`, `sections: ${filesystem.directories.length}`], currentPath: filesystem.currentPath }
        : { lines: ["status unavailable"] };
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
    case "arcade":
      return {
        lines: ["side quest unlocked: 21 · Dealer's Chase"],
        interaction: "arcade",
      };
    case "nudge": {
      const turns = createMotivationStore().nudge();
      return {
        lines: [...turns.map((turn) => `> ${turn.speaker}: ${turn.text}`), createMotivationStore().snapshot().statusLine],
      };
    }
    case "ask": {
      const target = (args[0] ?? "manting").toLowerCase();
      if (target === "einstein") {
        const turns = createMotivationStore().askEinstein();
        return {
          lines: [...turns.map((turn) => `> ${turn.speaker}: ${turn.text}`), createMotivationStore().snapshot().statusLine],
        };
      }
      if (target === "manting") {
        const turns = createMotivationStore().opening();
        return { lines: turns.map((turn) => `> ${turn.speaker}: ${turn.text}`) };
      }
      return { lines: ["usage: ask manting | ask einstein"] };
    }
    case "clear":
      return { lines: [], clear: true };
  }
};
