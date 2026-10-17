# Tasks

## Spec Metadata

- Feature: `playground-shares`
- Status: `complete`
- Last updated: `2026-10-04`
- Requirements source: `requirements.md`
- Design source: `design.md`

## Status Legend

- `[ ]` pending
- `[~]` in progress
- `[x]` completed
- `[!]` blocked

## Execution Rules

- Work only on one `[~]` task at a time.
- Do not start a task until its dependencies are complete.
- Mark a task `[x]` only after recording acceptance evidence.
- If a task changes scope, pause and update the spec before continuing.

## Task Checklist

### 1. Repository Structure

- [x] 1.1 Establish share content directories
  - Module: `repository`
  - Goal: Add the `notes` and `links` source directories with clearly labeled public preview entries requested by the owner.
  - Files: `src/content/shares/notes/*.md, src/content/shares/links/*.md`
  - Depends on: `requirements approved, design approved`
  - Acceptance evidence: one public Note and four public Links render visibly in Playground; all have stable IDs and are labeled as examples.

### 2. Core Implementation

- [x] 2.1 Register and validate the shares collection
  - Module: `content-schema`
  - Goal: Add Note and Link schemas with stable IDs, deterministic order, public-by-default visibility, and HTTP(S)-only Link destinations; register the Markdown collection.
  - Files: `src/lib/content/schemas.ts, src/content.config.ts`
  - Depends on: `1.1`
  - Acceptance evidence: `pnpm check` passes with the new empty `shares` Markdown collection registered.

- [x] 2.2 Add a shared public shares loader
  - Module: `public-content`
  - Goal: Load visible shares, filter hidden entries, and sort entries by `order` for both page rendering and API use.
  - Files: `src/lib/content/public-content.ts`
  - Depends on: `2.1`
  - Acceptance evidence: `pnpm check` passes with typed public filtering and ascending-order sorting in `getValidatedShares()`.

- [x] 2.3 Extend the terminal filesystem for nested share paths
  - Module: `terminal-filesystem`
  - Goal: Support `/playground/notes`, `/playground/links`, item ID listings, absolute and relative paths, parent navigation, and bounded `open ITEM_ID` focus effects.
  - Files: `src/lib/terminal/filesystem.ts, src/lib/terminal/commands.ts`
  - Depends on: `2.1`
  - Acceptance evidence: `tests/unit/terminal-filesystem.test.ts` verifies category navigation, absolute and relative paths, aliases, item listing/open focus, and invalid-path preservation; `pnpm test` passes.

### 3. Integration

- [x] 3.1 Render Notes and Links inside Playground
  - Module: `playground-renderer`
  - Goal: Load public shares for Playground; render Note Markdown bodies and Link summaries, sources, and validated external anchors as distinct accessible entries.
  - Files: `src/components/AppShell.astro, src/components/PlaygroundShares.astro, src/styles/global.css`
  - Depends on: `2.2`
  - Acceptance evidence: `PlaygroundShares.astro` renders Note bodies and Link cards from `getValidatedShares()`; `pnpm check` and `pnpm build` pass.

- [x] 3.2 Connect terminal paths to share filtering and focus
  - Module: `terminal-client`
  - Goal: Pass share IDs and kinds into terminal state, update the prompt and visible category after path changes, and focus an entry for `open ITEM_ID`.
  - Files: `src/components/PlaygroundTerminal.astro, src/components/PlaygroundShares.astro, src/lib/terminal/client.ts`
  - Depends on: `2.3, 3.1`
  - Acceptance evidence: Chromium E2E verifies `cd notes`, `cd links`, and `cd ..`; unit coverage verifies `open ITEM_ID` returns the matching focus effect. Browser tests pass for all active feature-related assertions.

- [x] 3.3 Publish shares through the existing JSON API
  - Module: `public-content-api`
  - Goal: Add public Note and Link items to the Playground `items` array, render Note bodies into `bodyHtml`, preserve Link metadata in `details`, and keep the existing response shape and schema version.
  - Files: `src/pages/api/v1/content.json.ts, src/lib/content/public-content-model.ts`
  - Depends on: `2.2`
  - Acceptance evidence: API route adds ordered public shares only under Playground, serializes rendered Note HTML, and retains Link metadata in `details`; serialization and selection tests pass, with the existing `schemaVersion` unchanged.

### 4. Testing

- [x] 4.1 Add focused unit coverage for schemas, loaders, terminal paths, and serialization
  - Module: `unit-tests`
  - Goal: Cover Note/Link validation, visibility defaults and filtering, URL protocol rejection, deterministic ordering, nested filesystem transitions, and API item details.
  - Files: `tests/unit/content-schema.test.ts, tests/unit/public-content.test.ts, tests/unit/terminal-filesystem.test.ts, tests/unit/share-link-view.test.ts, tests/fixtures/shares/links/`
  - Depends on: `2.1, 2.2, 2.3, 3.3`
  - Acceptance evidence: `pnpm test` passes (14 files, 72 tests), covering visibility/order selection, HTTP(S) validation and rejected schemes, valid/invalid paths and IDs, API serialization, and four offline URL fixtures mapped to the shared summary-card view model.

- [x] 4.2 Add browser coverage for share discovery and terminal behavior
  - Module: `e2e-tests`
  - Goal: Verify Note and Link presentation, hidden-entry omission, category filtering, terminal focus behavior, and user-activated external links. Assert representative Links share the same card structure regardless of URL host or extension.
  - Files: `tests/e2e/homepage.spec.ts, tests/e2e/visual.spec.ts`
  - Depends on: `3.1, 3.2, 3.3, 4.1`
  - Acceptance evidence: Focused Chromium run passed 3 tests, including the visible Note body, four Link cards with exact destinations, category filtering, and terminal focus for both kinds; no external anchor is activated. The unrelated existing splash viewport assertion remains failing and was excluded from this feature run.

### 5. Documentation

- [x] 5.1 Document how to author Notes and Links
  - Module: `content-docs`
  - Goal: Explain the two source paths, required frontmatter, public-by-default behavior, hidden drafts, and the rule that pushed Notes are public.
  - Files: `docs/CONTENT_GUIDE.md`
  - Depends on: `2.1, 3.1`
  - Acceptance evidence: `docs/CONTENT_GUIDE.md` contains copyable Note and Link examples, public/hidden behavior, and the no-remote-fetch rule; `pnpm check` passes.

### 6. Final Verification

- [x] 6.1 Run final checks and inspect the feature diff
  - Module: `verification`
  - Goal: Confirm types, unit tests, production build, focused Chromium coverage, documentation, and diff hygiene against all approved specs.
  - Files: `requirements.md, design.md, tasks.md, implementation files`
  - Depends on: `4.2, 5.1`
  - Acceptance evidence: `pnpm check`, `pnpm test` (72 tests), `pnpm build`, focused Chromium E2E (3 share and viewport tests), Kiro-Lite validator, and `git diff --check` pass. The existing splash viewport assertion fails independently of this feature.

## Approval

- Task checklist approved by user: `yes` (2026-10-03, user confirmed)
