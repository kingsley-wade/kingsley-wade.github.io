import { defineSection } from "../../core/section-contract";

export default defineSection({
  id: "photos",
  label: "Photos",
  shortLabel: "Photos",
  emptyState: "Your photo roll is empty for now.",
  order: 55,
  kind: "interactive",
  renderer: "photos",
  audioScale: "c-major",
  visibility: "public",
});
