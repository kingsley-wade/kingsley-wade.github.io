export type ContactLink = {
  label: string;
  href: string;
};

export type FeatureFlags = {
  audio: boolean;
  assistantStatus: boolean;
  playgroundTerminal: boolean;
};

export type SiteConfig = {
  identity: {
    displayName: string;
    handle: string;
    affiliation: string;
    focus: string;
  };
  metadata: {
    title: string;
    description: string;
    locale: string;
  };
  canonicalUrl: string;
  contacts: ContactLink[];
  features: FeatureFlags;
  assistantBaseUrl: string | null;
};

const normalizeOptionalUrl = (value: string | undefined): string | null => {
  const normalized = value?.trim();
  return normalized ? normalized.replace(/\/+$/, "") : null;
};

export const siteConfig: SiteConfig = {
  identity: {
    displayName: "Manting Guo",
    handle: "kingsley-wade",
    affiliation: "Shanghai Jiao Tong University",
    focus: "Applied Mathematics / Agent Systems",
  },
  metadata: {
    title: "Manting Guo | Personal Homepage",
    description:
      "Research, education, publications, and personal interests of Manting Guo.",
    locale: "en",
  },
  canonicalUrl: import.meta.env.PUBLIC_SITE_URL ?? "https://kingsley-wade.github.io",
  contacts: [
    {
      label: "Email",
      href: "mailto:kingsleyrex@sjtu.edu.cn",
    },
    {
      label: "GitHub",
      href: "https://github.com/kingsley-wade",
    },
  ],
  features: {
    audio: true,
    assistantStatus: true,
    playgroundTerminal: true,
  },
  assistantBaseUrl: normalizeOptionalUrl(
    import.meta.env.PUBLIC_ASSISTANT_API_BASE_URL,
  ),
};

export const withBase = (path: string): string => {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${path.replace(/^\/+/, "")}`;
};
