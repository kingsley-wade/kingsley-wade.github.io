# Playground Lab and Arcade Design

## Goal

Make Playground feel like a personal, playful corner of the site while keeping its existing reading links and local terminal. Add a visual reaction-diffusion toy and a short pixel-art whack-a-mole game.

## Audience and tone

Visitors should be able to understand and try an interaction immediately. Keep the existing pastel, pixel-art interface and the owner's interests in applied mathematics, music, reading, and fitness in the background. The game is a light arcade activity, not a workout tracker.

## Layout

Inside Playground, present these blocks in order:

1. **Reaction–Diffusion Lab** — a local visual simulation with parameter controls and three named presets. Include a short plain-language explanation and a link to the existing Research section. Use mood-oriented preset names such as *Window Seat*, *Blue Hour*, and *After Hours*, while showing the actual feed and kill values.
2. **Arcade** — a 30-second pixel-art whack-a-mole game. Support pointer, touch, and keyboard activation. Show the current round's score and remaining time; discard them when the page is reloaded. Do not play audio or persist results.
3. **Reading Shelf** — show public link entries as titles that are themselves external links. Do not render summaries, source descriptions, tags, update dates, or public Note bodies in this shelf. Keep the existing note/link terminal navigation intact.
4. **Local Terminal** — retain its current filesystem and navigation behavior. Add one arcade command that announces and focuses the game without breaking existing commands.

Remove the outdated Playground copy that says an assistant is offline or not configured. Do not add a hosted assistant or any remote runtime dependency.

## Simulation behavior

Use a bounded Gray–Scott reaction-diffusion simulation in the browser. A small fixed grid is updated on the main thread and drawn to a canvas with the site's existing color tokens. Controls cover feed and kill parameters, run/pause, reset, and preset selection. Presets reset to a repeatable initial field so visitors can compare patterns. Include an accessible canvas label, labeled controls, and a concise textual description; honor reduced-motion preferences by keeping the simulation paused until started.

## Game behavior

The game uses a 3-by-3 hole grid, one active mole at a time, a 30-second round, and a score that exists only in the current page session. Start/restart and target buttons must work with keyboard and touch. Announce round start/end and score changes without announcing every timer tick. No audio, analytics, account state, network calls, or persistent score storage.

## Boundaries

- Keep all effects client-side and local to the page.
- Keep the reading shelf limited to title and link; do not invent reading recommendations.
- Keep unrelated CV, education, research, and publication edits untouched.
- Do not publish or push the site.
- Use the existing terminal, share content, Astro components, and global theme rather than adding a framework or dependencies.

## Acceptance criteria

- The Playground visibly separates the Lab, Arcade, Reading Shelf, and Terminal.
- Changing reaction-diffusion parameters changes the rendered pattern; presets load their named parameter values; run/pause/reset work.
- Whack-a-mole can be started and played for 30 seconds using pointer/touch or keyboard, and score resets for a new round.
- Reading Shelf entries show only a linked title.
- Existing terminal navigation still works, and the arcade command focuses/starts the game.
- The section contains no offline-assistant placeholder and makes no network request for either interaction.
- The refreshed local preview uses the existing page theme at desktop and mobile widths.
