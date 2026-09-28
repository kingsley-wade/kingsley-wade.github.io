export type SectionRoute = {
  id: string;
  label: string;
};

export type RouteAdapter = {
  readHash(): string;
  pushHash(hash: string): void;
  replaceHash(hash: string): void;
  applyActive(id: string): void;
  focusPanel(id: string): void;
  focusMenu(id: string): void;
  setTitle(label: string): void;
  reportFallback(invalidHash: string): void;
};

export type ShortcutContext = {
  key: string;
  target: EventTarget | null;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
};

export const sectionIdFromHash = (hash: string): string =>
  decodeURIComponent(hash.replace(/^#/, "")).trim().toLowerCase();

export const isTypingTarget = (target: EventTarget | null): boolean => {
  if (typeof HTMLElement === "undefined") return false;
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
};

export const createSectionRouter = (
  routes: readonly SectionRoute[],
  adapter: RouteAdapter,
) => {
  if (routes.length === 0) throw new Error("Section router requires at least one route");
  const routeById = new Map(routes.map((route) => [route.id, route]));
  const fallback = routes[0];
  let activeId = fallback.id;

  const activate = (id: string, focusPanel: boolean) => {
    const route = routeById.get(id) ?? fallback;
    activeId = route.id;
    adapter.applyActive(route.id);
    adapter.setTitle(route.label);
    if (focusPanel) adapter.focusPanel(route.id);
  };

  const syncFromLocation = (focusPanel = false) => {
    const rawHash = adapter.readHash();
    const requested = sectionIdFromHash(rawHash);
    if (!requested) {
      adapter.replaceHash(`#${fallback.id}`);
      activate(fallback.id, focusPanel);
      return;
    }
    if (!routeById.has(requested)) {
      adapter.reportFallback(rawHash);
      adapter.replaceHash(`#${fallback.id}`);
      activate(fallback.id, focusPanel);
      return;
    }
    activate(requested, focusPanel);
  };

  const select = (id: string, focusPanel = true) => {
    if (!routeById.has(id)) return false;
    adapter.pushHash(`#${id}`);
    activate(id, focusPanel);
    return true;
  };

  const handleShortcut = (context: ShortcutContext): boolean => {
    if (context.altKey || context.ctrlKey || context.metaKey) return false;
    if (context.key === "Escape") {
      adapter.focusMenu(activeId);
      return true;
    }
    if (isTypingTarget(context.target)) return false;
    if (!/^[1-9]$/.test(context.key)) return false;
    const route = routes[Number(context.key) - 1];
    return route ? select(route.id) : false;
  };

  syncFromLocation();

  return {
    select,
    syncFromLocation,
    handleShortcut,
    get activeId() {
      return activeId;
    },
  };
};

export const initSectionRouter = (): (() => void) => {
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("[data-section-link]"),
  );
  const panels = Array.from(
    document.querySelectorAll<HTMLElement>("[data-section-panel]"),
  );
  const routes = links.map((link) => ({
    id: link.dataset.sectionLink ?? "",
    label: link.dataset.sectionLabel ?? link.textContent?.trim() ?? "Section",
  }));
  const baseTitle = document.title.replace(/^.*? \| /, "");

  const adapter: RouteAdapter = {
    readHash: () => window.location.hash,
    pushHash: (hash) => window.history.pushState(null, "", hash),
    replaceHash: (hash) => window.history.replaceState(null, "", hash),
    applyActive: (id) => {
      for (const panel of panels) {
        const active = panel.dataset.sectionPanel === id;
        panel.dataset.active = String(active);
        panel.hidden = !active;
      }
      for (const link of links) {
        if (link.dataset.sectionLink === id) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      }
      const activeLink = links.find((link) => link.dataset.sectionLink === id);
      window.dispatchEvent(
        new CustomEvent("section:changed", {
          detail: {
            id,
            audioScale: activeLink?.dataset.audioScale ?? null,
          },
        }),
      );
    },
    focusPanel: (id) =>
      document
        .querySelector<HTMLElement>(`[data-section-panel="${CSS.escape(id)}"] h2`)
        ?.focus(),
    focusMenu: (id) =>
      document
        .querySelector<HTMLElement>(`[data-section-link="${CSS.escape(id)}"]`)
        ?.focus(),
    setTitle: (label) => {
      document.title = `${label} | ${baseTitle}`;
    },
    reportFallback: (invalidHash) => {
      document.documentElement.dataset.routeFallback = invalidHash || "empty";
      console.warn(`Unknown section hash ${invalidHash}; showing ${routes[0]?.id}.`);
    },
  };
  const router = createSectionRouter(routes, adapter);

  const onClick = (event: MouseEvent) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>(
      "[data-section-link]",
    );
    if (!link?.dataset.sectionLink) return;
    event.preventDefault();
    router.select(link.dataset.sectionLink);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const handled = router.handleShortcut(event);
    if (handled) event.preventDefault();
  };
  const onHashChange = () => router.syncFromLocation(true);

  document.addEventListener("click", onClick);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("hashchange", onHashChange);

  return () => {
    document.removeEventListener("click", onClick);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("hashchange", onHashChange);
  };
};
