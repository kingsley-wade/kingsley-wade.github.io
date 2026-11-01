export type PhotoItem = {
  id: string;
  src: string;
  alt: string;
  caption?: string;
};

export type PhotoGroup = {
  id: string;
  title: string;
  photos: readonly PhotoItem[];
};

export const photoGroups: readonly PhotoGroup[] = [
  {
    id: "snow-ice",
    title: "Snow & ice",
    photos: [
      {
        id: "snow-mountain",
        src: "/images/photos/snow-mountain.jpg",
        alt: "Snow-covered peak above a forest of conifers under a clear blue sky",
      },
      {
        id: "snowy-valley-haze",
        src: "/images/photos/snowy-valley-haze.jpg",
        alt: "Snow-dusted valley fading into haze under an overcast sky",
      },
      {
        id: "frozen-lake",
        src: "/images/photos/frozen-lake.jpg",
        alt: "Pancakes of ice stacked along the frozen shore of a lake",
      },
      {
        id: "ice-crystals",
        src: "/images/photos/ice-crystals.jpg",
        alt: "Close-up of coarse ice crystals growing over dark soil",
      },
      {
        id: "snowfield-selfie",
        src: "/images/photos/snowfield-selfie.jpg",
        alt: "Selfie in an orange jacket and beanie on a rocky snowfield",
        caption: "Shot over 5,500+ m",
      },
    ],
  },
  {
    id: "plateau-textures",
    title: "Plateau textures",
    photos: [
      {
        id: "plateau-hummocks",
        src: "/images/photos/plateau-hummocks.jpg",
        alt: "Hummocky alpine grassland stretching toward distant mountains",
      },
      {
        id: "salt-flat-cracked",
        src: "/images/photos/salt-flat-cracked.jpg",
        alt: "Cracked polygonal crust of a dry salt flat under a wide sky",
      },
      {
        id: "fairy-circle",
        src: "/images/photos/fairy-circle.jpg",
        alt: "A near-perfect ring of vegetation traced in dry grass",
      },
    ],
  },
  {
    id: "roads-passes",
    title: "Roads & passes",
    photos: [
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
        id: "fieldwork-roadside",
        src: "/images/photos/fieldwork-roadside.jpg",
        alt: "Fieldwork by the roadside on a open plateau, gear packed and ready",
      },
    ],
  },
  {
    id: "others",
    title: "Others",
    photos: [
      {
        id: "reservoir-shore",
        src: "/images/photos/reservoir-shore.jpg",
        alt: "Sandy shoreline curving around the blue water of a reservoir",
      },
      {
        id: "kingfisher",
        src: "/images/photos/kingfisher.jpg",
        alt: "A common kingfisher perched on a wooden post, feathers bright blue and orange",
      },
    ],
  },
];
