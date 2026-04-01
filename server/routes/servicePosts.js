const express = require('express');
const router = express.Router();
const { createServicePost, getServicePosts, getMyServicePosts, deleteServicePost } = require('../controllers/servicePostController');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

router.post('/', protect, upload.single('image'), createServicePost);
router.get('/', getServicePosts);
router.get('/me', protect, getMyServicePosts);
router.delete('/:id', protect, deleteServicePost);

module.exports = router;
