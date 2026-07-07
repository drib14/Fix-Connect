/**
 * Zod Request Validation Middleware
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Validate request body by default
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({
        message: 'Validation failed.',
        errors: formattedErrors,
      });
    }
    return res.status(400).json({ message: error.message });
  }
};

module.exports = validate;
