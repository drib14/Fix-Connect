const router = require('express').Router();
const auth = require('../middleware/auth');
const { createTicket, getTickets } = require('../controllers/supportController');

router.post('/tickets', auth, createTicket);
router.get('/tickets', auth, getTickets);

module.exports = router;
