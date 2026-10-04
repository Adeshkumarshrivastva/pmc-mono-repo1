# Deploying to the Hostinger VPS **without Docker**

Target: `srv1909662.hstgr.cloud` (200.234.38.202), Ubuntu 26.04 LTS, KVM 4 (4 vCPU / 16 GB).
Repo already uploaded to `/opt/pmc-mono-repo1`.

This replaces `deployment/docker-compose.prod.yml` with native services:

| Container (before) | Native equivalent (now) |
|---|---|
| `traefik` | nginx + certbot |
| `landing-page` | `pmc-landing.service` → `node server.js` on :3000 |
| `portal` | static files in `/var/www/pmc/portal`, served by nginx |
| `server` | `pmc-server.service` → `bun dist/index.js` on :4000 |
| `mongo` + `mongo-init` | `mongod.service`, replica set initiated by hand (step 3) |
| `minio` + `minio-init` | `minio.service`, buckets created by hand (step 4) |
| `server-migrate` | `pnpm --filter @pmc/server run db:push` |

Everything runs **on the VPS** as root unless stated.

---

## 1. Base packages, user, firewall

```bash
apt-get update
apt-get install -y curl wget gnupg git unzip nginx ufw

# Unprivileged account the two app services run as
useradd -r -m -d /home/pmc -s /usr/sbin/nologin pmc || true

ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp
ufw --force enable
```

Also open 80/443 in **Hostinger's own firewall panel** (Security → Firewall). It sits
outside `ufw`; a connection *timeout* rather than a refusal is the classic symptom of
packets being dropped there.

## 2. Runtimes: Node 24, Bun, pnpm

`apps/server` needs **both** Bun (it runs the bundle) and Node (the toolchain and the
landing page do).

```bash
# Node 24 — prefer Ubuntu's package if it is already 24.x
apt-cache policy nodejs
# If the candidate is older than 24, use NodeSource instead:
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt-get install -y nodejs
node --version   # expect v24.x

# pnpm, pinned by the repo's "packageManager": "pnpm@10.12.1"
corepack enable && corepack prepare pnpm@10.12.1 --activate
pnpm --version

# Bun — the installer drops it in ~/.bun; the systemd unit expects /usr/local/bin/bun
curl -fsSL https://bun.sh/install | bash
install -m 0755 ~/.bun/bin/bun /usr/local/bin/bun
bun --version
```

## 3. MongoDB (replica set — not optional)

Prisma's MongoDB connector **refuses to run against a standalone instance**, so a
single-node replica set is mandatory. This is the step Docker was doing silently
via `mongo-init`.

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc \
  | gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor

# NOTE: MongoDB's repo lags new Ubuntu releases — there is very likely no 26.04
# ("resolute") suite yet, so we deliberately point at noble (24.04). It works.
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" \
  > /etc/apt/sources.list.d/mongodb-org-8.0.list

apt-get update && apt-get install -y mongodb-org
```

Enable the replica set. Append to `/etc/mongod.conf`:

```yaml
replication:
  replSetName: rs0
```

Then:

```bash
systemctl enable --now mongod
systemctl restart mongod
mongosh --quiet --eval 'try { rs.status() } catch(e) { rs.initiate() }'
mongosh --quiet --eval 'rs.status().set'   # expect: rs0
```

`mongod` binds to 127.0.0.1 by default — leave it that way. Like the container, it runs
**without auth**, relying on not being reachable off-box as the security boundary.

## 4. MinIO + buckets

```bash
wget -q https://dl.min.io/server/minio/release/linux-amd64/minio -O /usr/local/bin/minio
wget -q https://dl.min.io/client/mc/release/linux-amd64/mc      -O /usr/local/bin/mc
chmod +x /usr/local/bin/minio /usr/local/bin/mc

