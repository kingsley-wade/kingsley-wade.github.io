export const templateMarkers: Array<{ id: string; pattern: RegExp }>;
export const inspectTemplate: (directory: string) => Promise<string[]>;
