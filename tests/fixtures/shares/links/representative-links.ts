export const representativeShareLinks = [
  {
    id: "linuxtoy-os-guide",
    kind: "link" as const,
    title: "LinuxToy OS guide",
    summary: "A practical operating systems guide.",
    source: "LinuxToy",
    sourceUrl: "https://i.linuxtoy.org/docs/guide/index.html",
  },
  {
    id: "external-markdown-guide",
    kind: "link" as const,
    title: "External Markdown guide",
    summary: "A Markdown document hosted elsewhere.",
    sourceUrl: "https://example.com/notes/guide.md",
  },
  {
    id: "arxiv-paper",
    kind: "link" as const,
    title: "An arXiv paper",
    summary: "A paper record from arXiv.",
    source: "arXiv",
    sourceUrl: "https://arxiv.org/abs/2401.00001",
  },
  {
    id: "engineering-blog",
    kind: "link" as const,
    title: "Engineering blog post",
    summary: "A blog post worth revisiting.",
    source: "Example Blog",
    sourceUrl: "https://example.com/blog/engineering-notes",
  },
] as const;