groupadd -r minio-user || true
useradd -M -r -g minio-user minio-user || true
mkdir -p /var/lib/minio && chown minio-user:minio-user /var/lib/minio
```

Create `/etc/default/minio` with the same two values already in your `.env`
(`MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`):

```ini
MINIO_ROOT_USER=<paste from .env>
MINIO_ROOT_PASSWORD=<paste from .env>
```

```bash
chmod 600 /etc/default/minio
install -m 0644 /opt/pmc-mono-repo1/deployment/vps-native/minio.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now minio
```

Create the two buckets the apps expect (this is what `minio-init` did):

```bash
set -a; . /etc/default/minio; set +a
mc alias set local http://127.0.0.1:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"
mc mb -p local/payload-media
mc mb -p local/server-files
mc ls local
```

## 5. Fix `.env` — Docker hostnames must go

**This is the step that will silently break everything if skipped.** Your `.env` was
written for the Docker network, where `mongo` and `minio` resolved as service names.
There is no such DNS now. Edit `/opt/pmc-mono-repo1/.env`:

```diff
-DATABASE_URL=mongodb://mongo:27017/server?replicaSet=rs0
+DATABASE_URL=mongodb://127.0.0.1:27017/server?replicaSet=rs0

-PAYLOAD_DB_URL=mongodb://mongo:27017/payload?replicaSet=rs0
+PAYLOAD_DB_URL=mongodb://127.0.0.1:27017/payload?replicaSet=rs0

-S3_ENDPOINT=minio
+S3_ENDPOINT=127.0.0.1

