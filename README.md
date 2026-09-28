# Manting Guo's Personal Homepage

An Astro-based personal homepage for GitHub Pages. The project is replacing
the legacy Jekyll theme on the `feat/astro-personal-homepage` migration branch.

## Local development

```sh
pnpm install
pnpm dev
```

The homepage is a static Astro project. Its six sections come from discovered
module manifests; GitHub Pages deploys the build output and the same `dist/`
directory can be served from a VPS.

## Guides

- [Content editing](docs/CONTENT_GUIDE.md)
- [Adding sections and interactions](docs/MODULE_DEVELOPMENT.md)
- [GitHub Pages and VPS deployment](docs/DEPLOYMENT.md)
- [Public content API and private assistant boundary](docs/ASSISTANT_INTEGRATION.md)
- [Reference design comparison](docs/REFERENCE_COMPARISON.md)

Run `pnpm check`, `pnpm test`, and `pnpm test:e2e --project=chromium` before
publishing. The implementation checklist and evidence are in
`specs/personal-homepage/tasks.md`.

## Local source material

The root photos and `cvfor_applied_math/` directory are private build inputs.
They are ignored by Git and must never be copied directly into `public/`.
Only reviewed text and optimized, metadata-free image derivatives may be
published.

## License

New site code is available under the [MIT License](LICENSE). Asset and legacy
theme notices are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
