const User = require('../models/user.model');
const Booking = require('../models/booking.model');

const getPendingWorkers = async (req, res, next) => {
  try {
    const pendingWorkers = await User.find({
      role: 'WORKER',
      onboardingCompleted: true,
      status: 'PENDING_APPROVAL',
    }).select('-passwordHash -refreshToken -resetPasswordToken');

    res.status(200).json({ pendingWorkers });
  } catch (error) {
    next(error);
  }
};

const verifyWorker = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'APPROVE' or 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be APPROVE or REJECT' });
    }

    const worker = await User.findById(id);
    if (!worker || worker.role !== 'WORKER') {
      return res.status(404).json({ message: 'Worker not found' });
    }

    worker.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    await worker.save();

    res.status(200).json({
      message: `Worker account status has been updated to ${worker.status}`,
      worker: {
        id: worker._id,
        fullName: worker.fullName,
        email: worker.email,
        status: worker.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    // 1. Basic counts
    const totalUsers = await User.countDocuments({ role: 'USER' });
    const totalWorkers = await User.countDocuments({ role: 'WORKER', status: 'APPROVED' });
    const pendingWorkers = await User.countDocuments({ role: 'WORKER', status: 'PENDING_APPROVAL' });
    const totalBookingsCount = await Booking.countDocuments();

    // 2. Revenue calculation
    const paidBookings = await Booking.find({ paymentStatus: 'PAID' });
    const totalRevenue = paidBookings.reduce((sum, booking) => sum + (booking.price || 0), 0);

    // 3. Specialties distribution
    const specialtiesMap = {};
    const workers = await User.find({ role: 'WORKER', status: 'APPROVED' });
    workers.forEach((w) => {
      if (w.specialty) {
        specialtiesMap[w.specialty] = (specialtiesMap[w.specialty] || 0) + 1;
      }
    });
    const specialtiesData = Object.keys(specialtiesMap).map((key) => ({
      name: key,
      value: specialtiesMap[key],
    }));

    // 4. Monthly Bookings (mocked dynamic mapping based on database or simple defaults)
    // We can group bookings by month
    const monthlyBookings = {};
    const allBookings = await Booking.find().select('createdAt price paymentStatus');
    
    // Seed last 6 months with 0
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const mIdx = (currentMonth - i + 12) % 12;
      last6Months.push(months[mIdx]);
      monthlyBookings[months[mIdx]] = { bookings: 0, revenue: 0 };
    }

    allBookings.forEach((b) => {
      const date = new Date(b.createdAt);
      const mName = months[date.getMonth()];
      if (monthlyBookings[mName]) {
        monthlyBookings[mName].bookings += 1;
        if (b.paymentStatus === 'PAID') {
          monthlyBookings[mName].revenue += b.price || 0;
        }
      }
    });

    const monthlyStats = last6Months.map((m) => ({
      month: m,
      bookings: monthlyBookings[m].bookings,
      revenue: monthlyBookings[m].revenue,
    }));

    // 5. Recent bookings list
    const recentBookings = await Booking.find()
      .populate('userId', 'fullName avatar')
      .populate('workerId', 'fullName avatar specialty')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      summary: {
        totalUsers,
        totalWorkers,
        pendingWorkers,
        totalBookings: totalBookingsCount,
        totalRevenue,
      },
      specialties: specialtiesData,
      monthly: monthlyStats,
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: 'ADMIN' } })
      .select('-passwordHash -refreshToken -resetPasswordToken')
      .sort({ createdAt: -1 });

    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    // Delete related bookings as well to keep db clean
    await Booking.deleteMany({ $or: [{ userId: id }, { workerId: id }] });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'BLOCKED', 'APPROVED', 'REJECTED', 'PENDING_APPROVAL'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      message: `User account status has been updated to ${status}`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'fullName email')
      .populate('workerId', 'fullName specialty')
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    next(error);
  }
};

const getBookingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('userId', 'fullName email phoneNumber avatar')
      .populate('workerId', 'fullName email phoneNumber avatar specialty rating')
      .populate('chat.senderId', 'fullName role avatar');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ booking });
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'ACCEPTED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    if (status === 'COMPLETED') {
      booking.completedAt = new Date();
    }
    await booking.save();

    res.status(200).json({ message: `Booking status updated to ${status}`, booking });
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      'fullName', 'email', 'phoneNumber', 'role', 'specialty',
      'hourlyRate', 'bio', 'experienceYears', 'address', 'coordinates', 'status', 'isAvailable'
    ];

    const updateData = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    if (updateData.coordinates) {
      if (!Array.isArray(updateData.coordinates) || updateData.coordinates.length !== 2) {
        return res.status(400).json({ message: 'Coordinates must be an array of [longitude, latitude]' });
      }
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true })
      .select('-passwordHash -refreshToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

const getPayments = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'fullName email')
      .populate('workerId', 'fullName specialty')
      .select('userId workerId price paymentStatus paymentId serviceType scheduledAt createdAt')
      .sort({ createdAt: -1 });

    const transactions = bookings.map((b) => ({
      bookingId: b._id,
      clientName: b.userId?.fullName || 'Deleted Client',
      clientEmail: b.userId?.email || 'N/A',
      workerName: b.workerId?.fullName || 'Deleted Worker',
      workerSpecialty: b.workerId?.specialty || 'N/A',
      serviceType: b.serviceType,
      amount: b.price || 0,
      paymentStatus: b.paymentStatus || 'UNPAID',
      paymentId: b.paymentId || 'N/A',
      scheduledAt: b.scheduledAt,
      createdAt: b.createdAt
    }));

    res.status(200).json({ transactions });
  } catch (error) {
    next(error);
  }
};

const getReviews = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ 'review.rating': { $ne: null } })
      .populate('userId', 'fullName avatar')
      .populate('workerId', 'fullName specialty')
      .select('userId workerId serviceType review price completedAt')
      .sort({ 'review.createdAt': -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const workerId = booking.workerId;

    booking.review = {
      rating: null,
      comment: null,
      createdAt: null
    };
    await booking.save();

    const completedBookingsWithReviews = await Booking.find({
      workerId,
      status: 'COMPLETED',
      'review.rating': { $exists: true, $ne: null }
    });

    const totalRatings = completedBookingsWithReviews.length;
    const sumRatings = completedBookingsWithReviews.reduce((acc, curr) => acc + curr.review.rating, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 5.0;

    await User.findByIdAndUpdate(workerId, {
      rating: Math.round(averageRating * 10) / 10,
      ratingsCount: totalRatings
    });

    res.status(200).json({ message: 'Review deleted and worker rating recalculated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingWorkers,
  verifyWorker,
  getStats,
  getUsers,
  deleteUser,
  updateUserStatus,
  getBookings,
  getBookingDetails,
  updateBookingStatus,
  updateUserProfile,
  getPayments,
  getReviews,
  deleteReview,
};
