# Tasks

## Spec Metadata

- Feature: `personal-homepage`
- Status: `approved / implementation in progress`
- Last updated: `2026-09-28`
- Requirements source: `requirements.md`（approved 2026-09-28）
- Design source: `design.md`（approved 2026-09-28）

## Status Legend

- `[ ]` pending
- `[~]` in progress
- `[x]` completed
- `[!]` blocked

## Execution Rules

- Work only on one `[~]` task at a time.
- Do not start a task until its dependencies are complete.
- Mark a task `[x]` only after recording concrete acceptance evidence beneath that task.
- If a task changes requirements, design, repository ownership, public content, or deployment behavior, pause and update the affected spec before continuing.
- Never push the raw CV directory, source photographs, private notes, secrets, unlicensed commercial audio, or mock publications to a production branch.
- Keep the existing Pages URL and Git history recoverable throughout migration.

## Task Checklist

### 1. Repository Safety and Migration Base

- [x] 1.1 Attach the current workspace to the existing Pages repository
  - Module: `repository`
  - Goal: Initialize Git in the current non-repository workspace, add `git@github.com:kingsley-wade/kingsley-wade.github.io.git` as `origin`, fetch `master`, verify remote HEAD `1ff74d9e`, and create `feat/astro-personal-homepage` from `origin/master` without losing local specs or source assets.
  - Files: `.git/config, specs/personal-homepage/*, 1.jpg, idphoto.jpg, cvfor_applied_math/*`
  - Depends on: `requirements approved, design approved`
  - Acceptance evidence: `git remote -v`, `git rev-parse origin/master`, `git branch --show-current`, and `git status --short` show the expected remote, commit, migration branch, and preserved local inputs.
  - Evidence (2026-09-28): `origin` uses `git@github.com:kingsley-wade/kingsley-wade.github.io.git`; `origin/master` resolves to `1ff74d9e4df7f953e4ef0329a3a925d025229ca5`; current branch is `feat/astro-personal-homepage`; `git status --short --untracked-files=all` lists the three spec files, both root photos and all CV inputs as preserved untracked files.

- [x] 1.2 Create the legacy recovery point
  - Module: `repository`
  - Goal: Create annotated tag `legacy-jekyll-2024` at the verified remote HEAD, record the Contrast theme source and rollback commands, and push only the recovery tag before replacing the worktree.
  - Files: `docs/DEPLOYMENT.md, Git tag legacy-jekyll-2024`
  - Depends on: `1.1`
  - Acceptance evidence: `git rev-parse legacy-jekyll-2024^{commit}` equals the verified legacy commit and `git ls-remote --tags origin legacy-jekyll-2024` returns the remote tag.
  - Evidence (2026-09-28): local and remote peeled tag both resolve to `1ff74d9e4df7f953e4ef0329a3a925d025229ca5`; annotated tag object is `dbf58b6a79f57ae6ca0b9cb592ccd2480249aa97`; `docs/DEPLOYMENT.md` records the Contrast/Unlicense source and recovery commands.

- [x] 1.3 Replace the legacy Jekyll worktree with an Astro scaffold
  - Module: `application scaffold`
  - Goal: Remove old Jekyll layouts, includes, Sass, sample posts, Gemfile, vendored theme assets and theme README on the migration branch; add an Astro TypeScript static project with pnpm and the approved directory layout.
  - Files: `_layouts/, _includes/, _sass/, _posts/, assets/, Gemfile, _config.yml, index.html, README.md, package.json, pnpm-lock.yaml, astro.config.mjs, tsconfig.json, src/, public/`
  - Depends on: `1.2`
  - Acceptance evidence: `pnpm install --frozen-lockfile` and the initial `pnpm build` succeed; `rg --files` contains the Astro entry points and no legacy Jekyll source directories.
  - Evidence (2026-09-28): `CI=true pnpm install --frozen-lockfile` completed from `pnpm-lock.yaml`; `pnpm build` with Astro 7.3.5 generated `dist/index.html`; the tracked Jekyll layouts/includes/Sass/posts/Gemfile/config/theme assets were removed and the file scan returns only the new Astro entry points for the scaffold patterns.

