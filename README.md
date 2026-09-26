# jcastillo-portfolio

Portfolio site for Jose Castillo — https://josecastillocorcuera.com

## Architecture

```
browser ──> nginx (reverse proxy, on the server)
              ├── astro/   Astro SSR site (Svelte + Tailwind), node adapter, port 3333
              │              └── fetches content from ──┐
              └── api/     Directus CMS  <──────────────┘
                             ├── MariaDB   (all content: projects, text, image metadata)
                             ├── Redis     (API cache)
                             └── S3        (uploaded files: photos, covers, audio)
```

- Content lives in the Directus database, not in this repo. Adding or editing work happens in the Directus admin UI.
- Videos are YouTube/Vimeo embeds (`astro/src/components/Video.astro`), not stored files.
- S3 is also the target for nightly DB backups (`api/docker-compose.backup.yaml`); restores use `api/docker-compose.restore.yaml`.
- Production runs as Docker Compose stacks on a server with an external `nginx` Docker network. Both `api/docker-compose.yaml` and `astro/docker-compose.yaml` expect that network to exist.

### Vercel (in progress)

The Astro site also deploys to the Vercel project `jcastillo-portfolio` (from the `astro/` folder). On Vercel (`VERCEL=1` at build time) every page is prerendered to static HTML, with content fetched from Directus during the build — so a content change in Directus needs a redeploy to show up there. Everywhere else the site still runs as a Node SSR server, so the Docker deploy is unchanged. See `astro/astro.config.mjs`.

## Environment variables

`astro/.env` (see `astro/.env.example`). All `PUBLIC_*` values are exposed to the browser and baked in at build time — never put secrets here.

| Variable | Used in | Purpose |
| --- | --- | --- |
| `PROJECT_NAME` | compose files | Container/image name prefix |
| `PUBLIC_DIRECTUS_URL` | `src/lib/api/getClient.ts` | Directus SDK base URL |
| `PUBLIC_API_URL` | `src/components/PublicationCarousel.svelte` | Direct API requests |
| `PUBLIC_ASSET_URL` | `src/lib/constants.ts` | Base URL for images/files |
| `PUBLIC_FA_SCRIPT` | `src/layouts/Layout.astro` | Font Awesome kit script |

`api/.env` (see `api/.env.example`) holds real secrets: Directus key/secret and admin login, DB passwords, S3 keys. It is gitignored and only exists on the server.

## Local development

Requirements: Docker Desktop (or OrbStack).

There is no local Directus — local dev points at the live API. To get the `PUBLIC_*` values, open the live site's devtools → Network tab.

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
