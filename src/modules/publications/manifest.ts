import { defineSection } from "../../core/section-contract";

export default defineSection({
  id: "publications",
  label: "Publications",
  emptyState: "Publications are being prepared.",
  order: 40,
  kind: "content",
  contentCollection: "publications",
  renderer: "publications",
  audioScale: "a-minor-pentatonic",
  visibility: "public",
});
