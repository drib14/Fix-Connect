const SystemConfig = require('../models/config.model');
const Blog = require('../models/blog.model');
const AuditLog = require('../models/auditLog.model');
const { z } = require('zod');

const logAdminAction = async (adminId, actionType, targetEntity, details) => {
  try {
    await AuditLog.create({
      adminId,
      actionType,
      targetEntity,
      details,
    });
  } catch (err) {
    console.error('Failed to write compliance audit log from content:', err.message);
  }
};

// Schema validations
const updateConfigSchema = z.object({
  value: z.string().min(1, 'Content value cannot be empty'),
});

const blogInputSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  excerpt: z.string().min(5, 'Excerpt must be at least 5 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  author: z.string().min(2, 'Author name is required'),
  slug: z.string().min(2, 'Slug is required'),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

// Config Methods
const getTerms = async (req, res, next) => {
  try {
    const config = await SystemConfig.findOne({ key: 'terms_and_conditions' });
    if (!config) {
      return res.status(404).json({ message: 'Terms and Conditions not set' });
    }
    res.status(200).json({ terms: config.value });
  } catch (error) {
    next(error);
  }
};

const updateTerms = async (req, res, next) => {
  try {
    const { value } = updateConfigSchema.parse(req.body);
    let config = await SystemConfig.findOne({ key: 'terms_and_conditions' });
    if (!config) {
      config = new SystemConfig({ key: 'terms_and_conditions', value });
    } else {
      config.value = value;
    }
    await config.save();
    
    await logAdminAction(
      req.user._id,
      'UPDATE_LEGAL',
      'terms_and_conditions',
      `Updated Terms and Conditions HTML policy document`
    );

    res.status(200).json({ message: 'Terms and Conditions updated successfully', terms: config.value });
  } catch (error) {
    next(error);
  }
};

const getPrivacy = async (req, res, next) => {
  try {
    const config = await SystemConfig.findOne({ key: 'privacy_policy' });
    if (!config) {
      return res.status(404).json({ message: 'Privacy Policy not set' });
    }
    res.status(200).json({ privacy: config.value });
  } catch (error) {
    next(error);
  }
};

const updatePrivacy = async (req, res, next) => {
  try {
    const { value } = updateConfigSchema.parse(req.body);
    let config = await SystemConfig.findOne({ key: 'privacy_policy' });
    if (!config) {
      config = new SystemConfig({ key: 'privacy_policy', value });
    } else {
      config.value = value;
    }
    await config.save();

    await logAdminAction(
      req.user._id,
      'UPDATE_LEGAL',
      'privacy_policy',
      `Updated Privacy Policy HTML policy document`
    );

    res.status(200).json({ message: 'Privacy Policy updated successfully', privacy: config.value });
  } catch (error) {
    next(error);
  }
};

// Blog Methods
const getBlogs = async (req, res, next) => {
  try {
    const query = {};
    // If not admin, only fetch published blogs
    if (!req.user || req.user.role !== 'ADMIN') {
      query.status = 'PUBLISHED';
    }
    const blogs = await Blog.find(query).sort({ date: -1 });
    res.status(200).json({ blogs });
  } catch (error) {
    next(error);
  }
};

const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return res.status(404).json({ message: 'Blog article not found' });
    }
    res.status(200).json({ blog });
  } catch (error) {
    next(error);
  }
};

const createBlog = async (req, res, next) => {
  try {
    const data = blogInputSchema.parse(req.body);
    
    // Check if slug is unique
    const existing = await Blog.findOne({ slug: data.slug.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Blog slug already in use. Choose a unique slug.' });
    }

    const blog = await Blog.create({
      ...data,
      slug: data.slug.toLowerCase(),
      date: new Date(),
    });

    await logAdminAction(
      req.user._id,
      'CREATE_BLOG',
      blog.slug,
      `Published new blog post: "${blog.title}"`
    );

    res.status(201).json({ message: 'Blog article created successfully', blog });
  } catch (error) {
    next(error);
  }
};

const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = blogInputSchema.parse(req.body);

    // Check slug uniqueness excluding this blog
    const existing = await Blog.findOne({ slug: data.slug.toLowerCase(), _id: { $ne: id } });
    if (existing) {
      return res.status(400).json({ message: 'Blog slug already in use. Choose a unique slug.' });
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      {
        ...data,
        slug: data.slug.toLowerCase(),
      },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ message: 'Blog article not found' });
    }

    await logAdminAction(
      req.user._id,
      'UPDATE_BLOG',
      blog.slug,
      `Modified details for blog post: "${blog.title}"`
    );

    res.status(200).json({ message: 'Blog article updated successfully', blog });
  } catch (error) {
    next(error);
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog article not found' });
    }

    await logAdminAction(
      req.user._id,
      'DELETE_BLOG',
      blog.slug,
      `Permanently deleted blog post: "${blog.title}"`
    );

    res.status(200).json({ message: 'Blog article deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTerms,
  updateTerms,
  getPrivacy,
  updatePrivacy,
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
};
