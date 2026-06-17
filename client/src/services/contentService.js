import api from './api';

export const getTerms = async () => {
  const response = await api.get('/content/terms');
  return response.data.terms;
};

export const updateTerms = async (value) => {
  const response = await api.put('/content/terms', { value });
  return response.data;
};

export const getPrivacy = async () => {
  const response = await api.get('/content/privacy');
  return response.data.privacy;
};

export const updatePrivacy = async (value) => {
  const response = await api.put('/content/privacy', { value });
  return response.data;
};

export const getBlogs = async () => {
  const response = await api.get('/content/blogs');
  return response.data.blogs;
};

export const getBlogBySlug = async (slug) => {
  const response = await api.get(`/content/blogs/${slug}`);
  return response.data.blog;
};

export const createBlog = async (blogData) => {
  const response = await api.post('/content/blogs', blogData);
  return response.data.blog;
};

export const updateBlog = async (id, blogData) => {
  const response = await api.put(`/content/blogs/${id}`, blogData);
  return response.data.blog;
};

export const deleteBlog = async (id) => {
  const response = await api.delete(`/content/blogs/${id}`);
  return response.data;
};
