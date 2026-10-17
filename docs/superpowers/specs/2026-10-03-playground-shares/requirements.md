# Requirements

## Spec Metadata

- Feature: `playground-shares`
- Owner: `site owner`
- Status: `approved`
- Last updated: `2026-10-03`

## Purpose

Provide a dedicated place inside Playground for publishing the owner's Markdown
notes and recommending external posts. Keep both kinds of sharing content easy
to maintain in the repository, distinguish their presentation, and expose
public entries through the existing public content API.

## Scope

### In Scope

- Add a dedicated Astro content collection named `shares`, independent from
  the existing `misc` collection.
- Store local Markdown notes under `src/content/shares/notes/` and external
  recommendations under `src/content/shares/links/`.
- Render Notes with their Markdown body, summary, tags, and update date.
- Render Links with title, summary, optional source, and an external link.
- Display both categories within the existing Playground section.
- Add test-only representative OS Link fixtures under
  `tests/fixtures/shares/links/` for an HTML documentation page, a Markdown
  URL, an arXiv record, and a blog post. Use
  `https://i.linuxtoy.org/docs/guide/index.html` as the documentation example.
- Add clearly labeled public preview entries for a Markdown Note and the four
  representative Link formats so the owner can inspect the interface before
  replacing them with curated content.
- Render every external Link as the same summary card with a user-activated
  destination, independent of host or URL extension.
- Make public entries the default; allow an explicit `visibility: hidden`
  value to exclude an entry from the page and public API.
- Add terminal navigation for `/playground/notes` and `/playground/links`;
  `open ITEM_ID` locates a matching item in the current Playground view.
- Include public shares in the Playground section of
  `/api/v1/content.json` using the existing public item shape.
- Preserve existing Life and Playground content in `misc`.

### Out of Scope

- Creating a new top-level site section for Shares.
- Private note storage, authentication, or an owner editing interface.
- Fetching article metadata, scraping pages, RSS ingestion, or remote search.
- Fetching, embedding, or converting remote Markdown, arXiv, documentation, or
  blog page bodies into local page content.
- Comments, ratings, bookmarks, or visitor-submitted links.
- Executing arbitrary terminal commands or opening external URLs directly
  from terminal input.

## Users and Goals

- As the site owner, I want to add a Markdown note or an external post as a
  repository entry so that I can publish and curate useful material with the
  rest of the site content.
- As a visitor, I want to distinguish the owner's notes from recommended
  external posts so that I understand whether I am reading original material
  or following a recommendation.
- As a visitor, I want to browse Notes and Links from Playground's terminal so
  that the existing local-shell interaction helps me discover the collection.
- As a public API consumer, I want public shares included under Playground so
  that machine-readable content matches what the site publishes.

## Functional Requirements

- `WHEN` the site content is validated, `THE SYSTEM SHALL` validate shares as
  a dedicated collection with distinct Note and Link requirements.
- `WHEN` a Note entry is built, `THE SYSTEM SHALL` display its Markdown body,
  title, available summary and tags, and update date within Playground.
- `WHEN` a Link entry is built, `THE SYSTEM SHALL` display its title, summary,
  available source, and an explicit external destination without rendering it
  as a local article body.
- `WHEN` a Link points to HTML documentation, a Markdown URL, an arXiv page, or
  a blog post, `THE SYSTEM SHALL` render the same summary-card structure and
  preserve the supplied destination URL regardless of its hostname or path
  extension.
- `WHEN` the page or build processes a Link destination, `THE SYSTEM SHALL`
  not fetch, embed, or parse the remote page body.
- `WHEN` a share entry omits `visibility`, `THE SYSTEM SHALL` treat it as
  public.
- `IF` a share entry has `visibility: hidden`, `THEN THE SYSTEM SHALL` omit it
  from the Playground page and `/api/v1/content.json`.
- `WHEN` a visitor enters Playground and lists its contents, `THE SYSTEM SHALL`
  show the `notes/` and `links/` categories alongside applicable Playground
  content.
- `WHEN` a visitor runs `cd notes` or `cd links` within Playground,
  `THE SYSTEM SHALL` change the terminal path and filter the displayed share
  entries to the selected category.
- `WHEN` a visitor runs `open ITEM_ID` for an item in the active category,
  `THE SYSTEM SHALL` move focus or scroll to that item without executing its
  external destination.
- `IF` a requested category or item ID does not exist, `THEN THE SYSTEM SHALL`
  show an informative error and preserve the current path and view.
- `WHEN` the public content API is generated, `THE SYSTEM SHALL` include public
  Notes and Links in Playground's existing `items` array and preserve the
  current API response contract.
- `WHEN` an external Link destination is rendered, `THE SYSTEM SHALL` accept
  only `http` or `https` URLs and expose it as a normal user-activated link.
- `WHEN` shares are listed, `THE SYSTEM SHALL` use a deterministic owner-set
  order so the collection remains curated across builds.

## Non-Functional Requirements

- Performance: Share content is statically loaded at build time; rendering
  must not add per-visit network requests.
- Reliability: Invalid frontmatter, duplicate IDs, or invalid external URLs
  must fail Astro content validation/build with actionable diagnostics.
- Reliability: Test fixtures must cover an HTML documentation URL, a URL ending
  in `.md`, an arXiv URL, and a blog URL; the checks must not depend on those
  remote sites being available.
- Security or privacy: Public Note bodies are published as site content.
  Hidden entries must not appear in generated HTML or public JSON. No external
  page is fetched during build or automatically opened by terminal input.
- Usability: The page must visually distinguish Notes from Links and retain
  the site's existing responsive and keyboard-accessible navigation behavior.
- Compatibility: Existing `misc` entries and the current public JSON shape
  remain valid; adding shares must not require a new API schema version.

## Constraints

- Repository constraints: Use Astro Content Collections, existing Zod schema
  conventions, the section registry, and the Playground renderer boundary.
- Platform constraints: The site is statically built and deployed; all public
  content is available to anyone who can access the site or public API.
- Dependency constraints: No new runtime dependency is required.

## Assumptions

- A Note is an owner-authored Markdown file whose body is intended for public
  display when the file is pushed and its visibility is public.
- A Link is a recommendation record; its Markdown body is not displayed. Its
  summary is written by the owner and its destination is supplied explicitly.
- External `.md` URLs remain ordinary external Links; only Markdown files
  authored locally under `shares/notes/` render as page content.
- Representative URLs remain covered by offline test fixtures; the owner also
  explicitly requested clearly labeled public preview copies for interface
  verification.
- Both kinds use a stable kebab-case ID, a non-negative order value, tags, and
  an ISO update date, following existing content conventions.
- `open ITEM_ID` searches within the active Notes or Links category; visitors use
  the visible external link to follow a recommendation.

## Open Questions

- None. The collection boundary, content types, visibility, terminal behavior,
  and public API inclusion were selected during brainstorming.

## Approval

- Requirements approved by user: `yes` (2026-10-03, user said "批准开始")
