# jcastillo-portfolio

Portfolio site for Jose Castillo — https://josecastillocorcuera.com

## Architecture

An Astro site (Svelte + Tailwind) whose content lives in this repo:

```
astro/
  src/data/*.json        page content (text, links, video IDs, image references)
  src/lib/content.ts     schemas that validate every data file at build time
  public/media/          images, served as /media/<file>
  src/pages/             one .astro file per page, reading from @lib/content
```

- Content was exported from the old Directus CMS with `astro/scripts/export-directus.mjs`. It is re-runnable while `api.josecastillocorcuera.com` is still up, but it overwrites `src/data/`.
- Videos are YouTube/Vimeo embeds (`src/components/Video.astro`). Video entries with `"draft": true` were drafts in Directus but were still shown on the live site, so they're kept.
- A bad reference fails the build: e.g. an image path that doesn't exist in `public/media`, a malformed URL, or a missing field.

### Editing content

1. Edit the JSON in `astro/src/data/` (add images to `astro/public/media/` and reference them as `/media/<file>`).
2. Check it locally (see below), then open a pull request. The Build check validates the data.

### Deploys

- **Vercel** (project `jcastillo-portfolio`, from `astro/`): builds with `VERCEL=1`, which prerenders every page to static HTML (`astro/astro.config.mjs`).
- **Legacy server** (Michael's Hetzner host, until cutover): Docker Compose stacks behind an external `nginx` network — `astro/docker-compose.yaml` runs the site as a Node SSR server; `api/` holds the old Directus + MariaDB + Redis stack, with uploads and DB backups in S3.

## Environment variables

`astro/.env` (see `astro/.env.example`):

| Variable | Used in | Purpose |
| --- | --- | --- |
| `PROJECT_NAME` | compose files | Container/image name prefix |
| `PUBLIC_FA_SCRIPT` | `src/layouts/Layout.astro` | Font Awesome kit script |

`api/.env` (see `api/.env.example`) holds the old Directus stack's secrets. It is gitignored and only exists on the legacy server.

## Local development

Requirements: Docker Desktop (or OrbStack).

```sh
cd astro
cp .env.example .env   # fill in the values
docker compose -f docker-compose.dev.local.yaml up --build
```

Open http://localhost:3456. The source folder is mounted into the container, so edits hot-reload.

The dev server log says `localhost:3333` — that's the port inside the container. Docker forwards it to 3456 on your Mac.

### Daily workflow

Run from `astro/`:

```sh
docker compose -f docker-compose.dev.local.yaml up -d            # start
docker compose -f docker-compose.dev.local.yaml logs -f          # watch output (Ctrl+C to exit)
docker compose -f docker-compose.dev.local.yaml down             # stop
docker compose -f docker-compose.dev.local.yaml up -d --build    # rebuild after package.json or Dockerfile.dev changes
```

Other useful commands:

```sh
docker ps                                                        # what's running
docker compose -f docker-compose.dev.local.yaml exec astro_dev sh   # shell inside the container
docker system df                                                 # disk used by Docker
docker system prune                                              # clean up stopped containers and unused images
```

Glossary: an **image** is a built snapshot of the app (from a Dockerfile); a **container** is a running copy of an image; a **mount** links a folder on your Mac into the container; **compose** files describe which containers to run and how.

Note: the container installs Linux `node_modules` into `astro/`. If you switch to running `npm run dev` directly on your Mac (Node 18, port 3333), delete `node_modules` first.

### Running the production image locally

```sh
cd astro
docker build -t jcastillo_astro .
docker run --rm -p 3333:3333 --env-file .env jcastillo_astro
```

Open http://localhost:3333. There is no `.dockerignore`, so `astro/.env` is copied into the image and its `PUBLIC_*` values are baked into the build.
