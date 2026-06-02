import { Category } from '../models/Category.js';
import { User } from '../models/User.js';
import { WorkerProfile } from '../models/WorkerProfile.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middleware/errorMiddleware.js';

export class WorkerController {
  async getCategories(_req, res, next) {
    try {
      const categories = await Category.find({}).sort({ name: 1 }).exec();
      res.status(200).json({
        status: 'success',
        results: categories.length,
        data: {
          categories,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getWorkers(_req, res, next) {
    try {
      // Find all onboarded providers
      const providers = await User.find({ role: 'provider', isOnboarded: true }).exec();
      
      const workers = [];
      for (const prov of providers) {
        const profile = await WorkerProfile.findOne({ userId: prov._id }).exec();
        workers.push({
          id: prov.id,
          name: prov.name,
          email: prov.email,
          avatar: prov.avatar,
          role: prov.role,
          isOnboarded: prov.isOnboarded,
          profile: profile || null,
        });
      }

      res.status(200).json({
        status: 'success',
        results: workers.length,
        data: {
          workers,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async onboardCustomer(req, res, next) {
    try {
      const { address, lat, lng } = req.body;
      const user = req.user; // Appended by protect middleware

      if (!address) {
        throw new AppError('Location address is required.', 400);
      }

      // Update User
      user.location = {
        address,
        lat: lat || 0,
        lng: lng || 0,
      };
      user.isOnboarded = true;
      await user.save();

      logger.info(`Customer ${user.email} completed location onboarding successfully.`);

      res.status(200).json({
        status: 'success',
        message: 'Onboarding completed successfully.',
        data: {
          user,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async onboardProvider(req, res, next) {
    try {
      const { businessName, specialty, hourlyRate, bio, serviceRadius, availability } = req.body;
      const user = req.user;

      if (!businessName || !specialty || !hourlyRate) {
        throw new AppError('Business Name, Specialty, and Hourly Rate are required fields.', 400);
      }

      // Upsert profile
      await WorkerProfile.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          businessName,
          specialty,
          hourlyRate: Number(hourlyRate),
          bio: bio || '',
          serviceRadius: Number(serviceRadius) || 15,
          availability: availability || {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            startTime: '08:00',
            endTime: '17:00',
          },
        },
        { upsert: true, new: true, runValidators: true }
      );

      // Update User onboarding status
      user.isOnboarded = true;
      await user.save();

      logger.info(`Provider ${user.email} completed business onboarding profile.`);

      res.status(200).json({
        status: 'success',
        message: 'Business profile onboarding completed successfully.',
        data: {
          user,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
export default WorkerController;
