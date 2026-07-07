const router = require('express').Router();
const auth = require('../middleware/auth');
const { getNotifications, markAsRead } = require('../controllers/notificationController');

router.get('/', auth, getNotifications);
router.put('/:id/read', auth, markAsRead);

module.exports = router;
