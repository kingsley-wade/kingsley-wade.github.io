# Cyber Minecraft Pixel Avatar

## Goal

Replace the current pastel pixel portrait with a reference-inspired cyber
pixel portrait. The result should use the supplied block-face composition,
while retaining a few personal features from the owner's photo.

## Visual direction

The selected direction is **A · Cyber Miner**:

- A large square, block-built head with black hair and white shirt.
- Deep navy code-grid background.
- A single cyan cyber monocle over the right eye.
- A small pixel bear badge on the shirt as a personal detail.
- Pixel edges and nearest-neighbor scaling at every published size.

The two local photographs remain visual references for face proportion, hair
shape, and expression. The face remains visible behind the visor, while the
block helmet and cyber colors carry the character style. The photographs are
never copied into the public output or committed to Git.

## Asset contract

The generator continues to produce:

- `public/images/avatar-pixel.webp` at 384×384.
- `public/images/avatar-pixel@2x.webp` at 768×768.
- Empty EXIF/XMP metadata.
- A stable `alt` description in `PixelPortrait.astro`.

The component contract does not change, so layout, responsive sizing, and
content tests remain valid.

## Implementation boundary

The change is limited to `scripts/create-pixel-avatar.py` and generated avatar
files. The script uses a quantized portrait as the face layer, then adds
deterministic block hair, asymmetric cyber glasses, shirt geometry, a bear
badge, and a dark code-grid backdrop. Pillow is used only by this offline
asset-generation script; it
is not a site runtime dependency. No browser interaction is required.

## Verification

After generation:

1. Inspect the 384px and 768px derivatives for block edges and visible face
   structure.
2. Run `pnpm check`, `pnpm test`, and the Chromium E2E suite.
3. Run `pnpm build` and confirm both generated images are present in `dist/`.
4. Confirm `1.jpg`, `idphoto.jpg`, and the CV directory remain ignored.

## Approval

Direction A was selected by the owner on 2026-09-28.

The owner clarified that the portrait should combine cyber styling with some
personal features, without needing to look exactly like them.
