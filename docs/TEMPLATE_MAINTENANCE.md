# Template Maintenance

The reusable project is derived from this repository, but its published
snapshot must contain neutral identity, content, media, and deployment values.
Never publish a copy of the personal source tree directly.

## Build and inspect a snapshot

From the personal project root:

```sh
pnpm template:build
pnpm template:check
pnpm --dir template-dist install --frozen-lockfile
pnpm --dir template-dist check
pnpm --dir template-dist test
pnpm --dir template-dist build
```

The snapshot is generated into ignored `template-dist/`. It replaces identity
and content from `template-seed/`, swaps the portrait for a generic pixel
placeholder, removes owner-specific docs/tests/specs and excludes ignored CV and
photo inputs. Do not manually patch generated output; make the change in the
source project or seed and regenerate it.

Before publishing, run `pnpm template:check`, inspect the snapshot diff, and
verify that the generated content is generic. Add newly forbidden private
identifiers to `scripts/verify-template-boundary.mjs` and its injected tests.
The scan checks text in source and bundled files, plus mock publication markers
under the public content tree.

## Version and synchronize changes

The personal site and template have separate histories. Record the source
commit and template commit in `TEMPLATE_UPSTREAM.md` after the standalone
repository exists. For each update, regenerate the snapshot, inspect the
privacy report, test it in a disposable directory, then publish a tagged
template release. Keep user-specific content in the personal repository; only
general components, schemas, docs, and approved redistributable assets flow
back to the template.

To incorporate an upstream template update into the personal site, compare the
tagged template change with the local commit history and selectively merge
general changes. Do not replace personal config/content wholesale. Resolve the
comparison before updating the recorded template version.
