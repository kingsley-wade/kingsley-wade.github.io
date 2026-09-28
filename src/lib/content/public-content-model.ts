export type SerializablePublicEntry = {
  id: string;
  data: {
    title: string;
    summary?: string;
    links: Array<{ label: string; url: string }>;
    tags: string[];
    visibility: "public" | "hidden";
    updatedAt: string;
    [key: string]: unknown;
  };
  rendered?: { html: string };
};

export type PublicContentItem = {
  id: string;
  section: string;
  title: string;
  summary?: string;
  bodyHtml: string;
  links: Array<{ label: string; url: string }>;
  tags: string[];
  visibility: "public";
  updatedAt: string;
  details: Record<string, unknown>;
};

const commonDataKeys = new Set([
  "id",
  "title",
  "summary",
  "links",
  "tags",
  "visibility",
  "updatedAt",
  "order",
  "sectionId",
  "mock",
]);

export const toPublicContentItem = (
  sectionId: string,
  entry: SerializablePublicEntry,
): PublicContentItem => {
  const details = Object.fromEntries(
    Object.entries(entry.data).filter(([key, value]) => {
      return !commonDataKeys.has(key) && value !== undefined;
    }),
  );
  return {
    id: entry.id,
    section: sectionId,
    title: entry.data.title,
    ...(entry.data.summary ? { summary: entry.data.summary } : {}),
    bodyHtml: entry.rendered?.html ?? "",
    links: entry.data.links,
    tags: entry.data.tags,
    visibility: "public",
    updatedAt: entry.data.updatedAt,
    details,
  };
};
