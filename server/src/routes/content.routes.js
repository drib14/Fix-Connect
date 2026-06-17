const express = require('express');
const contentController = require('../controllers/content.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/user.model');

const router = express.Router();

// Optional authentication middleware to allow public access but detect if request is from an admin
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('fullName email role');
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Proceed as unauthenticated on error (e.g. token expired/invalid)
    next();
  }
};

// Terms routes
router.get('/terms', contentController.getTerms);
router.put('/terms', authenticate, authorize('ADMIN'), contentController.updateTerms);

// Privacy routes
router.get('/privacy', contentController.getPrivacy);
router.put('/privacy', authenticate, authorize('ADMIN'), contentController.updatePrivacy);

// Blog routes
router.get('/blogs', optionalAuthenticate, contentController.getBlogs);
router.get('/blogs/:slug', contentController.getBlogBySlug);
router.post('/blogs', authenticate, authorize('ADMIN'), contentController.createBlog);
router.put('/blogs/:id', authenticate, authorize('ADMIN'), contentController.updateBlog);
router.delete('/blogs/:id', authenticate, authorize('ADMIN'), contentController.deleteBlog);

module.exports = router;
