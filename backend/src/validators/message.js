const { z } = require('zod');

const sendMessageSchema = z.object({
  receiver_id: z.string().min(1, 'Receiver ID is required.'),
  text: z.string().min(1, 'Message text cannot be empty.'),
  booking_id: z.string().optional().nullable(),
  image_url: z.string().optional(),
});

module.exports = {
  sendMessageSchema,
};
