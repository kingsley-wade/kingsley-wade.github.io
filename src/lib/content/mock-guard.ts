export type PublicationCandidate = {
  id: string;
  data: {
    title: string;
    mock?: boolean;
  };
};

export const assertNoProductionMocks = (
  entries: readonly PublicationCandidate[],
  production: boolean,
): void => {
  if (!production) return;
  const mockEntries = entries.filter(({ data }) => data.mock);
  if (mockEntries.length > 0) {
    throw new Error(
      `Production content includes mock publications: ${mockEntries
        .map(({ id }) => id)
        .join(", ")}. Move mock data to tests/fixtures only.`,
    );
  }
};
