# Photos, 21-Point Arcade, and Reaction–Diffusion Palette Design

## Goal

Add a first-party Photos section for Manting's own photographs, replace whack-a-mole with a dealer-chase 21-point game, and soften the color palette in the existing Reaction–Diffusion Lab. Keep the changes consistent with the current pixel-inspired pastel site.

## Audience and tone

The Photos section is a personal visual archive. Photos should carry the page; avoid invented titles, captions, locations, dates, tags, or other metadata. The arcade should feel like a compact face-off with a playful virtual dealer. The lab should feel calmer and more colorful without changing its controls or simulation behavior.

## Photos section

- Add a public `Photos` section to the main navigation between Life (order 50) and Playground (order 60).
- Use a responsive contact-sheet grid: tidy thumbnail tiles with the current site's pixel-frame styling. On narrow screens the grid remains legible and images remain tappable.
- Selecting a photo opens a larger view in an accessible lightbox. Support closing with a visible button and Escape, and restore focus to the selected tile when the viewer closes.
- Store user-supplied files under `public/images/photos/` and register them in a small local gallery manifest. Do not fetch photos from a remote service or send them to any service.
- Each manifest entry supplies an image path and descriptive alt text. Do not show captions or location metadata in the gallery.
- Start with no invented/example photos. If the manifest is empty, show a brief empty state that points to the photo directory and manifest.
- Load thumbnails lazily; opening a tile shows the local original image at a larger size.

## Reaction–Diffusion palette

- Remove the current yellow-brown `highlight` stop from the concentration gradient.
- Build the gradient from existing theme tokens, in this order: surface, mint, lavender, coral, and link/deep teal.
- Keep the palette theme-aware so the existing light and terminal themes both use their own token values.
- Do not change simulation math, presets, slider ranges, controls, or the rest of the site's color system.

## 21-point arcade

- Replace Pixel Mole with a one-player, one-dealer card game titled **21 · Dealer's Chase**. It is a local, no-stakes game with no audio and no persistent statistics.
- At the start of each hand, shuffle a standard 52-card deck and give the player and dealer two cards each. Show one dealer card and keep the other face down until the player stands or busts.
- Number cards count at face value, J/Q/K count as 10, and Ace counts as 11 unless that would bust, in which case it counts as 1.
- The player can choose Hit or Stand. A hand over 21 busts; reaching 21 ends the player's turn automatically. A player's natural 21 wins unless the dealer also opens with a natural 21, which is a push; a dealer-only natural wins immediately.
- After the player stands, reveal the dealer's down card. The dealer's defining variant rule is to draw while below the player's standing total, then stand when equal or higher. Going over 21 is a dealer bust; equal totals push; otherwise the higher non-bust total wins.
- Explain this chase rule briefly in the game copy. Use a small set of locally defined dealer remarks that clarify the choice to draw; do not call a remote AI service or imply a learned model.
- Provide Deal/Play Again, Hit, and Stand controls; disable Hit and Stand when the hand is not active. Announce the turn and result through a polite status region without announcing each card animation.
- Keep the current `arcade` terminal shortcut, but have it bring the visitor to a fresh hand of 21.

## Architecture

- Register Photos through a new section manifest and add a `photos` renderer id to the section contract.
- Render the gallery through a focused Astro component mounted by `AppShell` when the Photos manifest is encountered.
- Keep the typed image list in `src/content/photos/gallery.ts`; public image files stay under `public/images/photos/` for straightforward user additions. Each entry has a stable id, relative image path, and descriptive alt text.
- Use a native modal `<dialog>` for the lightbox, with an explicit close button, Escape handling, and focus restoration. Add no external JavaScript dependency.
- Reuse existing theme tokens, panel structure, and responsive spacing.

## Boundaries

- Do not add sample photos, tracking, audio, remote APIs, analytics, or persistent viewing state.
- Do not edit CV content or unrelated site sections.
- Do not publish or push the site as part of this work.

## Acceptance criteria

- Photos appears as a separate main navigation section between Life and Playground.
- The photo grid is responsive, keyboard accessible, and uses only the locally registered images.
- Opening and closing a photo works with pointer, keyboard, and touch; Escape closes the viewer and focus returns to its tile.
- Empty gallery state is useful and contains no fake image content.
- The reaction-diffusion canvas no longer uses the yellow-brown stop and draws from theme-aware mint, lavender, coral, and teal stops.
- The arcade clearly states the dealer-chase rule; deck values, Aces, naturals, busts, ties, and dealer chase outcomes follow the rules above.
- The `arcade` terminal command starts a fresh 21-point hand, and no Mole text or controls remain.
- The production build succeeds and the local preview is manually checked at desktop and narrow widths.