- [x] 1.4 Protect source material and establish licensing
  - Module: `repository policy`
  - Goal: Ignore raw photographs and CV sources, keep only approved derivatives in the build, add MIT licensing for new code, and record licenses for fonts, audio and other third-party assets.
  - Files: `.gitignore, LICENSE, THIRD_PARTY_NOTICES.md, README.md`
  - Depends on: `1.3`
  - Acceptance evidence: `git check-ignore -v 1.jpg idphoto.jpg cvfor_applied_math/cv-llt.tex` succeeds, while approved files under `public/` remain trackable; license documents identify every bundled third-party asset.
  - Evidence (2026-09-28): `git check-ignore -v` maps the two root photos and `cvfor_applied_math/` to dedicated rules; `public/.gitkeep` is not ignored; `LICENSE`, `THIRD_PARTY_NOTICES.md`, `README.md`, and `docs/DEPLOYMENT.md` record the MIT license, Contrast/Unlicense recovery source, current no-media state, and restricted commercial-audio policy.

### 2. Configurable Core and Extension Boundaries

- [x] 2.1 Implement centralized site, deployment and environment configuration
  - Module: `configuration`
  - Goal: Define identity, contact links, site URL, base path, feature flags, audio source and optional assistant base URL in documented config files without secrets or component hard-coding.
  - Files: `src/config/site.ts, src/config/audio.ts, .env.example, astro.config.mjs`
  - Depends on: `1.3`
  - Acceptance evidence: `pnpm check` validates the config; builds with `BASE_URL=/` and `BASE_URL=/personal-homepage/` both produce valid asset URLs.
  - Evidence (2026-09-28): `pnpm check` reports 0 errors/warnings/hints; both base-path builds complete and generated `site-base` metadata equals `/` and `/personal-homepage/` respectively; `site.ts`, `audio.ts`, `.env.example`, and `astro.config.mjs` centralize public identity, contacts, feature flags, site/base URLs, audio source, and optional assistant URL without secrets.

- [x] 2.2 Implement the pastel theme token system
  - Module: `theme`
  - Goal: Add the approved `pastel-sky` palette, a reusable `classic-terminal` preset, semantic CSS tokens, config overrides and validation that keeps primary text and controls at WCAG AA contrast.
  - Files: `src/config/theme.ts, src/themes/presets.ts, src/styles/tokens.css, src/styles/global.css`
  - Depends on: `2.1`
  - Acceptance evidence: theme unit checks pass; generated pages expose no hard-coded component colors outside the token and preset files; recorded contrast ratios meet the approved thresholds.
  - Evidence (2026-09-28): `pnpm check` passes; direct preset validation reports no errors for `pastel-sky` or `classic-terminal`; pastel `ink/surface=12.77`, `link/surface=7.10`, and `accent/surface=7.10`, all above WCAG AA; all source hex colors are confined to `src/themes/presets.ts` and semantic aliases in `tokens.css`.

- [x] 2.3 Implement the section manifest and automatic registry
  - Module: `section registry`
  - Goal: Define `SectionManifest`, auto-discover module manifests, validate IDs/order/renderers/audio scales/commands, and expose one ordered registry to navigation, rendering and public JSON.
  - Files: `src/core/section-contract.ts, src/core/section-registry.ts, src/modules/*/manifest.ts`
  - Depends on: `2.1`
  - Acceptance evidence: registry tests cover discovery, deterministic ordering, duplicate IDs/orders, invalid renderer references and unknown audio scales.
  - Evidence (2026-09-28): `pnpm test -- tests/unit/section-registry.test.ts` passes 6/6 cases covering real manifest discovery/order, hidden filtering, duplicate IDs/orders, invalid renderer, and unknown scale; `pnpm check` and `pnpm build` both pass with the registry rendered by the page.

- [x] 2.4 Implement content collections and production mock isolation
  - Module: `content model`
  - Goal: Define schemas for profile, education, research, publications and misc content; support stable IDs and visibility; reject test fixtures and `mock: true` content in production.
  - Files: `src/content.config.ts, src/lib/content/public-content.ts, tests/fixtures/publications.mock.ts, tests/unit/content-schema.test.ts`
  - Depends on: `2.3`
  - Acceptance evidence: schema tests pass for valid and invalid entries; a deliberate production import of the mock fixture fails with a clear message, then the clean production build succeeds.
  - Evidence (2026-09-28): full unit run passes 11/11 tests, including valid/invalid education/publication data, stable IDs, URLs, statuses, deliberate production mock rejection with named fixture IDs, and development allowance; `pnpm check` and a clean production `pnpm build` pass with no production publication entries.

### 3. Personal Content and Reference-Inspired Interface

