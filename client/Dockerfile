# syntax=docker/dockerfile:1

# Next.js 14 portal frontend.
#
# IMPORTANT -- NEXT_PUBLIC_* is inlined into the client bundle at BUILD time,
# not read at runtime. There are ~398 references to NEXT_PUBLIC_BACKEND_URL and
# ~57 to NEXT_PUBLIC_API_BASE_URL across src/. That means this image is bound to
# one environment: to point it at staging or prod you rebuild with different
# build args, you cannot just restart it with a different env. Setting these as
# runtime `environment:` in compose has NO effect on the browser bundle.

FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# devDependencies are required here -- tailwind/postcss/eslint-config-next all
# run during `next build`.
#
# --legacy-peer-deps is required, and is safe. @tiptap/react@3.26 declares a
# peer on @types/react-dom, which npm resolves to v19, which in turn peers
# @types/react@^19 against the @types/react@18.3.3 the MUI packages pin. That is
# a pre-existing conflict in package.json, not something containerisation
# introduced -- the working local node_modules has no @types/react-dom at all,
# i.e. it was installed this same way. The project is plain JavaScript (0 .ts /
# .tsx files, jsconfig.json rather than tsconfig.json), so @types/* packages are
# type-only and have no effect on the build output or runtime.
#
# The BuildKit cache mount keeps npm's download cache (~1 GB of tarballs here)
# on the build host, so a lockfile change only re-downloads what changed. It is
# never written into a layer.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --no-audit --no-fund

FROM node:24-slim AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_EXTERNAL_API_TOKEN
ARG NEXT_PUBLIC_URL_ext
# NODE_OPTIONS: Univer is heavy; give the build headroom rather than dying on
# an OOM that reads as a generic "next build failed".
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL} \
    NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL} \
    NEXT_PUBLIC_EXTERNAL_API_TOKEN=${NEXT_PUBLIC_EXTERNAL_API_TOKEN} \
    NEXT_PUBLIC_URL_ext=${NEXT_PUBLIC_URL_ext} \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    NODE_OPTIONS=--max-old-space-size=4096

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Persist Next's incremental build cache (webpack + SWC) across image builds.
# Without it every `docker compose build` compiles the whole app from zero;
# with it, a small source change rebuilds noticeably faster. The cache lives on
# the build host only and never reaches the runtime image.
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

FROM node:24-slim AS runtime
ENV NODE_ENV=production \
    TZ=Asia/Kolkata \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

# No apt layer. tzdata/curl/ca-certificates used to be installed here; none is
# needed. Node ships full ICU with its own zone data (TZ=Asia/Kolkata resolves
# without /usr/share/zoneinfo), uses its own bundled CA store, and the
# HEALTHCHECK below uses Node's built-in fetch instead of curl. This saves an
# `apt-get update` on every build, some image size, and curl's CVE surface.

WORKDIR /app
# public/ holds the face-api.js model shards used by the kiosk page.
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+process.env.PORT+'/',{redirect:'manual'}).then(r=>process.exit(r.status<400?0:1),()=>process.exit(1))"]

# server.js is emitted by output:'standalone'; it already binds HOSTNAME/PORT.
CMD ["node", "server.js"]
