import {
  terminalCommandIds,
  type TerminalCommandId,
} from "../../core/section-contract";

export const terminalInputLimit = 80;

export type TerminalParseResult =
  | { kind: "empty" }
  | { kind: "command"; command: TerminalCommandId; args?: string[] }
  | { kind: "error"; message: string };

const commandSet = new Set<string>(terminalCommandIds);

export const normalizeTerminalInput = (input: string): string =>
  input.trim().replace(/\s+/g, " ").toLowerCase();

export const parseTerminalInput = (input: string): TerminalParseResult => {
  if (input.length > terminalInputLimit) {
    return {
      kind: "error",
      message: `input too long (${input.length}/${terminalInputLimit})`,
    };
  }
  const normalized = normalizeTerminalInput(input);
  if (!normalized) return { kind: "empty" };
  const [name, ...args] = normalized.split(" ");
  if (commandSet.has(name)) {
    return args.length > 0
      ? { kind: "command", command: name as TerminalCommandId, args }
      : { kind: "command", command: name as TerminalCommandId };
  }
  return {
    kind: "error",
    message: `command not found: ${normalized}. type help`,
  };
};
