import { getCollection, type CollectionEntry } from "astro:content";

import type { SectionManifest } from "../../core/section-contract";

import { assertNoProductionMocks } from "./mock-guard";

export const getValidatedPublications = async (): Promise<
  CollectionEntry<"publications">[]
> => {
  const entries = await getCollection(
    "publications",
    ({ data }) => data.visibility === "public",
  );
  assertNoProductionMocks(entries, import.meta.env.PROD);
  return entries;
};

export type PublicCollectionName =
  | "about"
  | "education"
  | "research"
  | "publications"
  | "misc";

export type AnyPublicEntry = CollectionEntry<PublicCollectionName>;

export const getValidatedSectionEntries = async (
  section: SectionManifest,
): Promise<AnyPublicEntry[]> => {
  if (!section.contentCollection) return [];
  const collection = section.contentCollection as PublicCollectionName;
  const entries = (await getCollection(
    collection,
    ({ data }) =>
      data.visibility === "public" &&
      (!("sectionId" in data) || data.sectionId === section.id),
  )) as AnyPublicEntry[];
  if (collection === "publications") {
    assertNoProductionMocks(
      entries as CollectionEntry<"publications">[],
      import.meta.env.PROD,
    );
  }
  return entries.sort(
    (first, second) =>
      ("order" in first.data ? first.data.order : 0) -
      ("order" in second.data ? second.data.order : 0),
  );
};

export { assertNoProductionMocks } from "./mock-guard";
export {
  toPublicContentItem,
  type PublicContentItem,
} from "./public-content-model";
