const requireAuth = (req, res, next) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ message: 'Unauthorized. Sign in required.' });
  }
  next();
};

const optionalAuth = (req, res, next) => {
  next();
};

module.exports = { requireAuth, optionalAuth };
