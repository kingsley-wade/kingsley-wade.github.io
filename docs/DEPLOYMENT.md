# Deployment and Recovery

## Legacy recovery point

The site used the [`niklasbuschmann/contrast`](https://github.com/niklasbuschmann/contrast)
Jekyll theme before the Astro migration. The legacy files are preserved at the
annotated tag `legacy-jekyll-2024`, which points to commit
`1ff74d9e4df7f953e4ef0329a3a925d025229ca5`.

The Contrast source stored at that tag is released under the Unlicense. Its
original `UNLICENSE.txt` remains available from the tag even after the working
branch moves to the new MIT-licensed implementation.

Inspect the old site without changing branches:

```sh
git show legacy-jekyll-2024:_config.yml
git ls-tree --name-only legacy-jekyll-2024
```

Create a local recovery branch:

```sh
git switch -c recovery/legacy-jekyll legacy-jekyll-2024
```

Restore the published `master` branch only when a full rollback is required:

```sh
git switch master
git revert <astro-migration-commit>
git push origin master
```

Prefer a revert commit after deployment so the public branch keeps its audit
history. The recovery tag is the source of truth for the exact pre-migration
tree.

## GitHub Pages deployment

The personal site keeps the existing root URL at
`https://kingsley-wade.github.io/`. Pushes to `master` run
`.github/workflows/deploy-pages.yml`; pull request builds validate without
publishing. The workflow uploads only `dist/` and publishes it with GitHub's
Pages deployment action.

Local setup and preview:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm test
pnpm build
pnpm preview
```

Validate the three supported output forms locally:

```sh
PUBLIC_SITE_URL=https://kingsley-wade.github.io BASE_URL=/ pnpm build
pnpm check:build
PUBLIC_SITE_URL=https://example.github.io BASE_URL=/personal-homepage/ pnpm build
BASE_URL=/personal-homepage/ pnpm check:build
PUBLIC_SITE_URL=https://example.com BASE_URL=/ pnpm build
pnpm check:build
```

The root path is for this user/organization Pages site and a custom VPS domain.
The project subpath is for a repository site such as
`https://example.github.io/personal-homepage/`. Set `PUBLIC_COMMIT_SHA` in CI;
the API reports `local` for an unlabelled development build.

### Enable Pages Actions

After the workflow has been merged into `master`, open repository
**Settings → Pages → Build and deployment**, choose **GitHub Actions** as the
source, and keep the existing repository URL. GitHub Pages serves the most
recent successful workflow artifact. Check the Actions run before diagnosing a
stale page; once green, inspect `/api/v1/content.json` and compare its
`revision` with the workflow commit SHA.

There is no guarantee of an instantaneous update. Record the workflow finish
time and the first public API revision when measuring propagation.

### VPS migration

The static output has no Astro runtime dependency. Build with `BASE_URL=/`,
copy the contents of `dist/` to the web root, and serve `index.html` for `/`.
For Nginx, a minimal root-site location is:

```nginx
server {
    listen 80;
    server_name example.com;
    root /srv/www/personal-homepage;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

For Caddy, point a site block at that directory with `root *
/srv/www/personal-homepage` and `file_server`. If the site is mounted below a
path, build with the matching `BASE_URL` and configure that prefix in the
reverse proxy. The optional assistant gateway stays separate; static hosting
must not receive its secrets.
