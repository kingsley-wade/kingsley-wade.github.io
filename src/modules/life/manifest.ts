import { defineSection } from "../../core/section-contract";

export default defineSection({
  id: "life",
  label: "Misc 01 / Life",
  shortLabel: "Life",
  emptyState: "Life notes will appear here when they are ready to share.",
  order: 50,
  kind: "content",
  contentCollection: "misc",
  renderer: "life",
  audioScale: "e-minor-pentatonic",
  terminalCommands: ["books", "fitness"],
  visibility: "public",
});
