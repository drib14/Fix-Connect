const { ZodError } = require('zod');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Zod Validation Errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
    return res.status(400).json({ message: 'Validation Error', errors });
  }

  // Handle known application errors based on message
  if (err.message === 'Email already in use') {
    return res.status(409).json({ message: err.message });
  }
  
  if (err.message === 'Invalid email or password' || err.message === 'Incorrect old password') {
    return res.status(401).json({ message: err.message });
  }

  if (err.message === 'Invalid refresh token' || err.message === 'Invalid or expired refresh token' || err.message === 'Invalid or expired reset token') {
    return res.status(401).json({ message: err.message });
  }

  if (err.message === 'User not found') {
    return res.status(404).json({ message: err.message });
  }

  // Default server error
  res.status(500).json({ message: 'Internal server error' });
};

module.exports = errorHandler;
