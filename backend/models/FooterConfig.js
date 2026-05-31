const mongoose = require('mongoose');

const FooterConfigSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'FixConnect',
    },
    address: {
      type: String,
      default: '123 Service Road, Tech District, Philippines',
    },
    email: {
      type: String,
      default: 'support@fixconnect.com',
    },
    phone: {
      type: String,
      default: '+63 900 123 4567',
    },
    socialLinks: {
      facebook: { type: String, default: 'https://facebook.com/fixconnect' },
      twitter: { type: String, default: 'https://twitter.com/fixconnect' },
      instagram: { type: String, default: 'https://instagram.com/fixconnect' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FooterConfig', FooterConfigSchema);
