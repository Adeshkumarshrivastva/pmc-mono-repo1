const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'pmc_secret_key_2025';

// The Online Course purchase/quiz/certificate flow needs no login — anyone
// can browse and pay. We still recognise logged-in users (via JWT) so their
// purchase follows them across devices, but visitors without an account get
// an `identity` built from a per-browser guest id instead.
//
// req.identity ends up as either `user:<mongoId>` or `guest:<uuid>`.

function identityFromToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return `user:${decoded.id}`;
  } catch {
    return null;
  }
}

// For JSON requests (POST bodies, normal fetch calls) — reads the JWT from
// the Authorization header and/or a guest id from the X-Guest-Id header.
function resolveIdentity(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  const fromToken = token ? identityFromToken(token) : null;
  const guestId = req.headers['x-guest-id'];

  req.identity = fromToken || (guestId ? `guest:${guestId}` : null);
  if (!req.identity) return res.status(400).json({ message: 'Missing identity — please refresh the page and try again.' });
  next();
}

// For <iframe>/<a href> file requests, which can only pass query params —
// accepts ?token=<jwt> or ?guest=<uuid>.
function resolveIdentityFromQuery(req, res, next) {
  const token = req.query.token;
  const fromToken = token ? identityFromToken(token) : null;
  const guestId = req.query.guest;

  req.identity = fromToken || (guestId ? `guest:${guestId}` : null);
  if (!req.identity) return res.status(400).json({ message: 'Missing identity — please refresh the page and try again.' });
  next();
}

module.exports = { resolveIdentity, resolveIdentityFromQuery };
