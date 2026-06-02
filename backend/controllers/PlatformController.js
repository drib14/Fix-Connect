import { PlatformConfig } from '../models/PlatformConfig.js';

export class PlatformController {
  async getConfig(req, res, next) {
    try {
      let config = await PlatformConfig.findOne();

      // If it doesn't exist yet, we can return null to the frontend or create a default one
      // The user requested that we don't seed any data, so we'll just return null or empty
      res.status(200).json({
        status: 'success',
        data: {
          config: config || null
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async subscribeNewsletter(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ status: 'error', message: 'Email is required' });
      }

      let config = await PlatformConfig.findOne();
      if (!config) {
        config = await PlatformConfig.create({ newsletterSubscribers: [email] });
      } else {
        if (!config.newsletterSubscribers.includes(email)) {
          config.newsletterSubscribers.push(email);
          await config.save();
        }
      }

      res.status(200).json({
        status: 'success',
        message: 'Successfully subscribed to newsletter!'
      });
    } catch (err) {
      next(err);
    }
  }
}
export default PlatformController;
