# Module Development

The section registry discovers `src/modules/*/manifest.ts` at build time. A
manifest supplies the navigation label, order, content collection, renderer,
visibility, optional audio scale, and whitelisted terminal commands.

## Add a content section

1. Add a new Astro content collection in `src/content.config.ts` and its schema
   in `src/lib/content/schemas.ts` if the section needs a distinct data shape.
2. Add a manifest under `src/modules/<id>/manifest.ts`:

   ```ts
   import { defineSection } from "../../core/section-contract";

   export default defineSection({
     id: "now",
     label: "Now",
     order: 7,
     kind: "content",
     contentCollection: "now",
     renderer: "default",
     audioScale: "c-major",
     visibility: "public",
   });
   ```

3. Add validated Markdown or YAML entries for the collection. Give every entry
   a stable ID, a visibility value, and an update date.
4. Run `pnpm check`, `pnpm test`, and `pnpm build`. The registry supplies the
   menu, hash route, static section and public JSON entry from the manifest.

Ordinary sections do not require edits to `AppShell.astro`, `TerminalMenu.astro`
or the router. The registry rejects duplicate IDs/orders, invalid renderers,
unknown scales and commands, and content sections without a collection.

## Add a custom renderer

Use a custom renderer only when the normal content entry layout cannot express
the interaction. Add its ID to `rendererIds` in
`src/core/section-contract.ts`, then handle it in `src/components/AppShell.astro`
or a focused component. Keep content and browser state in the module boundary;
do not place personal data in a client script. Add unit and browser coverage for
the new behavior, including keyboard and reduced-motion behavior.

## Extend terminal commands

Add a command ID to `terminalCommandIds`, implement its explicit case in
`src/lib/terminal/commands.ts`, and list it in the owning manifest. Commands
return text and approved local actions only. They must never evaluate shell
input, HTML, or arbitrary JavaScript.

## Assign audio scales

Choose an existing `audioScale` ID from `src/lib/audio/scales.ts` in the
manifest. A section change emits `section:changed`; the shared guitar engine
selects a bounded random note from that scale. Add deterministic engine tests
if introducing another scale. The global mute state must apply to every note.
