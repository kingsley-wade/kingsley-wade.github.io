export const initPhotoGallery = (root: HTMLElement): void => {
  const dialog = root.querySelector<HTMLDialogElement>("[data-photo-dialog]");
  const dialogImage = root.querySelector<HTMLImageElement>("[data-photo-dialog-image]");
  const dialogCaption = root.querySelector<HTMLElement>("[data-photo-dialog-caption]");
  const closeButton = root.querySelector<HTMLButtonElement>("[data-photo-close]");
  const tiles = [...root.querySelectorAll<HTMLButtonElement>("[data-photo-open]")];
  if (!dialog || !dialogImage || !closeButton || tiles.length === 0) return;

  let returnFocusTo: HTMLButtonElement | null = null;

  tiles.forEach((tile) => {
    const image = tile.querySelector<HTMLImageElement>("img");
    if (!image) return;

    tile.addEventListener("click", () => {
      returnFocusTo = tile;
      dialogImage.src = image.currentSrc || image.src;
      dialogImage.alt = image.alt;
      const caption = tile.dataset.photoCaption ?? "";
      if (dialogCaption) {
        dialogCaption.textContent = caption;
        dialogCaption.hidden = caption === "";
      }
      dialog.showModal();
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    dialogImage.removeAttribute("src");
    returnFocusTo?.focus();
    returnFocusTo = null;
  });

  root.querySelectorAll<HTMLButtonElement>("[data-photo-group-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const group = toggle.closest<HTMLElement>("[data-photo-group]");
      const panel = group?.querySelector<HTMLElement>(".photo-group__panel");
      if (!panel) return;
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
    });
  });
};
