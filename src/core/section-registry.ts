import {
  audioScaleIds,
  rendererIds,
  sectionKinds,
  sectionVisibility,
  terminalCommandIds,
  type SectionManifest,
} from "./section-contract";

type ManifestModule = { default: SectionManifest };
type DiscoveredModules = Record<string, ManifestModule>;

const isOneOf = <T extends string>(value: unknown, values: readonly T[]): value is T =>
  typeof value === "string" && values.includes(value as T);

export const validateSectionRegistry = (
  entries: Array<{ source: string; manifest: SectionManifest }>,
): string[] => {
  const errors: string[] = [];
  const ids = new Map<string, string>();
  const orders = new Map<number, string>();

  for (const { source, manifest } of entries) {
    if (!/^[a-z][a-z0-9-]*$/.test(manifest.id)) {
      errors.push(`${source}: invalid section id "${manifest.id}"`);
    }
    if (!manifest.label.trim()) errors.push(`${source}: label is required`);
    if (!Number.isInteger(manifest.order) || manifest.order < 0) {
      errors.push(`${source}: order must be a non-negative integer`);
    }
    if (!isOneOf(manifest.kind, sectionKinds)) {
      errors.push(`${source}: unknown section kind "${manifest.kind}"`);
    }
    if (!isOneOf(manifest.visibility, sectionVisibility)) {
      errors.push(`${source}: unknown visibility "${manifest.visibility}"`);
    }
    if (!isOneOf(manifest.renderer, rendererIds)) {
      errors.push(`${source}: unknown renderer "${manifest.renderer}"`);
    }
    if (!isOneOf(manifest.audioScale, audioScaleIds)) {
      errors.push(`${source}: unknown audio scale "${manifest.audioScale}"`);
    }
    if (manifest.kind === "content" && !manifest.contentCollection) {
      errors.push(`${source}: content sections require contentCollection`);
    }
    for (const command of manifest.terminalCommands ?? []) {
      if (!isOneOf(command, terminalCommandIds)) {
        errors.push(`${source}: unknown terminal command "${command}"`);
      }
    }

    const previousId = ids.get(manifest.id);
    if (previousId) {
      errors.push(`${source}: duplicate id "${manifest.id}" also used by ${previousId}`);
    } else {
      ids.set(manifest.id, source);
    }

    const previousOrder = orders.get(manifest.order);
    if (previousOrder) {
      errors.push(
        `${source}: duplicate order ${manifest.order} also used by ${previousOrder}`,
      );
    } else {
      orders.set(manifest.order, source);
    }
  }
  return errors;
};

export const createSectionRegistry = (
  modules: DiscoveredModules,
): readonly SectionManifest[] => {
  const entries = Object.entries(modules).map(([source, module]) => ({
    source,
    manifest: module.default,
  }));
  const errors = validateSectionRegistry(entries);
  if (errors.length > 0) {
    throw new Error(`Invalid section registry:\n${errors.join("\n")}`);
  }
  return entries
    .map(({ manifest }) => manifest)
    .filter(({ visibility }) => visibility === "public")
    .sort((first, second) => first.order - second.order);
};

const discoveredModules = import.meta.glob<ManifestModule>(
  "../modules/*/manifest.ts",
  { eager: true },
);

export const sectionRegistry = createSectionRegistry(discoveredModules);
