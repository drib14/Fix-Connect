const express = require('express');
const router = express.Router();
const { createServicePost, getServicePosts } = require('../controllers/servicePostController');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

router.post('/', protect, upload.single('image'), createServicePost);
router.get('/', getServicePosts);

module.exports = router;