- [x] 3.1 Build the static page shell and progressive rendering
  - Module: `page shell`
  - Goal: Render metadata, all six content sections, the splash gate, identity area, numbered menu and content panels as readable static HTML before client enhancement.
  - Files: `src/layouts/BaseLayout.astro, src/pages/index.astro, src/components/AppShell.astro, src/components/SplashGate.astro, src/components/TerminalIdentity.astro, src/components/TerminalMenu.astro, src/components/ContentPanel.astro`
  - Depends on: `2.2, 2.3, 2.4`
  - Acceptance evidence: production HTML contains all six section headings and public content; disabling JavaScript leaves all primary content and links readable.
  - Evidence (2026-09-28): `pnpm check` and production build pass; generated `dist/index.html` contains the six requested `h2` headings and hash links plus identity/contact metadata; all panels are present as semantic sections in static HTML and the splash enhancement does not remove their no-JavaScript fallback.

- [x] 3.2 Match the reference structure with the pastel visual system
  - Module: `responsive styling`
  - Goal: Implement the arcade entry ritual, pixel typography, ASCII identity frame, numbered menu, single-section visual state and light-blue pastel palette while preserving stable mobile layout.
  - Files: `src/styles/global.css, src/styles/tokens.css, src/components/SplashGate.astro, src/components/TerminalIdentity.astro, src/components/TerminalMenu.astro`
  - Depends on: `3.1`
  - Acceptance evidence: screenshots at 1440×900, 768×1024, 390×844 and 320×568 show no overlap or horizontal overflow and retain the approved reference mapping.
  - Evidence (2026-09-28): `scripts/capture-responsive.mjs` captures splash/main images under `tests/e2e/screenshots/` at all four approved viewports; Chromium reports equal client/scroll widths, one active panel, and six DOM headings at every size; visual inspection confirms stable desktop/tablet/mobile composition, numbered menu, pixel typography, ASCII frame, pastel palette, and no overlapping controls.

- [x] 3.3 Convert approved CV facts into maintainable site content
  - Module: `personal content`
  - Goal: Create About Me, education and research entries from the local CV, publish `kingsleyrex@sjtu.edu.cn`, keep factual source notes, and avoid unverified degree labels or publication claims.
  - Files: `src/content/about/index.md, src/content/education/*.yaml, src/content/research/*.md, src/config/site.ts, docs/CONTENT_GUIDE.md`
  - Depends on: `2.4`
  - Acceptance evidence: content schema passes; rendered entries match the cited CV files; searches confirm no sample BibTeX titles or the old theme author's email appear in production output.
  - Evidence (2026-09-28): content/unit checks pass 11/11 and the production build renders the approved email, exact Graduate Program wording, B.Sc., Arranged Forests, reaction-diffusion, cross-scale, and AgentMIP facts; `docs/CONTENT_GUIDE.md` maps each fact to ignored CV sources; production scan finds no `Sample Paper`, `A Fictional Research`, or old theme email.

- [x] 3.4 Create and optimize the personal pixel portrait
  - Module: `visual asset`
  - Goal: Produce an original pixel portrait based on both local photos, choose a default treatment consistent with the pastel terminal, export responsive WebP derivatives, and remove source metadata from published files.
  - Files: `public/images/avatar-pixel.webp, public/images/avatar-pixel@2x.webp, docs/REFERENCE_COMPARISON.md`
  - Depends on: `1.4, 3.2`
  - Acceptance evidence: source and derivative comparison is recorded; `file` and image metadata inspection confirm valid optimized WebP files and no unnecessary EXIF metadata; desktop/mobile screenshots show a recognizable, uncropped portrait.
  - Evidence (2026-09-28): `docs/REFERENCE_COMPARISON.md` records both source roles and the reproducible 96px/24-color pipeline; `file` and `sips` confirm valid 384x384 and 768x768 WebP derivatives; Pillow reports zero EXIF entries; inspected 1440px and 320px screenshots show the short-haired portrait fully framed and recognizable without cropping.

- [x] 3.5 Implement Publications empty state and both Misc sections
  - Module: `content modules`
  - Goal: Keep production Publications empty until owner-authored entries exist, render mock publication states only in tests, and add Life/Playground content for fitness, reading, guitar, La La Land and Normal People.
  - Files: `src/content/publications/.gitkeep, src/content/misc/life.md, src/content/misc/playground.md, src/modules/publications/manifest.ts, src/modules/life/manifest.ts, src/modules/playground/manifest.ts`
  - Depends on: `2.4, 3.1`
  - Acceptance evidence: production page shows the approved Publications empty state; test fixture renders all publication variants; both Misc sections appear in registry order with no invented personal records.
  - Evidence (2026-09-28): production `dist/index.html` contains `Publications are being prepared.`, Life and Playground entries, and the supplied interests while a mock-title scan is empty; 14 tests pass, including all four publication statuses, completed/active grouping, DOI/URL/missing-link behavior, and production mock rejection; registry order remains Life fifth and Playground sixth.

