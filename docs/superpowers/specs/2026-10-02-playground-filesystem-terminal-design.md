# Playground Filesystem Terminal

## Goal

Make the playground terminal easier to discover and use by giving it a bounded filesystem model for navigating the site's public sections. The terminal remains local and inert: it only changes the current UI route and triggers existing, explicitly supported interactions.

## User experience

- The initial prompt is `guest@local:/$`.
- `ls` lists every public section from the section registry. The active section is marked with `*`.
- `cd <section>` changes the current path and navigates to that section. `cd ..` returns to `/`.
- `pwd` prints the current path.
- `open <section>` is a discoverable alias for `cd <section>`.
- `tree` prints the root and its public section directories, along with each section's declared terminal commands.
- `help` groups commands into Navigation, Interactions, and Utilities.
- Existing commands (`about`, `books`, `guitar`, `fitness`, `music`, `clear`) continue to work.
- Section ids, normalized labels, and optional manifest aliases may be used as paths.
- Unknown paths print available path names and do not change route state.
- Arrow-up/down history remains bounded. Tab completes command names and section paths when there is one unambiguous match.
- The prompt and output remain readable on narrow screens; long directory output may scroll horizontally without changing input dimensions.

## Architecture

### Command model

Replace exact-string parsing with a pure parser that returns a command id and argument list. Parsing still normalizes whitespace and casing, rejects overlong input, and keeps all output inert text.

### Filesystem state

Add a small pure state module that models `/` and `/section-id`, resolves section aliases, and returns deterministic effects for `ls`, `cd`, `pwd`, `open`, and `tree`. It receives the public `SectionManifest[]` so newly registered sections appear automatically.

### Registry integration

Extend `SectionManifest` with optional `terminalAliases?: string[]`. Validate aliases as unique, lower-case path-safe tokens. The terminal builds its directory map from the existing section registry; no second list of sections is maintained.

### Browser integration

`PlaygroundTerminal.astro` owns the terminal session state and delegates parsing/effects to pure modules. Navigation effects click the existing section link, preserving the section router's history, focus, title, and audio behavior. A `terminal:section` event is unnecessary because the active route can be read from the URL and synchronized after navigation.

## Error handling

- Empty input is ignored.
- Unknown command: `command not found: <name>. type help`.
- Missing argument: show the command's usage line.
- Unknown path: show `path not found: <path>` followed by available directories.
- Ambiguous completion leaves the input unchanged and prints candidates only when the user requests completion.
- No command executes a network request or arbitrary browser API.

## Verification

- Unit tests cover command parsing with arguments, path resolution, `ls`, `cd`, `cd ..`, `pwd`, `tree`, aliases, unknown paths, and bounded effects.
- Existing terminal interaction tests continue to cover audio, reading, fitness, and clear behavior.
- An end-to-end test runs `ls`, navigates with `cd research`, checks `pwd`, returns with `cd ..`, and verifies a custom section alias.
- `astro check`, unit tests, and the relevant Playwright suite must pass.

## Scope boundaries

The terminal does not read or write a real filesystem, fetch remote data, run shell commands, or add arbitrary user-defined scripts. “Custom commands” means manifest-declared aliases and bounded command effects inside the site.
