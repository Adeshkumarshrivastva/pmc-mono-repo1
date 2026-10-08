// Thin proxy client to apps/server (pmc-mono-repo's own Bun/Hono API), whose
// database now holds the real academy course/enrollment data (see
// scripts/migrate-to-main-db.js). This app's own MONGO_URI is left pointed at
// a now-empty database on purpose — courses/enrollments must stop being
// readable/writable there so a restart of this process can never again
// silently start a second, disconnected copy of this data.
//
// Only routes with no Purchase/QuizAttempt dependency (course catalog,
// enrollments) are proxied so far. materials.js/quiz.js/course.js/payment.js
// still use the local Mongoose Purchase/QuizAttempt models — proxying those
// needs a product decision first (apps/server replaced the old trust-based
// "I've Paid" flow with a real Razorpay order; moving materials/quiz over
// without moving payment too would desync "paid" state from what unlocks a
// quiz). Flagged to the user; not done here.

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

module.exports = { callMainApi, identityHeaders, MAIN_API_BASE_URL };
