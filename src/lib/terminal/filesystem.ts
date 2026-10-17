import type { SectionManifest } from "../../core/section-contract";

export type TerminalDirectory = Pick<
  SectionManifest,
  "id" | "label" | "shortLabel" | "terminalCommands" | "terminalAliases"
>;

export type TerminalShare = {
  id: string;
  kind: "note" | "link";
  title: string;
};

export type FilesystemEffect = {
  lines: string[];
  currentPath: string;
  navigateTo?: string;
  pathChanged?: boolean;
  focusItemId?: string;
};

const normalizeSegments = (value: string): string[] =>
  value
    .trim()
    .toLowerCase()
    .split("/")
    .filter((segment) => segment && segment !== ".");

export const createTerminalFilesystem = (
  sections: readonly SectionManifest[],
  shares: readonly TerminalShare[] = [],
) => {
  const directories = sections.filter((section) => section.visibility === "public");
  const sectionById = new Map(directories.map((section) => [section.id, section]));
  const sectionAlias = new Map(
    directories.flatMap((section) => (section.terminalAliases ?? []).map((alias) => [alias, section.id] as const)),
  );
  const shareById = new Map(shares.map((share) => [share.id, share]));
  let path: string[] = [];

  const pathString = () => `/${path.join("/")}`;
  const category = () =>
    path[0] === "playground" && (path[1] === "notes" || path[1] === "links")
      ? path[1]
      : undefined;
  const sharesForCategory = (kind: TerminalShare["kind"]) =>
    shares.filter((share) => share.kind === kind);
  const availableAt = (segments: string[]) => {
    if (segments.length >= 2 && segments[0] === "playground") {
      if (segments.length === 2) {
        const kind = segments[1] === "notes" ? "note" : "link";
        return sharesForCategory(kind).map((share) => share.id).join("  ") || "(empty)";
      }
      return segments[2] ?? "";
    }
    if (segments.length === 1 && segments[0] === "playground") {
      return `${directories.map(({ id }) => `${id}/`).join("  ")}  notes/  links/`;
    }
    return directories.map((section) => `${section.id}/`).join("  ");
  };
  const list = () => {
    const currentCategory = category();
    if (currentCategory) {
      const kind = currentCategory === "notes" ? "note" : "link";
      return sharesForCategory(kind).map((share) => `${share.id}/`).join("  ") || "(empty)";
    }
    if (path.length === 1 && path[0] === "playground") {
      return `${directories.map(({ id }) => `${id}/`).join("  ")}  notes/  links/`;
    }
    const active = path[0];
    return directories
      .map((section) => `${section.id}/${section.id === active ? "  *" : ""}`.trimEnd())
      .join("  ");
  };
  const resolveTarget = (raw: string): string[] | undefined => {
    const absolute = raw.trim().startsWith("/");
    const target: string[] = absolute ? [] : [...path];
    for (const segment of normalizeSegments(raw)) {
      if (segment === "..") {
        target.pop();
        continue;
      }
      // Section names are top-level directories; entering one from a nested
      // playground path starts over from the root instead of failing.
      if (sectionById.has(segment) || sectionAlias.has(segment)) target.length = 0;
      target.push(segment);
    }
    if (target.length === 0) return target;
    if (!sectionById.has(target[0])) {
      const aliasTarget = sectionAlias.get(target[0]);
      if (!aliasTarget) return undefined;
      target[0] = aliasTarget;
    }
    if (target.length === 1) return target;
    if (target[0] !== "playground" || !["notes", "links"].includes(target[1])) return undefined;
    if (target.length === 2) return target;
    if (target.length === 3) {
      const share = shareById.get(target[2]);
      const kind = target[1] === "notes" ? "note" : "link";
      return share?.kind === kind ? target : undefined;
    }
    return undefined;
  };

  return {
    get currentPath() {
      return pathString();
    },
    setCurrentSection(id: string | undefined) {
      path = id && sectionById.has(id) ? [id] : [];
    },
    directories: directories as readonly TerminalDirectory[],
    completions(prefix: string) {
      const currentCategory = category();
      const kind = currentCategory === "notes" ? "note" : currentCategory === "links" ? "link" : undefined;
      const tokens = kind
        ? sharesForCategory(kind).map((share) => share.id)
        : path[0] === "playground"
          ? ["notes", "links"]
          : directories.flatMap((section) => [section.id, ...(section.terminalAliases ?? [])]);
      const normalized = prefix.trim().toLowerCase().replace(/^\/+/, "");
      return tokens.filter((token) => token.startsWith(normalized));
    },
    list,
    available() {
      return availableAt(path);
    },
    navigate(raw: string): FilesystemEffect {
      const target = resolveTarget(raw);
      if (!target) {
        return {
          lines: [`path not found: ${raw}`, `available: ${availableAt(path)}`],
          currentPath: pathString(),
        };
      }
      path = target;
      const sectionId = target[0];
      const pathChanged = true;
      return {
        lines: [`moved to ${pathString()}`],
        currentPath: pathString(),
        ...(target.length === 1 && sectionId ? { navigateTo: sectionId } : {}),
        pathChanged,
      };
    },
    open(raw: string): FilesystemEffect {
      const id = raw.trim().toLowerCase();
      const kind = category() === "notes" ? "note" : category() === "links" ? "link" : undefined;
      const share = shareById.get(id);
      if (!kind || !share || share.kind !== kind) {
        return {
          lines: [`item not found: ${raw}`, `available: ${availableAt(path)}`],
          currentPath: pathString(),
        };
      }
      return {
        lines: [`opening ${share.id}: ${share.title}`],
        currentPath: pathString(),
        focusItemId: share.id,
      };
    },
    tree(): string[] {
      return [
        "/",
        ...directories.map((section) => {
          if (section.id !== "playground") {
            const commands = section.terminalCommands?.join(", ") || "section content";
            return `|- ${section.id}/  [${commands}]`;
          }
          return [
            "|- playground/",
            ...(["notes", "links"] as const).map((name) => {
              const kind = name === "notes" ? "note" : "link";
              return `|  |- ${name}/  [${sharesForCategory(kind).map(({ id }) => id).join(", ") || "empty"}]`;
            }),
          ].join("\n");
        }),
      ];
    },
  };
};

export type TerminalFilesystem = ReturnType<typeof createTerminalFilesystem>;
