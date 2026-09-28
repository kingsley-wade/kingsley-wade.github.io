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

export const siteConfig: SiteConfig = {
  identity: {
    displayName: "Your Name",
    handle: "your-handle",
    affiliation: "Your institution or organization",
    focus: "Your field and current focus",
  },
  metadata: {
    title: "Your Name | Personal Homepage",
    description: "A personal homepage for your work and interests.",
    locale: "en",
  },
  canonicalUrl: import.meta.env.PUBLIC_SITE_URL ?? "https://example.github.io",
  contacts: [
    { label: "Email", href: "mailto:hello@example.com" },
    { label: "GitHub", href: "https://github.com/your-handle" },
  ],
  features: {
    audio: true,
    assistantStatus: true,
    playgroundTerminal: true,
  },
  assistantBaseUrl: import.meta.env.PUBLIC_ASSISTANT_API_BASE_URL?.trim() || null,
};

export const withBase = (path: string): string => {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${path.replace(/^\/+/, "")}`;
};
