# Deploying to the Hostinger VPS

Target: `srv1909662.hstgr.cloud` (200.234.38.202), Ubuntu 24.04, Docker already installed.

This uses `docker-compose.prod.yml` in this directory: Traefik (reverse proxy + free
TLS via Let's Encrypt) in front of three app containers, plus self-hosted MongoDB
and MinIO. Everything below runs **on the VPS**, over SSH — paste it into the
Hostinger Web console or `ssh root@200.234.38.202`.

## 0. Before you start

These changes (the compose files, and small code edits enabling self-hosted
MinIO) exist only in this local working copy so far. Commit and push them —
to `adesh-Update` or wherever you want the VPS to pull from — before step 2,
otherwise `git pull` on the VPS won't have them. I haven't committed/pushed
anything myself; say the word if you'd like me to.

## 1. First-time VPS setup

```bash
# Confirm Docker + Compose plugin are present (should already be true)
docker --version
docker compose version

# Basic firewall: only SSH, HTTP, HTTPS reach the internet
apt-get update && apt-get install -y ufw git
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

## 2. Get the code

```bash
mkdir -p /opt/pmc && cd /opt/pmc
git clone https://github.com/prodioslabs/pmc-mono-repo.git .
git checkout adesh-Update   # or main, once merged
```

If the repo is private, cloning over HTTPS will prompt for credentials — use a
GitHub personal access token as the password, or switch the remote to an SSH
URL with a deploy key added to the repo.

## 3. Configure environment

```bash
cp deployment/env.prod.example .env
nano .env
```

Fill in every blank. For the generated secrets, run these and paste the output in:

```bash
openssl rand -hex 16   # -> MINIO_ROOT_USER
openssl rand -hex 16   # -> MINIO_ROOT_PASSWORD
openssl rand -hex 32   # -> BETTER_AUTH_SECRET
openssl rand -hex 32   # -> JWT_SECRET
openssl rand -hex 32   # -> PAYLOAD_SECRET
```

`MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD` must be **copied verbatim** into
`S3_ACCESS_KEY`/`S3_SECRET_KEY` and `PAYLOAD_BUCKET_ACCESS_KEY`/`PAYLOAD_BUCKET_SECRET_KEY`
too — a plain `.env` file can't reference its own other values. Everything
else (Razorpay, Zoho, WhatsApp, Google, OneSignal, SMS, Browserless) is your
existing third-party credentials — carry them over from wherever this app is
currently configured (AWS/SST env, or wherever those were issued).

**Razorpay note:** `apps/server/.env` and `apps/landing-page/.env` (local dev)
use *different* Razorpay accounts. Put server/portal's pair in
`SERVER_RAZORPAY_KEY_ID`/`SERVER_RAZORPAY_KEY_SECRET` and landing-page's pair
in `LANDING_RAZORPAY_KEY_ID`/`LANDING_RAZORPAY_KEY_SECRET` — docker-compose.prod.yml
maps each back to the plain `RAZORPAY_KEY_ID`/`SECRET` the app code expects,
scoped per-service, so they don't clobber each other in the shared `.env`.
`NEXT_PUBLIC_RAZORPAY_KEY_ID` should match the landing-page pair;
`VITE_PUBLIC_RAZORPAY_KEY_ID` (portal) should match the server pair.

## 4. Bring up the data layer first

```bash
cd deployment
docker compose --env-file ../.env -f docker-compose.prod.yml up -d mongo mongo-init minio minio-init
docker compose --env-file ../.env -f docker-compose.prod.yml logs -f mongo-init minio-init
```

Wait for both to print "already initiated"/"buckets ready" and exit `0`
(`docker compose ps` shows them `Exited (0)`), then push the Prisma schema
into the now-live replica set:

```bash
docker compose --env-file ../.env -f docker-compose.prod.yml run --rm server-migrate
```

## 5. Build and start everything

```bash
docker compose --env-file ../.env -f docker-compose.prod.yml up -d --build
docker compose --env-file ../.env -f docker-compose.prod.yml ps
```

First build will take a few minutes (Next.js + Prisma + Vite all compiling).
Traefik requests the Let's Encrypt cert on first request to the domain — give
it a minute after containers report healthy, then check:

```bash
docker compose --env-file ../.env -f docker-compose.prod.yml logs -f traefik
```

## 6. Verify

- `https://srv1909662.hstgr.cloud/` → landing page
- `https://srv1909662.hstgr.cloud/portal` → portal SPA
- `https://srv1909662.hstgr.cloud/server` → `{"message":"Hello World"}`
- Payload admin: `https://srv1909662.hstgr.cloud/admin`

If a cert doesn't issue: confirm DNS (`nslookup srv1909662.hstgr.cloud` should
already resolve to `200.234.38.202` — it does, Hostinger sets this up
automatically for its temporary hostnames) and that ports 80/443 are reachable
from the internet (`ufw status`, and check Hostinger's own VPS firewall panel
too if one exists there separately from `ufw`).

## Redeploying after changes

```bash
cd /opt/pmc
git pull
cd deployment
docker compose --env-file ../.env -f docker-compose.prod.yml up -d --build
```

Add `run --rm server-migrate` again first if `apps/server/prisma/schema.prisma` changed.

## Backups

Nothing backs these up automatically yet. At minimum, cron a periodic:

```bash
docker compose --env-file ../.env -f docker-compose.prod.yml exec -T mongo \
  mongodump --archive --gzip > /root/backups/mongo-$(date +%F).gz
```

and copy the `mongo_data`/`minio_data` volumes (or the gzip dumps) off the
VPS regularly (e.g. `rclone`/`scp` to another machine or object store) — a
single-VPS setup has no redundancy if the disk fails.

## Notes / tradeoffs made here

- **Mongo has no auth**, relying entirely on it not being reachable outside
  the Docker network (`ufw` + no published port) as the security boundary.
  Fine for a single-tenant VPS; add `--auth` + a keyfile later if you want
  defense in depth.
- **MinIO console isn't exposed.** Reach it via `ssh -L 9001:localhost:9001 root@200.234.38.202`
  then `http://localhost:9001` locally, or add a Traefik router for it later.
- This setup runs independently of the existing AWS/SST deployment — nothing
  here touches that stack or its DNS.
