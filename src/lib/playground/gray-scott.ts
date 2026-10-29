export type GrayScottPreset = {
  id: string;
  label: string;
  feed: number;
  kill: number;
};

export const grayScottPresets: readonly GrayScottPreset[] = [
  { id: "window-seat", label: "Window Seat", feed: 0.035, kill: 0.065 },
  { id: "blue-hour", label: "Blue Hour", feed: 0.022, kill: 0.051 },
  { id: "after-hours", label: "After Hours", feed: 0.029, kill: 0.057 },
];

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export class GrayScottSimulation {
  readonly width: number;
  readonly height: number;
  private a: Float32Array;
  private b: Float32Array;
  private nextA: Float32Array;
  private nextB: Float32Array;
  private preset: GrayScottPreset;
  private feed: number;
  private kill: number;

  constructor(width: number, height: number, preset: GrayScottPreset) {
    this.width = Math.max(8, Math.floor(width));
    this.height = Math.max(8, Math.floor(height));
    const size = this.width * this.height;
    this.a = new Float32Array(size);
    this.b = new Float32Array(size);
    this.nextA = new Float32Array(size);
    this.nextB = new Float32Array(size);
    this.preset = preset;
    this.feed = preset.feed;
    this.kill = preset.kill;
    this.reset(preset);
  }

  setParameters(feed: number, kill: number): void {
    this.feed = clamp(feed, 0.01, 0.08);
    this.kill = clamp(kill, 0.045, 0.07);
  }

  reset(preset: GrayScottPreset = this.preset): void {
    this.preset = preset;
    this.feed = preset.feed;
    this.kill = preset.kill;
    this.a.fill(1);
    this.b.fill(0);
    this.nextA.fill(1);
    this.nextB.fill(0);

    // A repeatable cluster gives each preset the same starting conditions.
    const left = Math.floor(this.width * 0.43);
    const top = Math.floor(this.height * 0.39);
    const patchWidth = Math.max(5, Math.floor(this.width * 0.12));
    const patchHeight = Math.max(5, Math.floor(this.height * 0.16));
    for (let y = top; y < Math.min(this.height, top + patchHeight); y += 1) {
      for (let x = left; x < Math.min(this.width, left + patchWidth); x += 1) {
        const index = y * this.width + x;
        this.a[index] = 0.5;
        this.b[index] = 0.25;
      }
    }
  }

  step(iterations = 1): void {
    const count = Math.max(1, Math.min(12, Math.floor(iterations)));
    const { width, height, a, b } = this;
    const diffusionA = 1;
    const diffusionB = 0.5;

    for (let iteration = 0; iteration < count; iteration += 1) {
      for (let y = 0; y < height; y += 1) {
        const north = ((y + height - 1) % height) * width;
        const south = ((y + 1) % height) * width;
        const row = y * width;

        for (let x = 0; x < width; x += 1) {
          const west = (x + width - 1) % width;
          const east = (x + 1) % width;
          const index = row + x;
          const centerA = a[index];
          const centerB = b[index];
          const lapA =
            -centerA +
            0.2 *
              (a[row + west] +
                a[row + east] +
                a[north + x] +
                a[south + x]) +
            0.05 *
              (a[north + west] +
                a[north + east] +
                a[south + west] +
                a[south + east]);
          const lapB =
            -centerB +
            0.2 *
              (b[row + west] +
                b[row + east] +
                b[north + x] +
                b[south + x]) +
            0.05 *
              (b[north + west] +
                b[north + east] +
                b[south + west] +
                b[south + east]);
          const reaction = centerA * centerB * centerB;

          this.nextA[index] = clamp(
            centerA + diffusionA * lapA - reaction + this.feed * (1 - centerA),
            0,
            1,
          );
          this.nextB[index] = clamp(
            centerB +
              diffusionB * lapB +
              reaction -
              (this.kill + this.feed) * centerB,
            0,
            1,
          );
        }
      }

      [this.a, this.nextA] = [this.nextA, this.a];
      [this.b, this.nextB] = [this.nextB, this.b];
    }
  }

  draw(context: CanvasRenderingContext2D, palette: Uint8Array): void {
    const image = context.createImageData(this.width, this.height);
    for (let index = 0; index < this.b.length; index += 1) {
      const color = Math.max(0, Math.min(255, Math.floor(this.b[index] * 2.6 * 255)));
      const paletteOffset = color * 3;
      const pixelOffset = index * 4;
      image.data[pixelOffset] = palette[paletteOffset] ?? 0;
      image.data[pixelOffset + 1] = palette[paletteOffset + 1] ?? 0;
      image.data[pixelOffset + 2] = palette[paletteOffset + 2] ?? 0;
      image.data[pixelOffset + 3] = 255;
    }
    context.putImageData(image, 0, 0);
  }
}