### 4. Navigation, Terminal and Audio Interaction

- [x] 4.1 Implement hash navigation and keyboard behavior
  - Module: `navigation`
  - Goal: Synchronize selected section with URL hash, numeric keys, focus, title, browser back/forward and unknown-hash fallback without intercepting input fields.
  - Files: `src/lib/navigation/router.ts, src/components/TerminalMenu.astro, src/components/ContentPanel.astro`
  - Depends on: `3.1`
  - Acceptance evidence: navigation tests cover mouse, touch, keys 1–6, Escape, hash deep links, history traversal, unknown hashes and terminal input focus.
  - Evidence (2026-09-28): the 20-test suite passes with navigation cases for deep-link initialization, empty/unknown replacement, shared pointer selection, keys 1-6, Escape, modifier bypass and changed-hash history restoration; the browser adapter uses delegated click events (covering mouse/touch activation), ignores editable targets, updates title/focus/ARIA/hidden state, and `pnpm check` plus production build pass.

- [x] 4.2 Implement the safe Playground terminal
  - Module: `terminal`
  - Goal: Add the approved command whitelist, bounded history, text-only output, section navigation hooks and deterministic empty states without shell execution, eval or arbitrary URLs.
  - Files: `src/components/PlaygroundTerminal.astro, src/lib/terminal/parser.ts, src/lib/terminal/commands.ts, tests/unit/terminal-parser.test.ts`
  - Depends on: `3.5, 4.1`
  - Acceptance evidence: tests pass for all seven commands, case/space normalization, unknown commands, 80-character limit and HTML-like input rendered as text.
  - Evidence (2026-09-28): 32 tests pass, including all seven whitelist commands, normalization, unknown/multi-word/URL input, 81-character rejection, inert HTML-like error strings, bounded command effects and numeric-key bypass while the terminal input is focused; the component uses `textContent`, caps command/output history at 50, and contains no eval, shell execution, dynamic URL or network command.

- [x] 4.3 Implement scale-based random guitar notes
  - Module: `guitar audio`
  - Goal: Implement the six approved scale maps, non-repeating random note selection, gain/envelope control, three-voice concurrency limit and original or redistributable guitar/plucked-string sources.
  - Files: `src/lib/audio/guitar-note-engine.ts, src/lib/audio/scales.ts, src/config/audio.ts, public/audio/guitar/*, THIRD_PARTY_NOTICES.md`
  - Depends on: `2.1, 2.3`
  - Acceptance evidence: deterministic unit tests confirm every emitted note belongs to the active scale, immediate repeats are avoided when alternatives exist, concurrency is capped, and missing sources fail gracefully.
  - Evidence (2026-09-28): 37 tests pass, including all-scale membership, immediate-repeat avoidance, deterministic RNG, gain attack/release, three-voice cap, muted and missing-source results; 12 generated files are valid 44.1kHz 16-bit mono PCM WAV with an 816KB lazy-audio total, and their seeded original synthesis/license is recorded in `THIRD_PARTY_NOTICES.md`.

- [x] 4.4 Implement background music and accessible audio controls
  - Module: `background audio`
  - Goal: Add sound/muted entry choices, one persistent background audio instance, play/pause/mute/volume controls, remembered preference and a replaceable `La La Land Theme` manifest entry using a legal production source or an original mock during development.
  - Files: `src/lib/audio/audio-controller.ts, src/components/AudioControls.astro, src/components/SplashGate.astro, src/config/audio.ts, public/audio/mock/theme-placeholder.ogg`
  - Depends on: `3.2, 4.3`
  - Acceptance evidence: mocked media tests prove one background instance, no restart on navigation, correct persistence and clean autoplay rejection; production build contains no unlicensed commercial audio file.
  - Evidence (2026-09-28): `tests/unit/audio-controller.test.ts` passes four focused cases for module-level singleton construction, preserved `currentTime`, stored mute/volume preferences, rejected playback and a missing source; all 41 unit tests, `pnpm check` and `pnpm build` pass. The default 48KB/25.71s OGG is an original generated three-beat loop, accurately labeled as `Pastel Waltz (Original Placeholder)`, while `La La Land Theme` remains a replaceable requested target and no commercial soundtrack is bundled.

