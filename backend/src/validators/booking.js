const { z } = require('zod');

const createBookingSchema = z.object({
  service_id: z.string().min(1, 'Service ID is required.'),
  latitude: z.number(),
  longitude: z.number(),
  formatted_address: z.string().min(1, 'Address is required.'),
  problem_description: z.string().min(1, 'Problem description is required.').max(1000),
  attachment_urls: z.array(z.string()).optional(),
  scheduled_at: z.string().datetime().optional().nullable(),
  is_scheduled: z.boolean().optional(),
});

const updateBookingStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SEARCHING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED']),
  cancel_reason: z.string().optional(),
});

module.exports = {
  createBookingSchema,
  updateBookingStatusSchema,
};