-PAYLOAD_BUCKET_ENDPOINT=http://minio:9000
+PAYLOAD_BUCKET_ENDPOINT=http://127.0.0.1:9000
```

Everything else in `.env` stays as-is. Lock it down:

```bash
chown pmc:pmc /opt/pmc-mono-repo1/.env && chmod 600 /opt/pmc-mono-repo1/.env
```

## 6. Per-service env overrides

Two variables cannot live in the shared `.env`, because the two apps need
*different values for the same name*. `docker-compose.prod.yml` solved this with
per-container `environment:` blocks; systemd solves it with a second
`EnvironmentFile=` listed after the first (later files win).

```bash
mkdir -p /etc/pmc
```

`/etc/pmc/server.env` — API + portal's Razorpay account, and the port nginx proxies
`/server` to:

```ini
PORT=4000
RAZORPAY_KEY_ID=<paste SERVER_RAZORPAY_KEY_ID from .env>
RAZORPAY_KEY_SECRET=<paste SERVER_RAZORPAY_KEY_SECRET from .env>
```

`/etc/pmc/landing.env` — the landing page's separate Razorpay account, and its own port:

```ini
PORT=3000
RAZORPAY_KEY_ID=<paste LANDING_RAZORPAY_KEY_ID from .env>
RAZORPAY_KEY_SECRET=<paste LANDING_RAZORPAY_KEY_SECRET from .env>
```

`/etc/pmc/academy.env` — the academy course backend (`apps/academy/server`). This one
is a whole separate config rather than an override: the Express app reads its own
`MONGO_URI` and `JWT_SECRET` and does not read the shared `.env` at all. Copy the
values from the developer's `apps/academy/server/.env`, which is gitignored and so
never reaches the VPS through the checkout:

```ini
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pmc-ambassador?replicaSet=rs0
JWT_SECRET=<paste>
RAZORPAY_KEY_ID=<paste>
RAZORPAY_KEY_SECRET=<paste>
# Set to false once you are on live keys — it is what shows the
# "Skip Payment (Test Mode)" button, which bypasses the paywall entirely.
PAYMENT_TEST_MODE=false
SMS_API_BASE_URL=<paste>
SMS_UNAME=<paste>
SMS_PASS=<paste>
SMS_SENDER_ID=<paste>
```

```bash
chmod 600 /etc/pmc/*.env
```

> **Why `PORT` is in both files.** `.env` sets a single global `PORT=4000`, but both apps
> read `process.env.PORT` — `apps/server/src/index.ts` for `Bun.serve`, and the Next.js
> standalone server. Left alone, the landing page would also try to bind 4000 and one of
> the two would die on "address already in use". Setting `PORT` per service is the fix.
>
> **This same bug exists in the Docker setup.** Compose's `env_file` overrides the
> Dockerfile's `ENV PORT=3000`, so the landing-page container would bind 4000 while
> Traefik kept routing to 3000. Worth fixing there too if you ever go back.

## 7. Build

```bash
bash /opt/pmc-mono-repo1/deployment/vps-native/deploy.sh
```

First run takes several minutes (pnpm install + Prisma generate + Next build + Vite build).
16 GB of RAM is plenty of headroom.

Then push the Prisma schema into Mongo — the equivalent of `server-migrate`:

```bash
cd /opt/pmc-mono-repo1 && pnpm --filter @pmc/server run db:push
```

## 8. Install the services

```bash
cd /opt/pmc-mono-repo1/deployment/vps-native
install -m 0644 pmc-server.service pmc-landing.service pmc-academy.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now pmc-server pmc-landing pmc-academy
systemctl status pmc-server pmc-landing pmc-academy --no-pager
```

Logs, if either fails to come up:

```bash
journalctl -u pmc-server  -n 100 --no-pager
journalctl -u pmc-landing -n 100 --no-pager
journalctl -u pmc-academy -n 100 --no-pager
```

## 9. nginx + HTTPS

```bash
install -m 0644 /opt/pmc-mono-repo1/deployment/vps-native/nginx-pmc.conf \
  /etc/nginx/sites-available/pmc
ln -sf /etc/nginx/sites-available/pmc /etc/nginx/sites-enabled/pmc
rm -f /etc/nginx/sites-enabled/default   # its catch-all would shadow ours

nginx -t && systemctl reload nginx

# Free cert — this is what Traefik's certresolver did automatically.
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d srv1909662.hstgr.cloud --agree-tos -m adeshkumarshrivastva@gmail.com --redirect
systemctl status certbot.timer --no-pager   # auto-renewal
```

## 10. Verify

- `https://srv1909662.hstgr.cloud/` → landing page
- `https://srv1909662.hstgr.cloud/portal` → portal SPA
- `https://srv1909662.hstgr.cloud/server` → `{"message":"Hello World"}`
- `https://srv1909662.hstgr.cloud/admin` → Payload admin
- `https://srv1909662.hstgr.cloud/academy` → academy marketing page (CMS)
- `https://srv1909662.hstgr.cloud/academy-app` → academy course app (the header's
  **Academy** button goes here)
- `https://srv1909662.hstgr.cloud/academy-api/api/health` → `{"status":"ok",...}`

**Do not test against `http://200.234.38.202/`.** The certificate is issued for the
hostname, and browsers reject it on the bare IP. Use the hostname.

Quick local check before involving DNS or TLS:

```bash
curl -s localhost:3000 -o /dev/null -w 'landing %{http_code}\n'
curl -s localhost:4000/server -w '\nserver\n'
```

## Redeploying after a code change

```bash
cd /opt/pmc-mono-repo1
git pull                      # or re-upload over SFTP
bash deployment/vps-native/deploy.sh
```

Add `pnpm --filter @pmc/server run db:push` if `apps/server/prisma/schema.prisma` changed.

Note the portal bakes `VITE_PUBLIC_API_BASE_URL` and `VITE_PUBLIC_RAZORPAY_KEY_ID` in at
**build** time, so changing those in `.env` requires a full re-run of `deploy.sh`, not
just a service restart.

## Backups

Nothing is automatic. At minimum, cron a nightly dump into `/etc/cron.daily/pmc-backup`:

```sh
#!/bin/sh
mongodump --archive --gzip > /root/backups/mongo-$(date +%F).gz
tar czf /root/backups/minio-$(date +%F).tgz -C /var/lib/minio .
find /root/backups -type f -mtime +14 -delete
```

```bash
mkdir -p /root/backups && chmod +x /etc/cron.daily/pmc-backup
```

Copy those off the VPS regularly (`rclone`/`scp`) — a single box has no redundancy
if the disk fails.

## Known trade-offs

- **Mongo runs without auth**, same as the container did; 127.0.0.1 binding plus `ufw`
  is the entire security boundary. Add `--auth` + a keyfile for defence in depth.
- **MinIO console** is on 127.0.0.1:9001, not exposed. Reach it with
  `ssh -L 9001:localhost:9001 root@200.234.38.202`.
- **MongoDB 8.0 vs the container's 7.** Prisma supports both; noted only so the
  version difference isn't a surprise.
- **No process isolation.** All three apps share the box's Node/Bun/Mongo versions.
  Upgrading a runtime affects everything at once — the main thing Docker was buying you.
