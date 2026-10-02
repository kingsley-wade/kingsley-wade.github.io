import type { SectionManifest } from "../../core/section-contract";

export type TerminalDirectory = Pick<
  SectionManifest,
  "id" | "label" | "shortLabel" | "terminalCommands" | "terminalAliases"
>;

export type FilesystemEffect = {
  lines: string[];
  currentPath: string;
  navigateTo?: string;
};

const pathToken = (value: string): string => value.trim().toLowerCase().replace(/^\/+|\/+$/g, "");

export const createTerminalFilesystem = (sections: readonly SectionManifest[]) => {
  const directories = sections.filter((section) => section.visibility === "public");
  const byToken = new Map<string, SectionManifest>();
  for (const section of directories) {
    for (const token of [section.id, section.label, section.shortLabel, ...(section.terminalAliases ?? [])]) {
      if (token) byToken.set(pathToken(token.replaceAll("/", "-")), section);
    }
  }

  let currentPath = "/";
  const sectionForPath = () => (currentPath === "/" ? undefined : byToken.get(currentPath.slice(1)));
  const available = () => directories.map((section) => section.id).join("  ");
  const list = () => {
    const active = sectionForPath()?.id;
    return directories.map((section) => `${section.id}/${section.id === active ? "  *" : ""}`.trimEnd()).join("  ");
  };
  const resolve = (raw: string) => {
    const token = pathToken(raw);
    if (!token || token === ".") return sectionForPath();
    if (token === ".." || token === "/") return undefined;
    return byToken.get(token.replaceAll("/", "-"));
  };

  return {
    get currentPath() {
      return currentPath;
    },
    setCurrentSection(id: string | undefined) {
      const section = id ? byToken.get(pathToken(id)) : undefined;
      currentPath = section ? `/${section.id}` : "/";
    },
    directories: directories as readonly TerminalDirectory[],
    completions(prefix: string) {
      const normalized = pathToken(prefix);
      return directories
        .flatMap((section) => [section.id, ...(section.terminalAliases ?? [])])
        .filter((token) => token.startsWith(normalized));
    },
    list,
    available,
    resolve,
    navigate(raw: string): FilesystemEffect {
      const token = pathToken(raw);
      if (token === ".." || token === "/") {
        currentPath = "/";
        return { lines: ["moved to /"], currentPath };
      }
      const section = resolve(raw);
      if (!section) {
        return {
          lines: [`path not found: ${raw}`, `available: ${available()}`],
          currentPath,
        };
      }
      currentPath = `/${section.id}`;
      return {
        lines: [`opened ${currentPath}`, section.label],
        currentPath,
        navigateTo: section.id,
      };
    },
    tree(): string[] {
      return [
        "/",
        ...directories.map((section) => {
          const commands = section.terminalCommands?.join(", ") || "section content";
          return `|- ${section.id}/  [${commands}]`;
        }),
      ];
    },
  };
};

export type TerminalFilesystem = ReturnType<typeof createTerminalFilesystem>;
