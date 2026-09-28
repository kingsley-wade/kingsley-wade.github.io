import { defineSection } from "../../core/section-contract";

export default defineSection({
  id: "education",
  label: "Education",
  order: 20,
  kind: "content",
  contentCollection: "education",
  renderer: "timeline",
  audioScale: "g-major",
  visibility: "public",
});
