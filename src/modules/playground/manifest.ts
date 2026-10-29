import { defineSection } from "../../core/section-contract";

export default defineSection({
  id: "playground",
  label: "Misc 02 / Playground",
  shortLabel: "Playground",
  emptyState: "The playground is loading its first experiment.",
  order: 60,
  kind: "interactive",
  contentCollection: "misc",
  renderer: "playground",
  audioScale: "e-blues",
  terminalCommands: ["help", "guitar", "music", "arcade", "clear"],
  terminalAliases: ["play"],
  visibility: "public",
});
