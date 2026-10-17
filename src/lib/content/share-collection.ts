export type OrderedShare = {
  data: { visibility: "public" | "hidden"; order: number };
};

export const selectPublicShares = <T extends OrderedShare>(entries: readonly T[]): T[] =>
  entries
    .filter(({ data }) => data.visibility === "public")
    .sort((first, second) => first.data.order - second.data.order);
