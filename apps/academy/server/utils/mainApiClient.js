// Thin proxy client to apps/server (pmc-mono-repo's own Bun/Hono API), whose
// database now holds the real academy course/enrollment/material/purchase/
// quiz data (see scripts/migrate-to-main-db.js). This app's own MONGO_URI is
// left pointed at a now-empty database on purpose — none of this data must
// ever be readable/writable there again, so a restart of this process can
// never again silently start a second, disconnected copy of it.
//
// materials.js/quiz.js/course.js now proxy fully, and payment.js raises a
// real Razorpay order via apps/server's purchases.service.ts (replacing the
// old trust-based "I've Paid" static-QR confirm) — see routes/payment.js.

const MAIN_API_BASE_URL = process.env.MAIN_API_BASE_URL || 'http://127.0.0.1:4000';

/**
 * Builds the identity header for a proxied request from this app's own
 * `req.identity` (`user:<oldMongoId>` from a verified JWT, or
 * `guest:<uuid>`) — see middleware/identity.js. `user:` becomes
 * `X-Legacy-Academy-Id` so apps/server resolves it to the exact
 * `legacy:<id>` string the migration already stored data under; `guest:` is
 * forwarded as `X-Guest-Id` unchanged, since that format was never migrated
 * (guests were never namespaced by app).
 */
function identityHeaders(identity) {
  if (!identity) return {};
  if (identity.startsWith('user:')) return { 'X-Legacy-Academy-Id': identity.slice('user:'.length) };
  if (identity.startsWith('guest:')) return { 'X-Guest-Id': identity.slice('guest:'.length) };
  return {};
}

async function callMainApi(path, { method = 'GET', identity, body } = {}) {
  const res = await fetch(`${MAIN_API_BASE_URL}/server/academy${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...identityHeaders(identity),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

// For file responses (material download, certificate PDF) — apps/server
// streams these as a raw body, not JSON, so the caller pipes the buffer
// straight through to its own response instead of parsing it.
async function callMainApiFile(path, { identity } = {}) {
  const res = await fetch(`${MAIN_API_BASE_URL}/server/academy${path}`, {
    headers: identityHeaders(identity),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { ok: false, status: res.status, data };
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  return {
    ok: true,
    status: res.status,
    buffer,
    contentType: res.headers.get('content-type'),
    contentDisposition: res.headers.get('content-disposition'),
  };
}

module.exports = { callMainApi, callMainApiFile, identityHeaders, MAIN_API_BASE_URL };
