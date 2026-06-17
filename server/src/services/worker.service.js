const Worker = require('../models/worker.model');
const Service = require('../models/service.model');

/**
 * Creates or updates a worker's profile
 */
const createOrUpdateProfile = async (userId, data) => {
  const { skills, category, description, hourlyRate, locationName, longitude, latitude, avatar } = data;

  const updateFields = {
    skills: skills || [],
    category: category || 'Other',
    description: description || '',
    hourlyRate: parseFloat(hourlyRate) || 0,
    locationName,
    avatar,
  };

  if (longitude !== undefined && latitude !== undefined) {
    updateFields.coordinates = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };
  }

  const worker = await Worker.findOneAndUpdate(
    { userId },
    { $set: updateFields },
    { new: true, upsert: true }
  ).populate('userId', 'fullName email phoneNumber');

  return worker;
};

/**
 * Gets a worker profile by User ID
 */
const getProfileByUserId = async (userId) => {
  const profile = await Worker.findOne({ userId }).populate('userId', 'fullName email phoneNumber');
  const services = await Service.find({ workerId: userId });
  return { profile, services };
};

/**
 * Gets a worker profile by Profile ID
 */
const getProfileById = async (id) => {
  const profile = await Worker.findById(id).populate('userId', 'fullName email phoneNumber');
  if (!profile) {
    throw new Error('Worker profile not found');
  }
  const services = await Service.find({ workerId: profile.userId });
  return { profile, services };
};

/**
 * Searches for workers, optionally sorted by distance
 */
const searchWorkers = async (filters) => {
  const { query, category, longitude, latitude, maxDistance = 50000 } = filters;
  const dbQuery = { isAvailable: true };

  if (category && category !== 'All') {
    dbQuery.category = category;
  }

  // If geo parameters are provided, perform nearSphere search
  if (longitude !== undefined && latitude !== undefined) {
    dbQuery.coordinates = {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: parseFloat(maxDistance), // In meters
      },
    };
  }

  let workers = await Worker.find(dbQuery).populate('userId', 'fullName email phoneNumber');

  // Perform full-text filters in-memory if query is provided
  if (query) {
    const regex = new RegExp(query, 'i');
    workers = workers.filter(
      (w) =>
        (w.userId && w.userId.fullName.match(regex)) ||
        w.skills.some((skill) => skill.match(regex)) ||
        w.description.match(regex)
    );
  }

  return workers;
};

/**
 * Adds a new custom service for a worker
 */
const addService = async (userId, serviceData) => {
  const { name, category, description, price, duration, image } = serviceData;
  const service = await Service.create({
    workerId: userId,
    name,
    category,
    description,
    price: parseFloat(price) || 0,
    duration,
    image,
  });
  return service;
};

/**
 * Deletes a worker's custom service
 */
const deleteService = async (serviceId, userId) => {
  const result = await Service.findOneAndDelete({ _id: serviceId, workerId: userId });
  if (!result) {
    throw new Error('Service not found or unauthorized');
  }
  return result;
};

module.exports = {
  createOrUpdateProfile,
  getProfileByUserId,
  getProfileById,
  searchWorkers,
  addService,
  deleteService,
};
