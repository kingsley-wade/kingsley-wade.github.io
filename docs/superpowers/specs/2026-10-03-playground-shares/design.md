# Design

## Spec Metadata

- Feature: `playground-shares`
- Status: `approved`
- Last updated: `2026-10-03`
- Requirements source: `requirements.md`
- Design approved by user: yes (2026-10-03, user confirmed)

## Overview

Add one independent `shares` Astro content collection with a discriminated
Note/Link schema. The existing Playground renderer loads these entries and
shows them beside the existing Playground content. The terminal models Notes
and Links as directories below `/playground`, filters share entries when the
current path changes, and focuses a matching entry for `open ITEM_ID`. The public
content loader adds visible shares to Playground's existing API items.

## Repository Tree Impact

```text
src/
  content/
    shares/
      notes/*.md
      links/*.md
  components/
    AppShell.astro                 # load and place Playground shares
    PlaygroundShares.astro         # render and filter Note/Link entries
    PlaygroundTerminal.astro       # provide share IDs and kinds to terminal
  content.config.ts                # register shares collection
  pages/api/v1/content.json.ts     # merge public shares into Playground items
  core/
    section-contract.ts            # keep existing section contract unchanged
  lib/
    content/
      schemas.ts                   # Note/Link schemas and URL validation
      public-content.ts            # validate and load public shares
    terminal/
      filesystem.ts                # add nested Playground directories and IDs
      commands.ts                  # implement directory-aware ls/cd/open
      client.ts                    # sync prompt, filter, and focus effects
tests/
  unit/                            # share schema, API mapping, filesystem cases
  e2e/                             # public rendering and terminal navigation
  fixtures/
    shares/links/                  # OS docs, .md, arXiv, and blog URL records
docs/
  CONTENT_GUIDE.md                 # authoring and visibility guidance
```

The JSON route should only need integration through the public content loader;
its top-level response and `schemaVersion` remain unchanged.

## Architecture

### Content collection

Register `shares` with Astro's Markdown glob loader rooted at
`src/content/shares/`. Use a discriminated schema keyed by `kind`:

- `kind: note` uses the common stable ID, title, optional summary, tags,
  visibility, update date, and required non-negative `order`. The Markdown
  body is rendered as the owner's Note.
- `kind: link` uses the same common fields, requires a summary and `sourceUrl`,
  accepts an optional `source`, and does not render its Markdown body.
- Both kinds default visibility to `public`. `sourceUrl` must parse as an
  absolute `http` or `https` URL.
- Link rendering is format agnostic. HTML documentation, URLs ending in
  `.md`, arXiv records, and blog posts all use the same summary card and
  user-activated external anchor. The site never fetches or parses remote page
  bodies.

Physical paths (`notes/` and `links/`) make authoring straightforward; the
explicit `kind` field keeps content validation and consumers independent of
file path parsing.

### Rendering boundary

Keep the section registry and `SectionManifest.contentCollection` unchanged.
`misc` continues to supply the existing Playground introduction. Add a focused
shares loader and a `PlaygroundShares.astro` component for the new collection.
`AppShell.astro` loads public shares for the Playground renderer and passes
them to `PlaygroundShares.astro`. The component renders Notes with Markdown
body and Links with a summary and external anchor. Each rendered article
exposes its stable ID and kind through data attributes; articles can receive
programmatic focus for terminal `open`.

### Terminal filesystem

Extend the current pure terminal filesystem from root/section paths to these
levels:

```text
/
└── playground/
    ├── notes/
    │   └── NOTE_ID
    └── links/
        └── LINK_ID
```

At `/`, `ls` keeps listing public sections. At `/playground`, `ls` keeps the
section list discoverable and adds `notes/` and `links/`; this also makes the
first `ls` useful when the terminal starts on the Playground route. Inside a
category, `ls` lists matching stable IDs.
Relative `cd notes` and `cd links` work from `/playground`; absolute paths
such as `cd /playground/links` work as well. `cd ..` moves one level up.

`open ITEM_ID` resolves an ID in the active category, scrolls its article into
view, and moves keyboard focus to it. It never activates the external anchor.
Path changes dispatch a small `terminal:path-changed` event containing the
normalized path. `PlaygroundShares.astro` listens for that event and filters
only share entries; the existing Playground introduction and terminal remain
visible. Section-router changes reset the terminal path to the selected
top-level section, preserving current route behavior.

### Public content API

Add `shares` to the content entry union and expose a `getValidatedShares()`
helper that filters hidden entries and sorts by `order`. During generation of
the `playground` section, the API combines the existing `misc` entries and
share entries, uses build-time rendered HTML for Note Markdown, and serializes
both through `toPublicContentItem`. The shares Markdown loader renders entries
at build time so the API can include Note `bodyHtml` without runtime conversion.

The existing serializer already supports generic entry details and rendered
Markdown HTML. Keep `kind`, `source`, and `sourceUrl` in `details`; Note HTML
populates `bodyHtml`, while Link HTML remains empty. Do not include `order` as
public detail. Preserve `schemaVersion: "1.0"` and the current response shape.

## Components

