const SupportTicket = require('../models/SupportTicket');

/**
 * POST /api/support/tickets
 */
exports.createTicket = async (req, res) => {
  try {
    const { category, message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Ticket message content is required.' });
    }

    const ticket = await SupportTicket.create({
      user_id: req.user.id,
      email: req.user.email,
      category: category || 'General',
      message: message.trim(),
      status: 'open',
    });

    res.status(201).json({
      message: 'Support ticket submitted successfully.',
      ticket,
    });
  } catch (error) {
    console.error('CreateTicket error:', error);
    res.status(500).json({ message: 'Server error while submitting support ticket.' });
  }
};

/**
 * GET /api/support/tickets
 */
exports.getTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.json({ tickets });
  } catch (error) {
    console.error('GetTickets error:', error);
    res.status(500).json({ message: 'Server error retrieving tickets.' });
  }
};