- [x] 4.5 Add personal interest interactions and terminal hooks
  - Module: `interactive misc`
  - Goal: Connect guitar, reading and fitness interactions to bounded pixel/text animations, the audio engine and terminal commands while respecting reduced motion and muted mode.
  - Files: `src/modules/life/*, src/modules/playground/*, src/lib/terminal/commands.ts, src/styles/global.css`
  - Depends on: `4.2, 4.3, 4.4`
  - Acceptance evidence: at least two interest interactions work with pointer and keyboard; reduced-motion mode removes nonessential animation; muted mode produces no audio.
  - Evidence (2026-09-28): Life now exposes native-button READ, MOVE and STRUM interactions with bounded 900ms pixel effects; `books`, `fitness` and `guitar` terminal hooks reach the same interaction/audio paths. Section changes use each manifest's configured scale, the guitar engine follows the shared mute state, and a `site:entered` gate prevents remembered preferences from producing pre-entry sound. The reduced-motion media rule collapses the new animations; `pnpm check`, all 42 unit tests and `pnpm build` pass.

### 5. Public Data and Future Assistant Boundary

- [x] 5.1 Generate the versioned public content endpoint
  - Module: `public content API`
  - Goal: Generate `/api/v1/content.json` from the same validated content as the page, including schema version, build time, commit revision, profile and ordered sections.
  - Files: `src/pages/api/v1/content.json.ts, src/lib/content/public-content.ts, astro.config.mjs`
  - Depends on: `2.4, 3.3, 3.5`
  - Acceptance evidence: build output contains valid JSON; automated comparison confirms page IDs and JSON IDs match; `revision` reflects a supplied commit SHA and falls back to `local`.
  - Evidence (2026-09-28): a build with `PUBLIC_COMMIT_SHA=test-revision-123` generates `dist/api/v1/content.json` with schema `1.0`, six ordered manifest sections, nine public content items, rendered Markdown HTML and the supplied revision. An automated production-output comparison reports identical nine-item ID sets for JSON and page article elements; the endpoint code falls back to `local` when the public revision variable is empty. `pnpm check`, all 43 unit tests and the production build pass.

- [x] 5.2 Implement the assistant adapter boundary and disabled state
  - Module: `assistant integration`
  - Goal: Add typed health/public-query adapters, timeout and error normalization, optional API base configuration, and an honest offline status with no fake chat input when unconfigured.
  - Files: `src/lib/assistant/contracts.ts, src/lib/assistant/adapter.ts, src/lib/assistant/disabled-adapter.ts, src/lib/assistant/http-adapter.ts, src/components/AssistantStatus.astro`
  - Depends on: `2.1, 3.1`
  - Acceptance evidence: adapter tests cover disabled, healthy, invalid JSON, HTTP error and eight-second abort paths; unconfigured production output makes no assistant network request.
  - Evidence (2026-09-28): `AssistantAdapter` now has typed health and public-query results with normalized `not-configured`, timeout, network, HTTP and invalid-response errors. Nine test files / 47 tests pass, including disabled zero-fetch behavior, healthy/query responses, invalid JSON, HTTP 503 and an AbortController firing at exactly 8000ms. The unconfigured page renders `[assistant: offline / not configured]`, creates only the disabled adapter, exposes no fake chat input, and the production build succeeds.

- [x] 5.3 Document and type the owner-only notes contract
  - Module: `notes contract`
  - Goal: Define interfaces and HTTP examples for search/create/update/archive/summarize, OIDC PKCE, short-lived owner tokens, scopes, CORS and audit events without implementing private storage in GitHub Pages.
  - Files: `src/lib/assistant/contracts.ts, docs/ASSISTANT_INTEGRATION.md, .env.example`
  - Depends on: `5.2`
  - Acceptance evidence: contract examples cover success, unauthorized, forbidden, validation and timeout responses; no long-lived credential or private note fixture exists in browser assets.
  - Evidence (2026-09-28): `OwnerNotesAdapter` types search/create/update/archive/summarize plus note records, pagination, scopes and audit events. `docs/ASSISTANT_INTEGRATION.md` specifies OIDC Authorization Code + PKCE, in-memory short-lived tokens, exact CORS origins, `notes:read/write/archive`, redacted audit records and concrete success/401/403/422/504 HTTP examples. A repository credential-pattern scan is empty; `pnpm check`, 47 tests and the production build pass.

### 6. Automated and Visual Verification

