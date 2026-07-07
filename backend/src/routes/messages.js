const router = require('express').Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { sendMessageSchema } = require('../validators/message');
const { sendMessage, getMessages } = require('../controllers/messageController');

router.post('/', auth, validate(sendMessageSchema), sendMessage);
router.get('/:receiverId', auth, getMessages);

module.exports = router;
