/**
2.  * Global Error Handling Middleware
3.  */
const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);

  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    status: 'error',
    statusCode: status,
    message,
    errors: err.errors || null,
  });
};

module.exports = errorHandler;
