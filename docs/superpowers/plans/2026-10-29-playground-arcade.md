# Playground Lab and Arcade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Add a local reaction-diffusion toy and pixel whack-a-mole game to Playground while preserving its reading links and filesystem terminal.

**Architecture:** Add two isolated Astro components and a small Gray–Scott simulation module. Integrate them at the existing Playground render point, simplify the existing share renderer to title-only links, and add one terminal command that focuses the game.

**Tech Stack:** Astro components, TypeScript, Canvas 2D, existing global CSS tokens and terminal event contract.

**Spec:** docs/superpowers/specs/2026-10-29-playground-arcade-design.md

## Global Constraints

- The simulation and game run entirely in the browser; add no dependencies, service calls, analytics, storage, or account state.
- Keep the game silent and its score limited to the current page session.
- Preserve current terminal navigation and the existing public share data.
- Render only public link titles as anchors in the Reading Shelf; retain note/link terminal paths.
- Do not modify or stage the unrelated CV, education, research, or publication edits already present in the worktree.
- Do not push or publish the site.

## Review Focus

- Rapid start/restart/expiry does not leave duplicate timers or active targets.
- Keyboard users can start a round and activate each mole target; timer announcements do not flood the live region.
- Simulation sliders and preset changes remain bounded and reset the grid predictably.
- Small screens retain usable controls and a visible 3-by-3 game grid.
- The title-only share rendering does not break terminal notes/, links/, or open ITEM_ID behavior.

---

### Task 1: Add the Gray–Scott simulation module

**Files:**
- Create: src/lib/playground/gray-scott.ts

**Interfaces:**
- Produce GrayScottPreset with id, label, feed, and kill fields.
- Produce grayScottPresets: readonly GrayScottPreset[] with three stable presets.
- Produce GrayScottSimulation with constructor (width: number, height: number, preset: GrayScottPreset), setParameters(feed: number, kill: number): void, reset(preset?: GrayScottPreset): void, step(iterations?: number): void, and draw(context: CanvasRenderingContext2D, palette: Uint8Array): void.

- [x] Implement a small bounded Gray–Scott grid using two reusable Float32Array buffers per chemical and wraparound neighbors.
- [x] Seed a repeatable initial patch on reset and apply feed/kill values within the component slider bounds.
- [x] Map concentration values to a small palette derived from existing theme CSS tokens; avoid reading user content or making requests.
- [x] Confirm the module exposes only the preset data and simulation API listed above.

### Task 2: Build the reaction-diffusion lab component

**Files:**
- Create: src/components/ReactionDiffusionLab.astro
- Create: src/lib/playground/reaction-diffusion-client.ts
- Modify: src/styles/global.css

**Interfaces:**
- Consume GrayScottPreset, grayScottPresets, and GrayScottSimulation from Task 1.
- Produce a data-reaction-diffusion-lab root with labeled preset, feed, kill, run/pause, reset controls, one labeled canvas, and a concise status description.

- [x] Add semantic component markup with visible current parameter values and an accessible canvas label.
- [x] In the client module, initialize the selected preset, connect slider updates to setParameters, and use requestAnimationFrame for active drawing.
- [x] Ensure pause, reset, and Astro section re-entry do not leave an animation frame running twice.
- [x] Start paused when prefers-reduced-motion: reduce matches; allow the user to start manually.
- [x] Style the lab with existing theme tokens and a narrow-screen layout.

### Task 3: Build the whack-a-mole arcade component

**Files:**
- Create: src/components/WhackAMole.astro
- Create: src/lib/playground/whack-a-mole-client.ts
- Modify: src/styles/global.css

**Interfaces:**
- Produce a component with data-whack-a-mole, a 3-by-3 set of native buttons, start/restart, score, remaining-time, and status elements.
- Listen for terminal:interaction with { action: arcade } to scroll to and start the game.

- [x] Implement a 30-second round with one active target at a time, a score counter, and a single cleanup path for all timers.
- [x] Make targets activate with pointer, touch, Enter, and Space; keep inactive buttons out of the game's action path while retaining clear accessible labels.
- [x] Announce game start/end and score changes in a polite status region; update the visible timer without making every tick an announcement.
- [x] Reset score and timers on restart and when the component is initialized; store no game state.
- [x] Add pixel-art styling and reduced-motion-safe state changes.

### Task 4: Integrate sections, title-only reading links, and terminal shortcut

**Files:**
- Modify: src/components/AppShell.astro
- Modify: src/components/PlaygroundShares.astro
- Modify: src/components/PlaygroundTerminal.astro
- Modify: src/lib/terminal/commands.ts
- Modify: src/lib/terminal/client.ts
- Modify: src/core/section-contract.ts
- Modify: src/modules/playground/manifest.ts
- Modify: src/content/misc/playground.md
- Modify: src/styles/global.css

**Interfaces:**
- Mount Lab, Arcade, Reading Shelf, and Terminal in the order defined in the spec.
- Add arcade to terminalCommandIds, TerminalCommandId, and the Playground manifest terminalCommands.
- Add arcade to the terminal interaction union; executing arcade emits the existing terminal:interaction event with action arcade.

- [x] Mount ReactionDiffusionLab and WhackAMole before PlaygroundShares and PlaygroundTerminal.
- [x] Render only public kind: link entries in the Reading Shelf, with each title as the external anchor; leave the terminal's full share list unchanged.
- [x] Add the documented arcade terminal command and a short playful response while preserving all existing command effects.
- [x] Replace the obsolete Playground copy about offline assistant setup with a concise local-experiments introduction.

### Task 5: Build and manually review the local page

**Files:**
- No additional files.

- [x] Run pnpm build; expected result is a successful Astro production build.
- [x] Review the local preview at /#playground: all four blocks appear in order and use the site's theme.
- [x] Manually exercise one preset, slider updates, pause/resume/reset, a full game round, keyboard target activation, and the terminal arcade shortcut.
- [x] Confirm public share titles link to their destinations and existing terminal ls, cd, and open flows still work.
- [x] Inspect the narrow-screen layout; confirm no audio starts and no offline-assistant text remains.
