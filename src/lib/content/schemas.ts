import { z } from "astro/zod";

export const stableIdSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase kebab-case stable ID");

export const visibilitySchema = z.enum(["public", "hidden"]);

export const publicLinkSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
});

const publicEntryBase = z.object({
  id: stableIdSchema,
  title: z.string().min(1),
  summary: z.string().min(1).optional(),
  links: z.array(publicLinkSchema).default([]),
  tags: z.array(z.string().min(1)).default([]),
  visibility: visibilitySchema.default("public"),
  updatedAt: z.iso.date(),
});

export const aboutSchema = publicEntryBase.extend({
  status: z.string().min(1).optional(),
});

export const educationSchema = publicEntryBase.extend({
  institution: z.string().min(1),
  period: z.string().min(1),
  detail: z.string().min(1),
  note: z.string().min(1).optional(),
  order: z.number().int().nonnegative(),
});

export const researchSchema = publicEntryBase.extend({
  period: z.string().min(1),
  role: z.string().min(1).optional(),
  order: z.number().int().nonnegative(),
});

export const publicationKinds = [
  "journal",
  "conference",
  "preprint",
  "working-paper",
] as const;
export const publicationStatuses = [
  "published",
  "accepted",
  "under-review",
  "in-progress",
] as const;

export const publicationSchema = publicEntryBase.extend({
  authors: z.array(z.string().min(1)).min(1),
  kind: z.enum(publicationKinds),
  status: z.enum(publicationStatuses),
  venue: z.string().min(1).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  doi: z.string().min(1).optional(),
  url: z.url().optional(),
  mock: z.boolean().default(false),
});

export const miscSchema = publicEntryBase.extend({
  sectionId: stableIdSchema,
  order: z.number().int().nonnegative(),
});

export type PublicationData = z.infer<typeof publicationSchema>;
