import { executeTerminalCommand } from "./commands";
import { createTerminalFilesystem } from "./filesystem";
import { parseTerminalInput } from "./parser";
import type { SectionManifest } from "../../core/section-contract";

export const initPlaygroundTerminal = (sections: readonly SectionManifest[]): void => {
  const terminal = document.querySelector<HTMLElement>("[data-terminal]");
  const form = terminal?.querySelector<HTMLFormElement>("[data-terminal-form]");
  const input = form?.elements.namedItem("command") as HTMLInputElement | null;
  const output = terminal?.querySelector<HTMLOListElement>("[data-terminal-output]");
  const prompt = terminal?.querySelector<HTMLElement>("[data-terminal-prompt]");
  const status = terminal?.querySelector<HTMLElement>("[data-terminal-status]");
  if (!form || !input || !output) return;
  const filesystem = createTerminalFilesystem(sections);
  const history: string[] = [];
  let historyIndex = 0;
  const updatePrompt = () => {
    if (prompt) prompt.textContent = `guest@local:${filesystem.currentPath}$`;
  };
  const appendLine = (line: string, kind = "output") => {
    const item = document.createElement("li");
    item.dataset.lineKind = kind;
    item.textContent = line;
    output.append(item);
    while (output.children.length > 50) output.firstElementChild?.remove();
    output.scrollTop = output.scrollHeight;
  };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const raw = input.value;
    const parsed = parseTerminalInput(raw);
    input.value = "";
    if (parsed.kind === "empty") return;
    history.push(raw);
    if (history.length > 50) history.shift();
    historyIndex = history.length;
    appendLine(`guest@local:${filesystem.currentPath}$ ${raw.trim()}`, "command");
    if (parsed.kind === "error") {
      appendLine(parsed.message, "error");
      return;
    }
    const effect = executeTerminalCommand(parsed.command, parsed.args, filesystem);
    if (effect.clear) output.replaceChildren();
    for (const line of effect.lines) appendLine(line, parsed.command === "help" ? "help" : "output");
    if (effect.currentPath) updatePrompt();
    if (status) status.textContent = effect.navigateTo ? "OPEN" : "READY";
    if (effect.navigateTo) {
      document.querySelector<HTMLAnchorElement>(`[data-section-link="${CSS.escape(effect.navigateTo)}"]`)?.click();
    }
    if (effect.audio) window.dispatchEvent(new CustomEvent("terminal:audio", { detail: { action: effect.audio } }));
    if (effect.interaction) window.dispatchEvent(new CustomEvent("terminal:interaction", { detail: { action: effect.interaction } }));
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      const [command, partial = ""] = input.value.trim().split(/\s+/, 2);
      if (command === "cd" || command === "open") {
        const matches = filesystem.completions(partial);
        if (matches.length === 1) {
          event.preventDefault();
          input.value = `${command} ${matches[0]}`;
        }
      }
      return;
    }
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    historyIndex += event.key === "ArrowUp" ? -1 : 1;
    historyIndex = Math.max(0, Math.min(history.length, historyIndex));
    input.value = history[historyIndex] ?? "";
  });
  window.addEventListener("section:changed", (event) => {
    const detail = (event as CustomEvent<{ id?: string }>).detail;
    filesystem.setCurrentSection(detail?.id);
    updatePrompt();
  });
};
