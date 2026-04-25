import re

with open('server/controllers/bookingController.js', 'r') as f:
    content = f.read()

# Since we removed `date` and `startTime` from the frontend form (they are now optional in the model),
# we need to remove them from the required validation in the backend.

old_validation = """    if (!serviceCategory || !date || !startTime || !address || lat === undefined || lng === undefined) {
      return res.status(400).json(createResponse(false, 'Missing required fields or location coordinates.'));
    }

    const bookingDate = new Date(date);
    if (isNaN(bookingDate)) {
      return res.status(400).json(createResponse(false, 'Invalid date format.'));
    }"""

new_validation = """    if (!serviceCategory || !address || lat === undefined || lng === undefined) {
      return res.status(400).json(createResponse(false, 'Missing required fields or location coordinates.'));
    }

    // Provide defaults for instant booking if missing
    const finalDate = date ? new Date(date) : new Date();
    const finalStartTime = startTime || 'ASAP';"""

content = content.replace(old_validation, new_validation)

# Further down, where the booking is actually saved, we should use finalDate and finalStartTime
old_save = """    const newBooking = new Booking({
      userId: req.user._id,
      serviceCategory,
      date: bookingDate,
      startTime,
      endTime,
      address,
      coordinates: { lat, lng },
      paymentMethod: paymentMethod || 'Cash',
      status: 'pending',
      priceAtBooking: pricingResult.baseFee,
      totalAmount: pricingResult.total
    });"""

new_save = """    const newBooking = new Booking({
      userId: req.user._id,
      serviceCategory,
      date: finalDate,
      startTime: finalStartTime,
      endTime,
      address,
      coordinates: { lat, lng },
      paymentMethod: paymentMethod || 'Cash',
      status: 'pending',
      priceAtBooking: pricingResult.baseFee,
      totalAmount: pricingResult.total
    });"""

content = content.replace(old_save, new_save)

with open('server/controllers/bookingController.js', 'w') as f:
    f.write(content)
