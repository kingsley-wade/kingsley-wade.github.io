import {
  GrayScottSimulation,
  grayScottPresets,
  type GrayScottPreset,
} from "./gray-scott";

const paletteFromTheme = (root: HTMLElement): Uint8Array => {
  const styles = getComputedStyle(root);
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 1;
  const context = canvas.getContext("2d");
  const palette = new Uint8Array(256 * 3);
  if (!context) return palette;

  const gradient = context.createLinearGradient(0, 0, 256, 0);
  gradient.addColorStop(0, styles.getPropertyValue("--color-surface").trim() || "#ffffff");
  gradient.addColorStop(0.25, styles.getPropertyValue("--color-surface-mint").trim() || "#ddf4e8");
  gradient.addColorStop(0.48, styles.getPropertyValue("--color-surface-lavender").trim() || "#e9e1f7");
  gradient.addColorStop(0.72, styles.getPropertyValue("--color-surface-coral").trim() || "#f6d7df");
  gradient.addColorStop(0.9, styles.getPropertyValue("--color-link").trim() || "#075e75");
  gradient.addColorStop(1, styles.getPropertyValue("--color-link").trim() || "#315d70");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 1);
  const colors = context.getImageData(0, 0, 256, 1).data;
  for (let index = 0; index < 256; index += 1) {
    palette[index * 3] = colors[index * 4];
    palette[index * 3 + 1] = colors[index * 4 + 1];
    palette[index * 3 + 2] = colors[index * 4 + 2];
  }
  return palette;
};

export const initReactionDiffusionLab = (root: HTMLElement): void => {
  const canvas = root.querySelector<HTMLCanvasElement>("[data-reaction-canvas]");
  const presetSelect = root.querySelector<HTMLSelectElement>("[data-reaction-preset]");
  const feedInput = root.querySelector<HTMLInputElement>("[data-feed]");
  const killInput = root.querySelector<HTMLInputElement>("[data-kill]");
  const feedValue = root.querySelector<HTMLOutputElement>("[data-feed-value]");
  const killValue = root.querySelector<HTMLOutputElement>("[data-kill-value]");
  const toggleButton = root.querySelector<HTMLButtonElement>("[data-reaction-toggle]");
  const resetButton = root.querySelector<HTMLButtonElement>("[data-reaction-reset]");
  const status = root.querySelector<HTMLElement>("[data-reaction-status]");
  const context = canvas?.getContext("2d", { alpha: false });
  if (
    !canvas ||
    !presetSelect ||
    !feedInput ||
    !killInput ||
    !feedValue ||
    !killValue ||
    !toggleButton ||
    !resetButton ||
    !status ||
    !context
  ) {
    return;
  }

  const palette = paletteFromTheme(root);
  let selectedPreset: GrayScottPreset = grayScottPresets[0];
  const simulation = new GrayScottSimulation(canvas.width, canvas.height, selectedPreset);
  let animationFrame = 0;
  let running = false;

  const currentValues = () => ({
    feed: Number(feedInput.value),
    kill: Number(killInput.value),
  });
  const updateLabels = () => {
    const { feed, kill } = currentValues();
    feedValue.value = feed.toFixed(3);
    feedValue.textContent = feed.toFixed(3);
    killValue.value = kill.toFixed(3);
    killValue.textContent = kill.toFixed(3);
    simulation.setParameters(feed, kill);
  };
  const draw = () => simulation.draw(context, palette);
  const pause = () => {
    running = false;
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    toggleButton.textContent = "Run simulation";
    toggleButton.setAttribute("aria-pressed", "false");
  };
  const animate = () => {
    if (!running) return;
    simulation.step(4);
    draw();
    animationFrame = requestAnimationFrame(animate);
  };
  const run = () => {
    if (running) return;
    running = true;
    toggleButton.textContent = "Pause simulation";
    toggleButton.setAttribute("aria-pressed", "true");
    status.textContent = "Running · adjust the parameters to change the pattern.";
    animationFrame = requestAnimationFrame(animate);
  };

  const selectedOption = presetSelect.selectedOptions[0];
  if (selectedOption) {
    selectedPreset = {
      id: selectedOption.value,
      label: selectedOption.textContent?.trim() ?? "Window Seat",
      feed: Number(selectedOption.dataset.presetFeed),
      kill: Number(selectedOption.dataset.presetKill),
    };
  }
  simulation.reset(selectedPreset);
  draw();

  presetSelect.addEventListener("change", () => {
    const option = presetSelect.selectedOptions[0];
    if (!option || option.value === "custom") return;
    pause();
    selectedPreset = {
      id: option.value,
      label: option.textContent?.trim() ?? option.value,
      feed: Number(option.dataset.presetFeed),
      kill: Number(option.dataset.presetKill),
    };
    feedInput.value = selectedPreset.feed.toFixed(3);
    killInput.value = selectedPreset.kill.toFixed(3);
    simulation.reset(selectedPreset);
    updateLabels();
    draw();
    status.textContent = selectedPreset.label + " preset · ready to run.";
  });

  const changeParameter = () => {
    presetSelect.value = "custom";
    updateLabels();
    draw();
    status.textContent = "Custom parameters · run the simulation to explore this pattern.";
  };
  feedInput.addEventListener("input", changeParameter);
  killInput.addEventListener("input", changeParameter);

  toggleButton.addEventListener("click", () => {
    if (running) {
      pause();
      status.textContent = "Paused · your pattern is ready to inspect.";
      return;
    }
    run();
  });

  resetButton.addEventListener("click", () => {
    pause();
    const isCustom = presetSelect.value === "custom";
    simulation.reset(
      isCustom
        ? { ...selectedPreset, ...currentValues(), id: "custom", label: "Custom" }
        : selectedPreset,
    );
    updateLabels();
    draw();
    status.textContent = "Pattern reset · initial conditions restored.";
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  reducedMotion.addEventListener("change", (event) => {
    if (!event.matches || !running) return;
    pause();
    status.textContent = "Paused · reduced motion is enabled.";
  });
  window.addEventListener("section:changed", (event) => {
    const detail = (event as CustomEvent<{ id?: string }>).detail;
    if (detail?.id === "playground" || !running) return;
    pause();
    status.textContent = "Paused · return to the Playground to continue.";
  });

  if (!reducedMotion.matches) run();
};
