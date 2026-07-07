const Message = require('../models/Message');

/**
 * GET /api/messages/:receiverId
 */
exports.getMessages = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const { receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender_id, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: sender_id },
      ],
    }).sort({ created_at: 1 });

    res.json({ messages });
  } catch (error) {
    console.error('GetMessages error:', error);
    res.status(500).json({ message: 'Server error retrieving messages.' });
  }
};

/**
 * POST /api/messages
 */
exports.sendMessage = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const { receiver_id, booking_id, text, image_url } = req.body;

    if (!receiver_id || !text) {
      return res.status(400).json({ message: 'Receiver ID and text message are required.' });
    }

    const message = await Message.create({
      sender_id,
      receiver_id,
      booking_id: booking_id || null,
      text: text.trim(),
      image_url: image_url || '',
      read: false,
    });

    // Real-time broadcast if socket is initialized
    const io = req.app.get('io');
    if (io) {
      // Emit to receiver's private channel
      io.emit(`message:${receiver_id}`, message);
      // Emit to sender's own channel for multi-device sync
      io.emit(`message:${sender_id}`, message);
    }

    res.status(201).json({ message });
  } catch (error) {
    console.error('SendMessage error:', error);
    res.status(500).json({ message: 'Server error while sending message.' });
  }
};
