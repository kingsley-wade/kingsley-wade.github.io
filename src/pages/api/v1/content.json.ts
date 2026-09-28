import type { APIRoute } from "astro";

import { siteConfig } from "../../../config/site";
import { sectionRegistry } from "../../../core/section-registry";
import {
  getValidatedSectionEntries,
  toPublicContentItem,
} from "../../../lib/content/public-content";

export const prerender = true;

export const GET: APIRoute = async () => {
  const sections = await Promise.all(
    sectionRegistry.map(async (section, index) => {
      const entries = await getValidatedSectionEntries(section);
      return {
        id: section.id,
        label: section.label,
        order: index + 1,
        items: entries.map((entry) => toPublicContentItem(section.id, entry)),
      };
    }),
  );
  const email = siteConfig.contacts
    .find(({ href }) => href.startsWith("mailto:"))
    ?.href.replace(/^mailto:/, "");
  const document = {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    revision: import.meta.env.PUBLIC_COMMIT_SHA?.trim() || "local",
    profile: {
      displayName: siteConfig.identity.displayName,
      ...(email ? { email } : {}),
      affiliation: siteConfig.identity.affiliation,
      focus: siteConfig.identity.focus,
      contacts: siteConfig.contacts,
    },
    sections,
  };

  return new Response(JSON.stringify(document, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
};
