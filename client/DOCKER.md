# Portal frontend (Next.js) in Docker

Self-contained. Run everything from **this** directory — it makes no assumption
about where the backend or the Flask service live on disk.

```bash
docker compose build          # ~3-6 min
docker compose up -d
```

Then <http://localhost:3000>. Image is ~447 MB.

## The one rule that will bite you

**`NEXT_PUBLIC_*` is compiled into the browser bundle at BUILD time.** There are
~398 references to `NEXT_PUBLIC_BACKEND_URL` and ~57 to
`NEXT_PUBLIC_API_BASE_URL` across `src/`. Therefore:

* They must be URLs the **user's browser** can reach. Never a Docker service
  name, never `host.docker.internal`.
* Changing one requires `docker compose build` — a restart does nothing.
* Setting them under `environment:` in compose has **no effect whatsoever**.
* The image is bound to one environment. Promoting staging → prod is a rebuild,
  not a re-tag.

This container talks to nothing over a Docker network, and that is correct, not
an oversight: every backend and Flask call this app makes happens in the
browser. There are no Next.js route handlers and no server components fetching
the API — the two files that looked server-side (`inventoryApi.js`,
`lib/custadd/utils.js`) both use `sessionStorage` and are imported by client
pages.

## Configuration

`.env` in this directory, read by compose for the build args.

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5555     # Node API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080    # Flask / face service
NEXT_PUBLIC_URL_ext=https://kioteldashboard.kiotel.co/
NEXT_PUBLIC_EXTERNAL_API_TOKEN=...
CLIENT_PORT=3000
```

For production:

```
NEXT_PUBLIC_BACKEND_URL=https://apis.kiotel.co
NEXT_PUBLIC_API_BASE_URL=https://portal.kiotel.co
```

Keep `KEY=value` with no spaces around the `=` — compose's parser is stricter
than dotenv's. Two lines here had to be normalised for that reason.

`.dockerignore` excludes `.env` from the build context; values arrive as build
args instead.

## Changes made for containerisation

* **`output: 'standalone'` added to `next.config.mjs`.** This emits
  `.next/standalone` — a self-contained `server.js` plus only the traced
  `node_modules`. Without it the runtime image would have to carry all ~981 MB
  of `node_modules` rather than ~447 MB total.
* **`npm ci --legacy-peer-deps`** in the Dockerfile. `@tiptap/react@3.26` peers
  `@types/react-dom`, which npm resolves to v19, which peers `@types/react@^19`
  against the `@types/react@18.3.3` the MUI packages pin — so a plain `npm ci`
  fails outright. This is a pre-existing conflict in `package.json`, not
  something Docker introduced: the working local `node_modules` has no
  `@types/react-dom` at all, i.e. it was installed the same way. Safe here
  because the project is plain JavaScript — 0 `.ts`/`.tsx` files,
  `jsconfig.json` rather than `tsconfig.json` — so `@types/*` never reaches the
  build output.
* **`.dockerignore` added.** Without it the build context was ~2.6 GB: a stale
  `.next` (1.6 GB) plus `node_modules` (981 MB), both regenerated in the image
  anyway.
* **`TZ=Asia/Kolkata`** so date rendering matches the rest of the stack.

## Notes

* `public/models` holds the face-api.js model shards for the kiosk page. They
  are static assets and are copied into the image as-is.
* The build stage runs with `NODE_OPTIONS=--max-old-space-size=4096`; Univer is
  heavy and a default heap dies as a generic "next build failed".
* The container runs as the non-root `node` user on port 3000.

## Troubleshooting

```bash
docker compose logs -f portal-client
docker compose build --no-cache
```

Pages load but every API call 404s or is refused → a `NEXT_PUBLIC_*` value is
wrong **in the image**, not in the environment. Fix `.env`, then rebuild.

CORS errors from the API → add this origin to `CORS_ORIGINS` in the backend's
`.env` and restart the backend.
