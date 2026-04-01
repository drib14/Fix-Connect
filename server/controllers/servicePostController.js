const ServicePost = require('../models/ServicePost');
const Worker = require('../models/Worker');

exports.createServicePost = async (req, res) => {
  try {
    const { title, type, description, price, rateType } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = req.file.path; // Set by Cloudinary storage
    }

    const worker = await Worker.findOne({ userId: req.user._id });

    if (!worker) {
        return res.status(403).json({ message: 'Only registered workers can create service posts. Please apply as a worker first.' });
    }

    const newPost = new ServicePost({
      workerId: worker._id,
      title,
      type,
      description,
      price,
      rateType,
      imageUrl
    });

    await newPost.save();

    const populatedPost = await ServicePost.findById(newPost._id).populate('workerId');
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating service post:', error);
    res.status(500).json({ message: 'Failed to create service post.' });
  }
};

exports.getServicePosts = async (req, res) => {
  try {
    const posts = await ServicePost.find({}).populate('workerId').sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching service posts:', error);
    res.status(500).json({ message: 'Failed to fetch service posts.' });
  }
};

exports.getMyServicePosts = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) return res.status(404).json({ message: 'Worker profile not found.' });

    const posts = await ServicePost.find({ workerId: worker._id }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching your service posts:', error);
    res.status(500).json({ message: 'Failed to fetch your service posts.' });
  }
};

exports.deleteServicePost = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) return res.status(403).json({ message: 'Only registered workers can delete posts.' });

    const post = await ServicePost.findOneAndDelete({ _id: req.params.id, workerId: worker._id });
    if (!post) return res.status(404).json({ message: 'Post not found or unauthorized.' });

    res.status(200).json({ message: 'Service post deleted successfully.' });
  } catch (error) {
    console.error('Error deleting service post:', error);
    res.status(500).json({ message: 'Failed to delete service post.' });
  }
};
