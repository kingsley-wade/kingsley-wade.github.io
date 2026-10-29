export const initPhotoGallery = (root: HTMLElement): void => {
  const dialog = root.querySelector<HTMLDialogElement>("[data-photo-dialog]");
  const dialogImage = root.querySelector<HTMLImageElement>("[data-photo-dialog-image]");
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
};
