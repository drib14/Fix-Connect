import { User } from '../models/User.js';
import { WorkerProfile } from '../models/WorkerProfile.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { logger } from '../utils/logger.js';
import cloudinary from 'cloudinary';
import multer from 'multer';

// Configure cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage for cloudinary uploads
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files are allowed', 400));
    }
  },
});

export class ProfileController {
  // GET /api/profile
  getMyProfile = async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).lean();
      if (!user) return next(new AppError('User not found', 404));

      let profile = null;
      if (user.role === 'provider') {
        profile = await WorkerProfile.findOne({ userId: req.user.id })
          .populate('category', 'name iconName slug')
          .lean();
      }

      res.status(200).json({
        status: 'success',
        data: { user: { ...user, id: user._id.toString() }, profile },
      });
    } catch (err) {
      next(err);
    }
  };

  // PUT /api/profile
  updateMyProfile = async (req, res, next) => {
    try {
      const { name, phone, bio, currency, location } = req.body;

      // Prevent role/email/password changes via this route
      const allowedUpdates = {};
      if (name) allowedUpdates.name = name;
      if (phone !== undefined) allowedUpdates.phone = phone;
      if (bio !== undefined) allowedUpdates.bio = bio;
      if (currency) allowedUpdates.currency = currency.toUpperCase();
      if (location) allowedUpdates.location = location;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: allowedUpdates },
        { new: true, runValidators: true }
      );

      logger.info(`Profile updated for user ${req.user.id}`);
      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/profile/avatar
  uploadAvatar = async (req, res, next) => {
    try {
      if (!req.file) return next(new AppError('No image file provided', 400));

      // Upload to cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          {
            folder: 'fixconnect/avatars',
            transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: result.secure_url },
        { new: true }
      );

      res.status(200).json({
        status: 'success',
        data: { avatarUrl: result.secure_url, user },
      });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/profile/provider
  getProviderProfile = async (req, res, next) => {
    try {
      const profile = await WorkerProfile.findOne({ userId: req.user.id })
        .populate('category', 'name iconName slug')
        .lean();

      if (!profile) {
        return res.status(200).json({
          status: 'success',
          data: { profile: null },
        });
      }

      res.status(200).json({
        status: 'success',
        data: { profile: { ...profile, id: profile._id.toString() } },
      });
    } catch (err) {
      next(err);
    }
  };

  // PUT /api/profile/provider
  updateProviderProfile = async (req, res, next) => {
    try {
      if (req.user.role !== 'provider') {
        return next(new AppError('Only providers can update provider profiles', 403));
      }

      const {
        businessName,
        specialty,
        category,
        hourlyRate,
        bio,
        serviceRadius,
        availability,
        yearsOfExperience,
        languages,
        certifications,
        isAvailable,
      } = req.body;

      const updates = {};
      if (businessName !== undefined) updates.businessName = businessName;
      if (specialty !== undefined) updates.specialty = specialty;
      if (category !== undefined) updates.category = category;
      if (hourlyRate !== undefined) updates.hourlyRate = Number(hourlyRate);
      if (bio !== undefined) updates.bio = bio;
      if (serviceRadius !== undefined) updates.serviceRadius = Number(serviceRadius);
      if (availability !== undefined) updates.availability = availability;
      if (yearsOfExperience !== undefined) updates.yearsOfExperience = Number(yearsOfExperience);
      if (languages !== undefined) updates.languages = languages;
      if (certifications !== undefined) updates.certifications = certifications;
      if (isAvailable !== undefined) updates.isAvailable = isAvailable;

      const profile = await WorkerProfile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: updates },
        { new: true, upsert: true, runValidators: true }
      ).populate('category', 'name iconName slug');

      logger.info(`Provider profile updated for user ${req.user.id}`);
      res.status(200).json({
        status: 'success',
        data: { profile },
      });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/profile/public/:userId — public provider profile
  getPublicProfile = async (req, res, next) => {
    try {
      const user = await User.findById(req.params.userId).lean();
      if (!user || user.role !== 'provider') {
        return next(new AppError('Provider not found', 404));
      }

      const profile = await WorkerProfile.findOne({ userId: req.params.userId })
        .populate('category', 'name iconName slug')
        .lean();

      // Fetch latest reviews
      const { Review } = await import('../models/Review.js');
      const reviews = await Review.find({ reviewee: req.params.userId })
        .populate('reviewer', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      res.status(200).json({
        status: 'success',
        data: {
          user: { id: user._id.toString(), name: user.name, avatar: user.avatar, role: user.role },
          profile: profile ? { ...profile, id: profile._id.toString() } : null,
          reviews,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
