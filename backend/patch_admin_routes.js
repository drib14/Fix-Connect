const fs = require('fs');
const path = './backend/routes/admin.js';
let content = fs.readFileSync(path, 'utf8');

// Ensure module.exports = router; is at the VERY END.
// Right now it's in the middle because of previous appends.

// Find module.exports = router; and remove all instances
content = content.replace(/module\.exports\s*=\s*router;/g, '');

// Append module.exports at the end
content += '\n\n// === PAYMENTS & BOOKINGS ===\n';
content += `router.get('/payments', protect, authorize('admin'), async (req, res) => {
  try {
    const bookings = await Booking.find().populate('customerId workerId').sort('-createdAt');
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});\n`;

content += '\n// === LOCATIONS ===\n';
content += `router.get('/locations', protect, authorize('admin'), async (req, res) => {
  try {
    const workers = await WorkerProfile.find({ status: 'Active' }).populate('userId', 'name email');
    res.status(200).json({ success: true, workers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});\n`;

content += '\n\nmodule.exports = router;\n';

fs.writeFileSync(path, content);
console.log('patched');
