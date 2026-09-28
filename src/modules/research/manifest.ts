import { defineSection } from "../../core/section-contract";

export default defineSection({
  id: "research",
  label: "Research",
  order: 30,
  kind: "content",
  contentCollection: "research",
  renderer: "default",
  audioScale: "d-dorian",
  visibility: "public",
});
