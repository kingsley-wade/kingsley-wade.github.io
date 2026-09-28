import type { PublicationCandidate } from "../../src/lib/content/mock-guard";
import type { PublicationData } from "../../src/lib/content/schemas";

export const mockPublicationEntries = [
  {
    id: "mock-journal-entry",
    title: "Mock journal article for component verification",
    authors: ["Example Author", "Second Author"],
    kind: "journal",
    status: "published",
    venue: "Example Journal",
    year: 2026,
    doi: "10.0000/example.1",
    links: [],
    tags: ["mock"],
    visibility: "public",
    updatedAt: "2026-09-28",
    mock: true,
  },
  {
    id: "mock-conference-entry",
    title: "Mock accepted conference paper",
    authors: ["Example Author"],
    kind: "conference",
    status: "accepted",
    url: "https://example.com/accepted",
    links: [],
    tags: ["mock"],
    visibility: "public",
    updatedAt: "2026-09-28",
    mock: true,
  },
  {
    id: "mock-preprint-entry",
    title: "A deliberately long mock preprint title used to verify wrapping and missing venue behavior",
    authors: ["Example Author"],
    kind: "preprint",
    status: "under-review",
    links: [],
    tags: ["mock"],
    visibility: "public",
    updatedAt: "2026-09-28",
    mock: true,
  },
  {
    id: "mock-working-paper",
    title: "Mock working paper without a DOI",
    authors: ["Example Author"],
    kind: "working-paper",
    status: "in-progress",
    links: [],
    tags: ["mock"],
    visibility: "public",
    updatedAt: "2026-09-28",
    mock: true,
  },
] satisfies PublicationData[];

export const mockPublications = mockPublicationEntries.map(
  ({ id, title, mock }) => ({ id, data: { title, mock } }),
) satisfies PublicationCandidate[];
