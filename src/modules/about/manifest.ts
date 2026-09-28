import { defineSection } from "../../core/section-contract";

export default defineSection({
  id: "about",
  label: "About Me",
  order: 10,
  kind: "content",
  contentCollection: "about",
  renderer: "default",
  audioScale: "c-major",
  terminalCommands: ["about"],
  visibility: "public",
});