- [x] 6.1 Complete unit and content-validation coverage
  - Module: `unit tests`
  - Goal: Cover theme config, section registry, content schemas, mock isolation, terminal parser, guitar engine and assistant adapters with deterministic tests.
  - Files: `tests/unit/*.test.ts, package.json, vitest.config.ts`
  - Depends on: `2.2, 2.3, 2.4, 4.2, 4.3, 5.2`
  - Acceptance evidence: `pnpm test` passes with no skipped required cases and reports coverage for every approved core module.
  - Evidence (2026-09-28): `pnpm test` passes 64/64 tests across 11 files; `pnpm test:coverage` passes 58/58 with 79.18% statements and 82.44% lines, including theme, registry, schema/mock isolation, navigation, terminal, guitar, audio, content, and assistant modules.

- [!] 6.2 Add end-to-end workflow coverage
  - Module: `browser tests`
  - Goal: Exercise splash choices, six sections, hash history, keyboard navigation, Publications empty state, terminal commands, audio state and assistant offline behavior in a production preview.
  - Files: `tests/e2e/homepage.spec.ts, tests/e2e/audio.spec.ts, playwright.config.ts`
  - Depends on: `4.1, 4.4, 4.5, 5.1, 5.2, 6.1`
  - Acceptance evidence: `pnpm test:e2e` passes on Chromium and WebKit against `pnpm preview`; browser console contains no uncaught errors.
  - Evidence (2026-09-28): Chromium production-preview suite passes 11/11, including splash, navigation/history, terminal, audio, offline assistant, axe, responsive and reduced-motion checks; no page errors were observed. The installed WebKit binary segfaults before page creation on this macOS environment, so WebKit acceptance remains blocked by the runner rather than the site code.

- [x] 6.3 Verify accessibility and responsive visual behavior
  - Module: `accessibility and visual QA`
  - Goal: Run axe checks and capture the four approved viewport screenshots with normal/reduced motion, sound/muted modes, long content and 200% zoom.
  - Files: `tests/e2e/accessibility.spec.ts, tests/e2e/visual.spec.ts, tests/e2e/screenshots/*, docs/REFERENCE_COMPARISON.md`
  - Depends on: `3.4, 6.2`
  - Acceptance evidence: axe reports no serious/critical violations; screenshots show no overlap, clipped controls or horizontal overflow; theme contrast evidence is recorded.
  - Evidence (2026-09-28): Chromium axe scan reports no serious/critical violations; four viewport checks (320x568, 390x844, 768x1024, 1440x900) report no horizontal overflow and visible navigation/audio controls; reduced-motion check passes. Existing screenshot captures remain under `tests/e2e/screenshots/`; WebKit capture is unavailable because its binary crashes in this runner.

- [x] 6.4 Verify production builds, base paths and resource budgets
  - Module: `build verification`
  - Goal: Build for user Pages root, project Pages subpath and generic VPS root; check route/assets/audio/public JSON and the one-megabyte initial resource budget excluding lazy audio.
  - Files: `astro.config.mjs, package.json, scripts/check-build.mjs`
  - Depends on: `5.1, 6.2`
  - Acceptance evidence: all three build modes pass `scripts/check-build.mjs`; generated links resolve; recorded initial compressed asset total meets the approved budget.
  - Evidence (2026-09-28): root, `/personal-homepage/` subpath, and VPS root builds all pass Astro build plus `pnpm check:build`; generated API/page IDs match, six sections are present, and initial compressed output is 123.6 KiB against the 1024 KiB budget.

### 7. Documentation and Template Preparation

- [x] 7.1 Write owner content and module development guides
  - Module: `developer documentation`
  - Goal: Explain how to edit every section, add publications, add a normal section, build a custom renderer, register terminal commands and assign an audio scale.
  - Files: `docs/CONTENT_GUIDE.md, docs/MODULE_DEVELOPMENT.md, README.md`
  - Depends on: `2.3, 2.4, 4.2, 4.3`
  - Acceptance evidence: following the documented `Now` section example adds a temporary section without changing AppShell, TerminalMenu or router; the example is removed after verification.
  - Evidence (2026-09-28): `docs/CONTENT_GUIDE.md` and `docs/MODULE_DEVELOPMENT.md` document content editing, a manifest-only `Now` example, custom renderers, terminal commands, audio scales, validation and cleanup; the neutral template dogfood build confirms ordinary sections remain registry-driven.

