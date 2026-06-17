const User = require('../models/user.model');
const { z } = require('zod');

// Haversine formula for distance calculation in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const onboardSchema = z.object({
  avatar: z.string().optional(),
  // User fields
  address: z.string().optional(),
  coordinates: z.array(z.number()).length(2).optional(), // [longitude, latitude]
  // Worker fields
  specialty: z.string().optional(),
  hourlyRate: z.number().nonnegative().optional(),
  bio: z.string().optional(),
  experienceYears: z.number().int().nonnegative().optional(),
  governmentId: z.string().optional(),
  certificate: z.string().optional(),
});

const onboard = async (req, res, next) => {
  try {
    const data = onboardSchema.parse(req.body);
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update avatar if provided
    if (data.avatar) {
      user.avatar = data.avatar;
    }

    if (user.role === 'USER') {
      if (!data.address || !data.coordinates) {
        return res.status(400).json({ message: 'Address and coordinates are required for users' });
      }
      user.address = data.address;
      user.coordinates = data.coordinates;
      user.onboardingCompleted = true;
    } else if (user.role === 'WORKER') {
      if (!data.specialty || !data.hourlyRate || !data.bio || !data.experienceYears || !data.governmentId) {
        return res.status(400).json({
          message: 'Specialty, hourly rate, bio, experience, and Government ID are required for workers',
        });
      }
      user.specialty = data.specialty;
      user.hourlyRate = data.hourlyRate;
      user.bio = data.bio;
      user.experienceYears = data.experienceYears;
      user.governmentId = data.governmentId;
      if (data.certificate) {
        user.certificate = data.certificate;
      }
      // For workers, onboarding is complete, but they need admin status approval
      user.onboardingCompleted = true;
      user.status = 'PENDING_APPROVAL';
    }

    await user.save();

    res.status(200).json({
      message: 'Onboarding completed successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        onboardingCompleted: user.onboardingCompleted,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getWorkers = async (req, res, next) => {
  try {
    const { specialty, maxDistance, lat, lon, search } = req.query;

    // Build base query: must be approved worker
    const query = {
      role: 'WORKER',
      onboardingCompleted: true,
      status: 'APPROVED',
      isAvailable: true,
    };

    if (specialty && specialty !== 'All') {
      query.specialty = specialty;
    }

    if (search) {
      query.fullName = { $regex: search, $options: 'i' };
    }

    const workers = await User.find(query).select(
      'fullName email phoneNumber avatar specialty hourlyRate bio experienceYears rating ratingsCount coordinates isAvailable'
    );

    let results = workers;

    // Filter by distance if user coords are provided
    if (lat && lon) {
      const userLat = parseFloat(lat);
      const userLon = parseFloat(lon);

      results = workers
        .map((w) => {
          let distance = null;
          if (w.coordinates && w.coordinates.length === 2) {
            // MongoDB saves coordinates as [longitude, latitude]
            const [wLon, wLat] = w.coordinates;
            distance = calculateDistance(userLat, userLon, wLat, wLon);
          }
          return {
            ...w.toObject(),
            distance: distance !== null ? Math.round(distance * 10) / 10 : null, // round to 1 decimal place
          };
        })
        .filter((w) => {
          if (maxDistance && w.distance !== null) {
            return w.distance <= parseFloat(maxDistance);
          }
          return true;
        });

      // Sort by distance (closest first)
      results.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    res.status(200).json({ workers: results });
  } catch (error) {
    next(error);
  }
};

const geocodeAddress = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(200).json({ results: [] });
    }

    const token = process.env.LOCATIONIQ_ACCESS_TOKEN || 'pk.e31e6705bd87772aa6b6ab21a599c867';

    // Philippine city fallbacks
    const mockLocations = [
      { display_name: 'Metro Manila, Philippines', lat: 14.5995, lon: 120.9842 },
      { display_name: 'Quezon City, Metro Manila, Philippines', lat: 14.6760, lon: 121.0437 },
      { display_name: 'Cebu City, Visayas, Philippines', lat: 10.3157, lon: 123.8854 },
      { display_name: 'Davao City, Mindanao, Philippines', lat: 7.1907, lon: 125.4553 },
      { display_name: 'Makati City, Metro Manila, Philippines', lat: 14.5547, lon: 121.0244 },
      { display_name: 'Taguig City, Metro Manila, Philippines', lat: 14.5204, lon: 121.0539 },
      { display_name: 'Pasig City, Metro Manila, Philippines', lat: 14.5764, lon: 121.0851 },
      { display_name: 'Ortigas Center, Pasig, Philippines', lat: 14.5839, lon: 121.0624 },
    ];

    try {
      const fetchResponse = await fetch(
        `https://us1.locationiq.com/v1/search?key=${token}&q=${encodeURIComponent(q)}&format=json`
      );
      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        const results = data.map((item) => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        }));
        return res.status(200).json({ results });
      }
    } catch (fetchErr) {
      console.warn('LocationIQ geocode fetch failed, using fallbacks:', fetchErr.message);
    }

    const filtered = mockLocations.filter((loc) =>
      loc.display_name.toLowerCase().includes(q.toLowerCase())
    );

    res.status(200).json({ results: filtered.length > 0 ? filtered : mockLocations });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  onboard,
  getWorkers,
  geocodeAddress,
};
