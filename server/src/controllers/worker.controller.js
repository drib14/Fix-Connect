const workerService = require('../services/worker.service');
const { uploadToCloudinary } = require('../config/cloudinary');

const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profileData = await workerService.getProfileByUserId(userId);
    res.status(200).json(profileData);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const worker = await workerService.createOrUpdateProfile(userId, req.body);
    res.status(200).json(worker);
  } catch (error) {
    next(error);
  }
};

const getWorkerById = async (req, res, next) => {
  try {
    const workerData = await workerService.getProfileById(req.params.id);
    res.status(200).json(workerData);
  } catch (error) {
    next(error);
  }
};

const searchWorkers = async (req, res, next) => {
  try {
    const { query, category, lng, lat, maxDistance } = req.query;
    
    const filters = { query, category };
    if (lng && lat) {
      filters.longitude = parseFloat(lng);
      filters.latitude = parseFloat(lat);
    }
    if (maxDistance) {
      filters.maxDistance = parseFloat(maxDistance);
    }

    const workers = await workerService.searchWorkers(filters);
    res.status(200).json(workers);
  } catch (error) {
    next(error);
  }
};

const addService = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const service = await workerService.addService(userId, req.body);
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await workerService.deleteService(req.params.id, userId);
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const uploadImage = async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'No image data provided' });
    }

    const uploadResult = await uploadToCloudinary(image, 'profiles');
    res.status(200).json({ url: uploadResult.url });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  getWorkerById,
  searchWorkers,
  addService,
  deleteService,
  uploadImage,
};
