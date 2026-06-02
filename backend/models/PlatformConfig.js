import mongoose from 'mongoose';

const PlatformConfigSchema = new mongoose.Schema(
  {
    heroTitle: { type: String, default: 'On-Demand Service Experts' },
    heroSubtitle: { type: String, default: 'Connecting you instantly with top local professionals.' },
    aboutDescription: { type: String, default: 'FixConnect is your premium ride-hailing style platform for local home care services. We match you instantly.' },
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true }
      }
    ],
    footer: {
      platformName: { type: String, default: 'FixConnect' },
      description: { type: String, default: 'Bridging the gap between reliable local services and modern technology.' },
      copyright: { type: String, default: '© 2024 FixConnect. All rights reserved.' }
    },
    socialLinks: {
      facebook: { type: String, default: 'https://facebook.com' },
      twitter: { type: String, default: 'https://twitter.com' },
      instagram: { type: String, default: 'https://instagram.com' }
    },
    newsletterSubscribers: [{ type: String }]
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const PlatformConfig = mongoose.model('PlatformConfig', PlatformConfigSchema);
export default PlatformConfig;