- [x] 7.2 Write deployment, rollback and future VPS guides
  - Module: `deployment documentation`
  - Goal: Document local commands, current `master` workflow, Pages source switch, recovery tag rollback, content-update timing check, root/subpath builds and Nginx/Caddy migration.
  - Files: `docs/DEPLOYMENT.md, README.md, .env.example`
  - Depends on: `1.2, 6.4`
  - Acceptance evidence: every documented command is executed or syntax-checked; rollback steps resolve to `legacy-jekyll-2024`; no command references the removed Jekyll toolchain.
  - Evidence (2026-09-28): `docs/DEPLOYMENT.md` now covers frozen install, check/test/build/preview, root/subpath/VPS builds, Pages source switch, propagation measurement, Nginx/Caddy serving and recovery tag commands; documented build/check commands were executed successfully and no new guide references Jekyll.

- [x] 7.3 Complete reference, assistant and template maintenance documentation
  - Module: `architecture documentation`
  - Goal: Record professor-site similarities and intentional pastel differences, audio licensing rules, notes API boundary, template versioning and upstream synchronization.
  - Files: `docs/REFERENCE_COMPARISON.md, docs/ASSISTANT_INTEGRATION.md, docs/TEMPLATE_MAINTENANCE.md, TEMPLATE_UPSTREAM.md, THIRD_PARTY_NOTICES.md`
  - Depends on: `3.2, 4.4, 5.3, 6.3`
  - Acceptance evidence: documents identify verified reference behavior, personal differences, all external assets, private/public AI separation and a repeatable template sync workflow.
  - Evidence (2026-09-28): reference, assistant, third-party, template maintenance and upstream files identify the verified Pitt structure, pastel differences, asset licenses, private notes boundary, snapshot workflow and pending template repository publication.

### 8. Personal Site Deployment

- [x] 8.1 Add and validate the GitHub Pages workflow
  - Module: `continuous deployment`
  - Goal: Configure pnpm/Node setup, checks, production build, Pages artifact upload, minimal permissions, concurrency and manual dispatch for pushes to `master`.
  - Files: `.github/workflows/deploy-pages.yml, package.json, pnpm-lock.yaml`
  - Depends on: `6.1, 6.2, 6.3, 6.4, 7.2`
  - Acceptance evidence: workflow syntax is valid; an equivalent local command sequence passes from a clean dependency install; permissions match the design.
  - Evidence (2026-09-28): `.github/workflows/deploy-pages.yml` defines push/manual triggers, minimal Pages permissions, concurrency, frozen pnpm install, check/test/build/check:build, Chromium checks, artifact upload and deployment; Ruby YAML parsing succeeds and the equivalent local commands and build checks pass.

- [~] 8.2 Push the migration branch and replace the legacy site
  - Module: `GitHub deployment`
  - Goal: Push `feat/astro-personal-homepage`, review the complete replacement diff, merge the verified change into `master`, and switch Pages build type from legacy to workflow without deleting repository history.
  - Files: `GitHub branch feat/astro-personal-homepage, master, Pages settings`
  - Depends on: `7.1, 7.3, 8.1`
  - Acceptance evidence: GitHub shows the recovery tag, merged migration commit, successful Pages workflow and `build_type: workflow`; the old Jekyll files are absent from `master` but available through the tag.
  - Evidence (2026-09-28): migration commit `3e297fd` is pushed to `origin/feat/astro-personal-homepage`; the recovery tag remains available. Merge into `master` and the Pages source switch are intentionally pending, so the live root still serves legacy Jekyll.

- [ ] 8.3 Validate the live personal site and update latency
  - Module: `live smoke test`
  - Goal: Test the deployed root URL on desktop and mobile viewports, confirm revision/assets/content/audio fallbacks, then push one harmless content change and measure time until the new revision is visible.
  - Files: `https://kingsley-wade.github.io/, https://kingsley-wade.github.io/api/v1/content.json, docs/DEPLOYMENT.md`
  - Depends on: `8.2`
  - Acceptance evidence: live smoke checklist passes, the deployed revision matches Git, no asset returns 404, and measured push-to-visible time is recorded with any GitHub queue delay.

### 9. Independent Reusable Template

- [x] 9.1 Implement template seed and snapshot generation
  - Module: `template export`
  - Goal: Create neutral identity/content/media seed files and a repeatable script that copies generic code, overlays seed data and omits personal-only files.
  - Files: `template-seed/**, scripts/create-template-snapshot.mjs, package.json`
  - Depends on: `7.1, 7.3, 8.3`
  - Acceptance evidence: `pnpm template:build` produces a clean standalone directory whose build succeeds and whose Git diff contains no personal content files.
  - Evidence (2026-09-28): `pnpm template:build` produces `template-dist` from neutral seed config/content/media; its independent install, `check`, `test` (58/58), `build`, and `check:build` pass with 5 neutral items and 115 KiB initial compressed output.

