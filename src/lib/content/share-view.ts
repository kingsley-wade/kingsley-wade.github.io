export type ShareLinkCardInput = {
  id: string;
  title: string;
  summary: string;
  source?: string;
  sourceUrl: string;
};

export const toShareLinkCard = ({
  id,
  title,
  summary,
  source,
  sourceUrl,
}: ShareLinkCardInput) => ({
  id,
  kind: "link" as const,
  title,
  summary,
  ...(source ? { source } : {}),
  href: sourceUrl,
});
