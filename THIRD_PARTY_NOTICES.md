# Third-Party Notices

This file records third-party material distributed with the built site or kept
in this repository. Update it whenever a font, image, audio file, icon set, or
other redistributable asset is added.

## Fonts

The production build includes WOFF2 subsets provided by Fontsource:

- Press Start 2P, copyright 2012 The Press Start 2P Project Authors. Licensed
  under the SIL Open Font License 1.1. Reserved Font Name: Press Start 2P.
- IBM Plex Mono, copyright 2017 IBM Corp. Licensed under the SIL Open Font
  License 1.1.
- Packaging source: <https://fontsource.org/>

No third-party image, icon, or audio asset is currently bundled. Build
dependencies installed from `package.json` retain the licenses in their
respective packages and are not committed to this repository.

## Original interaction audio

The short plucked-string WAV files under `public/audio/guitar/` are original,
procedurally generated project assets. They are produced by
`scripts/create-guitar-samples.py` with a seeded Karplus-Strong style synthesis
process and are distributed under this project's MIT license. They do not
sample or reproduce a commercial recording.

The background track at `public/audio/mock/theme-placeholder.ogg` is an
original, procedurally generated three-beat waltz. It is produced by
`scripts/create-theme-placeholder.py` and distributed under this project's MIT
license. It is a functional placeholder and does not reproduce the melody or a
recording from *La La Land*.

## Legacy Jekyll site

The pre-migration site used the Contrast theme by Niklas Buschmann:

- Source: <https://github.com/niklasbuschmann/contrast>
- License: Unlicense / public domain dedication
- Preserved at: Git tag `legacy-jekyll-2024`

The legacy theme files and their original license are available from the
recovery tag. They are not part of the new Astro working tree.

## Restricted media policy

No commercial soundtrack from *La La Land*, *Normal People*, or another
copyrighted production may be committed without explicit redistribution
rights. Development and automated checks use original or clearly licensed
placeholder audio. A user-owned legal source may be configured separately and
must not expose credentials in client code.
