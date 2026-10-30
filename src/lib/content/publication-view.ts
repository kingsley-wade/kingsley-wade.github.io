import type { PublicationData } from "./schemas";

export type PublicationGroup = "published" | "under-review" | "preprint";

export type PublicationView = PublicationData & {
  group: PublicationGroup;
  statusLabel: string;
  primaryUrl: string | null;
};

const statusLabels: Record<PublicationData["status"], string> = {
  published: "Published",
  accepted: "Accepted",
  preprint: "Preprint",
  "under-review": "Under review",
  "in-progress": "In progress",
};

export const toPublicationView = (entry: PublicationData): PublicationView => ({
  ...entry,
  group:
    entry.status === "published" || entry.status === "accepted"
      ? "published"
      : entry.status === "preprint"
        ? "preprint"
        : "under-review",
  statusLabel: statusLabels[entry.status],
  primaryUrl: entry.doi
    ? `https://doi.org/${entry.doi.replace(/^https?:\/\/doi\.org\//, "")}`
    : (entry.url ?? null),
});

export const groupPublicationViews = (
  entries: readonly PublicationData[],
): Record<PublicationGroup, PublicationView[]> => {
  const grouped: Record<PublicationGroup, PublicationView[]> = {
    published: [],
    "under-review": [],
    preprint: [],
  };
  for (const entry of entries) {
    const view = toPublicationView(entry);
    grouped[view.group].push(view);
  }
  return grouped;
};
