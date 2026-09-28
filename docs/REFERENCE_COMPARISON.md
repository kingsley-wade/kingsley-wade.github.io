# Reference and Visual Comparison

The main reference is <https://sites.pitt.edu/~kpele/>. Its verified behavior
was inspected from the live content and archived 2026-04-16 HTML before the
implementation was designed.

| Reference behavior | Personal site implementation | Intentional difference |
| --- | --- | --- |
| Full-screen `INSERT COIN` gate | Full-screen entry gate with Enter, sound, and muted choices | Light-blue grid, mint/lavender corner blocks, and coral title replace the black/green palette. |
| Press Start 2P display type | Self-hosted Press Start 2P headings | IBM Plex Mono keeps long academic content readable. |
| Pixel portrait beside ASCII identity | Responsive pixel portrait and `PROFILE.SYS` identity frame | Portrait is based on Manting Guo's local photos and uses the pastel palette. |
| Numbered single-screen menu | `[1]` through `[6]` menu and one enhanced active panel | Six owner-selected sections replace the reference site's seven items. |
| Coin entry sound and menu click sound | Entry/background controls and section-specific guitar scales | The persistent music system is a personal extension, not behavior attributed to the reference. |

## Pixel portrait process

- `1.jpg` is the higher-resolution visual base for face, hair, and framing.
- `idphoto.jpg` is the secondary reference for hair silhouette, face proportion,
  and a small alignment blend.
- `scripts/create-pixel-avatar.py` crops both sources, normalizes their framing,
  blends the secondary reference at low weight, replaces edge background areas,
  increases contrast, quantizes to 24 colors at 96x96, and scales with nearest
  neighbor sampling.
- Published derivatives are `public/images/avatar-pixel.webp` (384x384) and
  `public/images/avatar-pixel@2x.webp` (768x768). They are newly encoded without
  source EXIF or XMP metadata.

The raw photos remain ignored local inputs. They are not copied into `public/`,
the Git repository, or the reusable template.

## Responsive evidence

Splash and main-interface screenshots are stored under
`tests/e2e/screenshots/` for 1440x900, 768x1024, 390x844, and 320x568. The
capture script checks that the document width does not exceed each viewport and
that exactly one of six content panels is active after enhancement.
