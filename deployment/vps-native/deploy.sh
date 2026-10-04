#!/usr/bin/env bash
# Build every app from source and restart its service.
# Replaces `docker compose up -d --build`. Run as root on the VPS:
#   bash /opt/pmc-mono-repo1/deployment/vps-native/deploy.sh
set -euo pipefail

REPO="${REPO:-/opt/pmc-mono-repo1}"
WEBROOT="${WEBROOT:-/var/www/pmc}"
APP_USER="${APP_USER:-pmc}"

cd "$REPO"

echo "==> Installing workspace dependencies"
# Installs every workspace. apps/server's postinstall runs `prisma generate`,
# which emits the client into apps/server/src/generated/prisma.
# --frozen-lockfile: install exactly what pnpm-lock.yaml pins, and fail loudly
# if it is missing or out of date instead of silently resolving newer versions
# (that is how a zod v3/v4 mix once broke the portal build). Upload/pull the
# lockfile along with the code.
pnpm install --frozen-lockfile

echo "==> Building server (Bun bundle -> apps/server/dist)"
pnpm --filter @pmc/server run build:server

echo "==> Building landing page (Next.js standalone)"
pnpm --filter @pmc/landing-page run build

echo "==> Building portal (Vite -> apps/portal/dist)"
# NOTE: portal bakes VITE_PUBLIC_* values in at BUILD time. If you changed any
# VITE_ var in .env you must re-run this script for it to take effect.
set -a; . "$REPO/.env"; set +a
pnpm --filter @pmc/portal run build

echo "==> Building academy course app (Vite -> apps/academy/dist)"
# VITE_API_URL is deliberately NOT set: src/config/api.js then falls back to the
# relative '/academy-api' prefix that nginx proxies, which is what we want in prod.
# Setting it would hard-code an origin into the bundle at build time.
# The portal step above sourced $REPO/.env into the environment; clear this one
# var so a stray entry there can't override the relative default.
env -u VITE_API_URL pnpm --filter @pmc/academy run build

echo "==> Installing academy backend dependencies"
# apps/academy/server is a plain npm project and is NOT matched by the `apps/*`
# workspace glob, so the root pnpm install above skips it entirely. It runs from
# source (no build step) under pmc-academy.service.
npm --prefix "$REPO/apps/academy/server" ci --omit=dev
# Uploaded course PDFs live here and the directory is gitignored, so a fresh
# checkout has none. pmc-academy.service lists it in ReadWritePaths and systemd
# refuses to start the unit if the path does not exist.
mkdir -p "$REPO/apps/academy/server/uploads"

echo "==> Assembling Next.js standalone tree"
# `output: 'standalone'` deliberately omits static assets and public/ — they have
# to be copied in beside the server bundle or every page renders unstyled.
STANDALONE="$REPO/apps/landing-page/.next/standalone/apps/landing-page"
rm -rf "$STANDALONE/.next/static" "$STANDALONE/public"
mkdir -p "$STANDALONE/.next"
cp -r "$REPO/apps/landing-page/.next/static" "$STANDALONE/.next/static"
cp -r "$REPO/apps/landing-page/public"       "$STANDALONE/public"

echo "==> Publishing portal build to $WEBROOT/portal"
# Directory name must stay 'portal' so it matches the /portal URL prefix that
# nginx serves with a plain `root` (see nginx-pmc.conf).
mkdir -p "$WEBROOT"
rm -rf "$WEBROOT/portal"
cp -r "$REPO/apps/portal/dist" "$WEBROOT/portal"

echo "==> Publishing academy build to $WEBROOT/academy-app"
# Same rule as portal: the directory name must match the URL prefix nginx serves.
rm -rf "$WEBROOT/academy-app"
cp -r "$REPO/apps/academy/dist" "$WEBROOT/academy-app"
chown -R www-data:www-data "$WEBROOT"

echo "==> Fixing ownership"
chown -R "$APP_USER:$APP_USER" "$REPO"

echo "==> Restarting services"
systemctl restart pmc-server pmc-landing pmc-academy
systemctl reload nginx

echo "==> Status"
systemctl --no-pager --lines=0 status pmc-server pmc-landing pmc-academy | grep -E 'Active:|●' || true
echo "Done. If apps/server/prisma/schema.prisma changed, also run:"
echo "  cd $REPO && pnpm --filter @pmc/server run db:push"
