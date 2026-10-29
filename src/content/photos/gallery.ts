export type PhotoItem = {
  id: string;
  src: string;
  alt: string;
};

export const photos: readonly PhotoItem[] = [
  {
    id: "snow-mountain",
    src: "/images/photos/snow-mountain.jpg",
    alt: "Snow-covered peak above a forest of conifers under a clear blue sky",
  },
  {
    id: "tianlu-eighteen-bends",
    src: "/images/photos/tianlu-eighteen-bends.jpg",
    alt: "Hairpin switchbacks of the Tianlu Eighteen Bends road winding through a forested mountainside",
  },
  {
    id: "mountain-pass-sun",
    src: "/images/photos/mountain-pass-sun.jpg",
    alt: "Bright sun over a high mountain pass with a sea of clouds in the valley below",
  },
  {
    id: "reservoir-shore",
    src: "/images/photos/reservoir-shore.jpg",
    alt: "Sandy shoreline curving around the blue water of a reservoir",
  },
];
