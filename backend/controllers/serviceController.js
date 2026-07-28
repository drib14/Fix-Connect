const ServiceCategory = require("../models/ServiceCategory");
const User = require("../models/User");

// @desc Get all active service categories
// @route GET /api/services
exports.getServices = async (req, res) => {
  try {
    const categories = await ServiceCategory.find({ isActive: true });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("[Get Services Error]:", error.message);
    res.status(500).json({ success: false, message: "Error fetching service categories" });
  }
};

// @desc Find nearby online service providers for instant matching
// @route GET /api/services/nearby-providers
exports.getNearbyProviders = async (req, res) => {
  try {
    const { lng, lat, category, maxDistanceKm = 15 } = req.query;

    const longitude = parseFloat(lng) || 120.9842;
    const latitude = parseFloat(lat) || 14.5995;
    const maxDistanceMeters = parseFloat(maxDistanceKm) * 1000;

    const query = {
      role: "provider",
      isOnline: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistanceMeters,
        },
      },
    };

    if (category) {
      query.serviceCategories = { $in: [new RegExp(category, "i")] };
    }

    const providers = await User.find(query)
      .select("name phone rating totalRatings location serviceCategories isOnline")
      .limit(10);

    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    console.error("[Get Nearby Providers Error]:", error.message);
    res.status(500).json({ success: false, message: "Error searching nearby providers" });
  }
};
