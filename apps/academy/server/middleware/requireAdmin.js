// Use after authMiddleware — rejects anyone whose JWT role isn't 'admin'.
// Upload etc. must never be reachable by a plain logged-in user's token,
// so this checks the token payload, not a fresh DB lookup (role is baked
// into the JWT at login time, same as name/email there).
module.exports = function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
