# Photos and Dealer-Chase 21 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a personal Photos section and replace Pixel Mole with a no-stakes 21-point game against a dealer that chases the player's total.

**Architecture:** Register Photos as a new section and render a focused Astro gallery with a local typed manifest and native dialog lightbox. Build the card rules in a small pure TypeScript module, connect them to a separate Astro client component, and reuse the existing `arcade` terminal event to start a hand.

**Tech Stack:** Astro, TypeScript, the existing section registry, local static assets, Canvas-independent DOM controls.

**Spec:** docs/superpowers/specs/2026-10-29-photos-section-and-lab-palette-design.md

## Global Constraints

- Do not add sample photos, tracking, audio, remote APIs, analytics, or persistent viewing state.
- Do not edit CV content or unrelated site sections.
- Do not publish or push the site as part of this work.
- Keep the dealer-chase rule and label it as a 21-point variant; do not present it as standard casino Blackjack.
- Do not add or run automated tests; use production build and manual browser verification.
- The reaction-diffusion palette change in `src/lib/playground/reaction-diffusion-client.ts` is already implemented and should remain theme-aware.

## Review Focus

- Aces must shift from 11 to 1 as needed without a false bust.
- Initial two-card 21 must resolve as a natural, with a push when both sides have one.
- Dealer chase must stop at equality or a higher total, and a dealer bust must award the hand to the player.
- Starting a new hand must clear the prior hand, reveal state, and buttons before dealing the next shuffled deck.
- The gallery must handle zero, one, and many manifest entries; dialog close and Escape must restore focus.

---

### Task 1: Register the Photos section and build its local gallery

**Files:**
- Create: `src/modules/photos/manifest.ts`
- Create: `src/content/photos/gallery.ts`
- Create: `src/components/PhotoGallery.astro`
- Create: `src/lib/photos/photo-gallery-client.ts`
- Modify: `src/core/section-contract.ts`
- Modify: `src/components/AppShell.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Produce a `photos` renderer id and a public Photos manifest at order `55`, between Life (`50`) and Playground (`60`).
- Produce `PhotoItem = { id: string; src: string; alt: string }` and an initially empty `photos: PhotoItem[]` export from `src/content/photos/gallery.ts`. `src` is relative to the public root, e.g. `images/photos/example.jpg`.
- Produce a gallery with local responsive thumbnail buttons, an empty state, and an accessible modal `<dialog>`; use `withBase()` for public image paths.

- [x] Add the Photos manifest and typed empty gallery list; keep it out of unrelated content collections.
- [x] Mount `PhotoGallery` for the `photos` renderer and confirm navigation order follows manifest order.
- [x] Render a responsive contact sheet without captions or location metadata; show a short directory/manifest hint when empty.
- [x] Add dialog open/close behavior, Escape handling, descriptive alt text, and focus restoration to the launching tile. (Code-reviewed; real-image interaction awaits user photos.)
- [x] Style the gallery and dialog using existing pixel frames and theme tokens, with usable narrow-screen tiles.

### Task 2: Replace Pixel Mole with the dealer-chase 21-point arcade

**Files:**
- Create: `src/lib/playground/blackjack.ts`
- Create: `src/lib/playground/blackjack-client.ts`
- Create: `src/components/BlackjackArcade.astro`
- Delete: `src/lib/playground/whack-a-mole-client.ts`
- Delete: `src/components/WhackAMole.astro`
- Modify: `src/components/AppShell.astro`
- Modify: `src/lib/terminal/commands.ts`
- Modify: `src/content/misc/playground.md`
- Modify: `src/styles/global.css`

**Interfaces:**
- Produce `type Card = { rank: CardRank; suit: CardSuit }`, where `CardRank` is `"A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K"` and `CardSuit` is `"clubs" | "diamonds" | "hearts" | "spades"`.
- Produce `type HandValue = { total: number; soft: boolean; bust: boolean }` and `type HandOutcome = "player" | "dealer" | "push"`.
- Produce `createShuffledDeck(random?: () => number): Card[]`, `handValue(cards: readonly Card[]): HandValue`, `isNatural(cards: readonly Card[]): boolean`, and `resolveHand(playerTotal: number, dealerTotal: number): HandOutcome` in `blackjack.ts`.
- Produce `initBlackjackArcade(root)` in `blackjack-client.ts`, listening for the existing `terminal:interaction` event with `{ action: "arcade" }`.
- Produce `BlackjackArcade.astro` with Deal/Play Again, Hit, Stand, player/dealer cards, visible totals, one hidden dealer card until reveal, and a polite status region.

- [x] Implement a shuffled standard 52-card deck; use face values, flexible Aces, natural 21, bust and tie outcomes from the spec.
- [x] Implement player Hit/Stand turns and the approved dealer chase: reveal after Stand, draw while below the player's standing total, then stop at equality or higher; dealer bust loses.
- [x] Provide short local dealer reactions that explain the chase decision; keep all state in the current page session.
- [x] Implement accessible card labels and controls; disable Hit/Stand outside the player's active turn and auto-resolve a bust or natural.
- [x] Replace the mole component in `AppShell`, update the `arcade` response and Playground introduction, and remove obsolete mole styles and files.
- [x] Manually verify deal, hit, stand, natural 21, bust, a dealer win, and a clean new hand. Push and a dealer-draw-through sequence were not observed in this short manual pass.

### Task 3: Build and review the integrated site

**Files:**
- No additional files.

- [x] Run `pnpm build`; expected result is a successful Astro production build.
- [x] Review the local `/#playground` page and confirm Photos appears between Life and Playground, followed by the updated Playground sections.
- [x] Manually inspect the empty gallery state and verify the section's asset/manifest instructions are accurate.
- [x] Manually play a 21-point hand with Hit and Stand; verify a soft Ace, dealer reveal, chase explanation, and new hand reset.
- [ ] Confirm the `arcade` terminal shortcut starts a new hand and existing terminal navigation still works.
- [x] Review the updated reaction-diffusion palette and a narrow viewport; confirm no audio starts and no Mole copy remains.
