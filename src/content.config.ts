import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

import {
  aboutSchema,
  educationSchema,
  miscSchema,
  publicationSchema,
  researchSchema,
} from "./lib/content/schemas";

const stableId = ({ data, entry }: { data: Record<string, unknown>; entry: string }) =>
  typeof data.id === "string" ? data.id : entry.replace(/\.[^.]+$/, "");

const about = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/about", generateId: stableId }),
  schema: aboutSchema,
});

const education = defineCollection({
  loader: glob({ pattern: "**/*.{yaml,yml,json}", base: "./src/content/education", generateId: stableId }),
  schema: educationSchema,
});

const research = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/research", generateId: stableId }),
  schema: researchSchema,
});

const publications = defineCollection({
  loader: glob({ pattern: "**/*.{yaml,yml,json}", base: "./src/content/publications", generateId: stableId }),
  schema: publicationSchema,
});

const misc = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/misc", generateId: stableId }),
  schema: miscSchema,
});

export const collections = { about, education, research, publications, misc };