| Component | Responsibility | Inputs | Outputs | Depends on |
| --- | --- | --- | --- | --- |
| `sharesSchema` | Validate Note and Link frontmatter, including URL protocol | Markdown frontmatter | Typed collection entries or build diagnostics | Astro Zod |
| `getValidatedShares` | Load public shares in stable order | Astro `shares` collection | Public Note/Link entries | Content Collections |
| `PlaygroundShares.astro` | Render both categories and respond to terminal path filtering | Rendered entries | Accessible share articles and external links | shares loader, terminal path event |
| `terminal/filesystem.ts` | Resolve section, category, and item paths without browser effects | Public section and share metadata | Path/list/navigation/focus effects | Section manifests |
| `terminal/client.ts` | Apply path effects to prompt, route, share list, and focus | Parsed command and filesystem effects | DOM updates and bounded events | Existing router and terminal components |
| `/api/v1/content.json` | Publish visible shares in Playground's existing items array | Public content loaders | Existing JSON contract with additional items | `public-content.ts`, serializer |

## Data Flow

1. The Astro glob loader reads Markdown under `src/content/shares/` and
   validates each entry against the Note/Link discriminator.
2. The Playground page loads public shares, renders Note bodies, and renders
   Link summaries and external anchors.
3. The terminal receives share IDs and kinds. `ls`, `cd`, and `open` produce
   bounded local effects; category paths filter share articles and item paths
   focus the matching article.
4. The prerendered content API loads the same public shares, renders Note
   bodies to HTML, and serializes them into the Playground section alongside
   existing `misc` entries.

## Interfaces and Contracts

### Note entry

```yaml
id: scheduling-notes
kind: note
title: Notes on scheduling
summary: A short description of this note.
order: 10
tags: [research, notes]
visibility: public
updatedAt: "2026-10-03"
```

The Markdown body below the frontmatter is public when visibility is public.

### Link entry

```yaml
id: calm-tools
kind: link
title: Why tools should feel calm
summary: A short description of the recommended post.
source: Example Author
sourceUrl: https://example.com/post
order: 20
tags: [design, tools]
visibility: public
updatedAt: "2026-10-03"
```

### Representative Link fixtures

Keep representative records under `tests/fixtures/shares/links/`, outside the
Astro collection loader. Include the supplied LinuxToy OS guide URL, an external
URL ending in `.md`, an arXiv record, and a blog post. Tests load these records
through the same Link schema and card view model. Tests must not issue network
requests, so they remain stable when any example host is unavailable. To make
the new UI immediately inspectable, include clearly labeled public preview
entries under `src/content/shares/notes/` and `src/content/shares/links/` that
exercise those same shapes. The preview entries are ordinary public content
and can be replaced by the owner after verification.

### Terminal path events

- `terminal:path-changed`: `{ path: string }`, emitted after a successful path
  change; consumers filter entries for `/playground/notes` or
  `/playground/links`.
- `open ITEM_ID`: returns a local focus target; missing or out-of-category IDs
  return an error without changing path or route.

### Public API item details

- Note: `details.kind === "note"`; `bodyHtml` contains rendered Markdown.
- Link: `details.kind === "link"`, with `details.source` when supplied and
  `details.sourceUrl`; `bodyHtml` is empty.

## Error Handling

- Invalid discriminators, missing Link summaries or destinations, invalid
  protocols, invalid dates, or invalid order values fail content validation
  with Astro's entry path and schema diagnostics.
- Unknown directory: print the available directories and leave the path/view
  unchanged.
- Unknown item ID or ID in the other category: print an item-not-found message
  and leave the path/view unchanged.
- A hidden entry is filtered before both rendering and API serialization.
- Invalid URL values never become rendered anchors because schema validation
  fails the build.

## Testing Strategy

- Unit tests validate Note and Link frontmatter, public-by-default behavior,
  hidden filtering, and rejection of non-HTTP(S) destinations.
- Unit tests validate the LinuxToy OS documentation URL
  (`https://i.linuxtoy.org/docs/guide/index.html`), an external Markdown URL,
  an arXiv page, and a blog URL as Link entries, preserving each exact URL and
  producing the same card view model without network access.
- Unit tests cover root-to-Playground-to-category navigation, relative and
  absolute paths, `cd ..`, category listing, ID listing, and `open` errors.
- API serialization tests verify Notes include rendered body HTML and Links
  include kind/source URL in `details`, without changing the outer contract.
- Playwright coverage verifies visible and hidden entries, category filtering,
  terminal path updates, `open ITEM_ID` focus behavior, and external-link markup.
- Run `pnpm check`, `pnpm test`, `pnpm build`, and the focused Chromium e2e
  tests. Existing terminal and public-content tests remain regression checks.

## Migration and Compatibility

No existing content moves from `misc`; the current Life and Playground entries
remain valid. The shares collection is additive. The public JSON response keeps
its schema version, keys, and item shape, with additional Playground items.
The terminal gains nested paths while preserving current root section
navigation, history, and whitelist behavior.

## Risks and Tradeoffs

| Risk or Tradeoff | Impact | Mitigation |
| --- | --- | --- |
| Playground shares use a renderer-specific loader instead of the generic section collection field | Adds a focused integration point | Keep loading in one public-content helper and test page/API use of the same public filter |
| Nested paths expand the current terminal state model | Route and category state can become inconsistent | Keep path resolution pure and reset from `section:changed`; cover transitions in unit and browser tests |
| Public Notes may contain material the owner intended to keep private | Static builds expose the full Markdown body | Document that pushed public Notes are public; require `visibility: hidden` for drafts and filter them before rendering/API output |
| External recommendations may use unsupported URL schemes | Unsafe or unusable destinations could reach the page | Validate absolute HTTP(S) URLs during content validation |
| External providers may change page format or become unavailable | A recommendation may eventually lead to changed or missing remote content | Render owner-authored metadata only; keep tests offline and verify destination preservation rather than provider availability |

## Approval

- Design approved by user: `yes` (2026-10-03, user confirmed)
