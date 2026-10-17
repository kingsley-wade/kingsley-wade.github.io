# Content Guide

Public content lives under `src/content/` and is validated during every Astro
check and production build. Each entry needs a lowercase kebab-case `id`; keep
that ID stable even when renaming the file or changing its title.

## Editing current sections

- `about/index.md`: public introduction, status, links, and broad interests.
- `education/*.yaml`: institution, exact program wording, period, and notes.
- `research/*.md`: project summary in frontmatter and reviewed detail in the
  Markdown body.
- `publications/*`: owner-authored entries only. Test fixtures belong under
  `tests/fixtures/` and production rejects `mock: true`.
- `misc/*.md`: Life and Playground entries selected by `sectionId`.

## Playground shares

Playground shares are independent from the existing `misc` entries:

- `src/content/shares/notes/*.md` stores owner-authored Markdown Notes.
- `src/content/shares/links/*.md` stores public Links as summary cards.

Both types are public by default. Add `visibility: hidden` while drafting to
exclude an entry from the page and `/api/v1/content.json`. A pushed Note is
public content, so do not use this collection for private material.

Note example:

```md
---
id: terminal-notes
title: Terminal notes
kind: note
summary: A short field note.
order: 10
updatedAt: 2026-10-04
tags: [systems]
---

The Markdown body is rendered locally in Playground.
```

Link example:

```md
---
id: os-guide
title: Operating systems guide
kind: link
summary: A guide I want to revisit.
source: LinuxToy
sourceUrl: https://i.linuxtoy.org/docs/guide/index.html
order: 20
updatedAt: 2026-10-04
tags: [os]
---
```

External Markdown files, arXiv records, documentation pages, and blog posts
are all Links. The site preserves the URL and shows a summary card; it does
not fetch or embed remote content. The visitor activates the external anchor.

The current `Example ...` entries under `src/content/shares/` are intentionally
public preview content so the Note body and all four Link URL formats are
visible while checking the interface. Remove or replace those entries when
adding your own curated shares.

Set `visibility: hidden` to keep a draft out of the page and public JSON. Never
place private notes, credentials, raw CV files, or source photographs in a
content collection.

## Background music clips

Place owner-supplied `.ogg` files in `public/audio/mock/`, then add one entry
to `bundledTracks` in `src/config/audio.ts`. Set `snippetStartSeconds` and
`snippetDurationSeconds` for the clip; the default configuration uses a
30-second clip. One track is selected randomly when the audio controller is
created. Keep the splash gate and default mute behavior in place because
browsers may block autoplay. Confirm that every published track is yours or
properly licensed before pushing it to GitHub Pages.

## Source ledger

The initial personal facts were transcribed from these ignored local inputs on
2026-09-28:

| Public content | Local source | Editing decision |
| --- | --- | --- |
| Name and email | `cvfor_applied_math/cv-llt.tex` | Published as written; email was approved for public display. |
| Graduate program | `cvfor_applied_math/education.tex` | Preserved as "Graduate Program"; no master's or doctoral label inferred. |
| B.Sc. and thesis | `cvfor_applied_math/education.tex` | Honors and thesis retained; GPA and secondary education omitted by default. |
| Research projects | `cvfor_applied_math/employment.tex` | Dates, topics, contribution wording, and supplied links condensed without adding claims. |
| Research interests | `cvfor_applied_math/skills.tex` | Condensed into the About introduction. |

The source files remain ignored and are not copied into the production build.