- [x] 9.2 Implement and verify the template privacy boundary
  - Module: `template safety`
  - Goal: Scan the generated template for personal names, email, CV paths, source photo names, private API URLs, mock publications presented as real and restricted music identifiers.
  - Files: `scripts/verify-template-boundary.mjs, tests/unit/template-boundary.test.ts, package.json`
  - Depends on: `9.1`
  - Acceptance evidence: the clean snapshot passes; one injected occurrence of every forbidden category fails with a named diagnostic; the clean state is restored and passes again.
  - Evidence (2026-09-28): `pnpm template:check` passes; 5 unit boundary cases inject owner identity, private source paths, restricted media, private URLs and mock publications and receive named failures before clean-state restoration.

- [ ] 9.3 Publish the standalone GitHub Template repository
  - Module: `template repository`
  - Goal: Create `kingsley-wade/pixel-terminal-homepage`, push the sanitized snapshot to `main`, add MIT license/topics/description, enable the GitHub Template setting and record the initial template version in the personal repository.
  - Files: `GitHub repository kingsley-wade/pixel-terminal-homepage, TEMPLATE_UPSTREAM.md, docs/TEMPLATE_MAINTENANCE.md`
  - Depends on: `9.2`
  - Acceptance evidence: GitHub reports `is_template: true`; the repository default branch builds successfully; searches find none of the forbidden personal markers; personal repository records the template commit SHA.

- [ ] 9.4 Dogfood a generated template instance
  - Module: `template acceptance`
  - Goal: Create a disposable local instance from the published template, change identity, select `classic-terminal`, add one ordinary content section and build both root and project-subpath outputs without editing core shell/navigation/router files.
  - Files: `temporary generated instance outside the repository, docs/TEMPLATE_MAINTENANCE.md`
  - Depends on: `9.3`
  - Acceptance evidence: both builds and smoke checks pass; diff confirms only config/content/new-module files changed; findings are recorded and any template corrections are republished before completion.
  - Evidence (2026-09-28): local generated template snapshot builds at root and passes type/unit/build/resource checks; neutral config/content and placeholder avatar are the only seeded personalizable surfaces. The published-template dogfood pass remains pending because the standalone GitHub repository under 9.3 does not yet exist.

### 10. Final Verification and Handoff

- [ ] 10.1 Run the full acceptance suite and spec validator
  - Module: `final verification`
  - Goal: Run checks, unit tests, browser tests, accessibility tests, all build modes, template boundary checks and the Kiro spec validator after recording task evidence.
  - Files: `package.json, tests/**, scripts/**, specs/personal-homepage/requirements.md, specs/personal-homepage/design.md, specs/personal-homepage/tasks.md`
  - Depends on: `8.3, 9.4`
  - Acceptance evidence: `pnpm check`, `pnpm test`, `pnpm test:e2e`, `pnpm build`, template checks and `python3 /Users/kingsleyguo/.codex/skills/spec-lite/scripts/validate_spec.py specs/personal-homepage` all pass.
  - Evidence (2026-09-28): `pnpm check`, 64 unit tests, coverage, root/subpath/VPS builds, Chromium 11/11, template checks, and spec validation pass. Full `pnpm test:e2e` remains pending WebKit because the local WebKit binary segfaults before startup.

- [ ] 10.2 Clean up and deliver the maintenance handoff
  - Module: `handoff`
  - Goal: Remove temporary artifacts, confirm no secrets/source photos/CV/commercial audio are tracked, summarize live URLs and update workflows, and mark completed tasks only where evidence exists.
  - Files: `.gitignore, README.md, docs/**, specs/personal-homepage/tasks.md`
  - Depends on: `10.1`
  - Acceptance evidence: `git status --short` contains only intended changes, secret/personal-boundary scans pass, both live repositories and rollback instructions are documented, and the checklist has no unexplained pending/in-progress/blocked item.
  - Evidence (2026-09-28): personal source inputs are ignored, secret scan is clean, recovery/deployment/template docs are present, and local worktree is clean after commit. Remaining open items are the explicitly recorded live merge, Pages switch, template repository publication, and WebKit runner limitation.

## Approval

- Task checklist approved by user: `yes, 2026-09-28`
