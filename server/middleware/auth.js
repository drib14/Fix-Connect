const { getAuth } = require('@clerk/express');

const requireAuth = (req, res, next) => {
  const auth = getAuth(req);
  console.log('[requireAuth] Path:', req.path);
  console.log('[requireAuth] getAuth userId:', auth.userId);
  if (!auth.userId) {
    return res.status(401).json({ message: 'Unauthorized. Sign in required.' });
  }
  req.auth = auth;
  next();
};

const optionalAuth = (req, res, next) => {
  try {
    req.auth = getAuth(req);
  } catch (err) {
    req.auth = {};
  }
  next();
};

module.exports = { requireAuth, optionalAuth };
