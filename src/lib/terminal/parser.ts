import {
  terminalCommandIds,
  type TerminalCommandId,
} from "../../core/section-contract";

export const terminalInputLimit = 80;

export type TerminalParseResult =
  | { kind: "empty" }
  | { kind: "command"; command: TerminalCommandId }
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
  if (commandSet.has(normalized)) {
    return { kind: "command", command: normalized as TerminalCommandId };
  }
  return {
    kind: "error",
    message: `command not found: ${normalized}. type help`,
  };
};
