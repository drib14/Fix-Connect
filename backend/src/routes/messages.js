const router = require('express').Router();
const auth = require('../middleware/auth');
const { sendMessage, getMessages } = require('../controllers/messageController');

router.post('/', auth, sendMessage);
router.get('/:receiverId', auth, getMessages);

module.exports = router;
