import express from 'express';
import Blog from '../models/blog.model.js';
import verifyMiddleware from '../middlewares/verifyMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
// GET all published blogs
router.get('/blogs', async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, search } = req.query;
    
    let query = { status: 'published' };
    
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ success: false, message: 'Error fetching blogs' });
  }
});

// GET single blog by slug
router.get('/blogs/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ slug, status: 'published' });
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    // Increment view count
    blog.views += 1;
    await blog.save();
    
    res.json({ success: true, data: blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ success: false, message: 'Error fetching blog' });
  }
});

// GET blog by ID (for admin)
router.get('/blogs/id/:id', verifyMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    res.json({ success: true, data: blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ success: false, message: 'Error fetching blog' });
  }
});

// Admin routes (authentication required)
// GET all blogs (admin)
router.get('/admin/blogs', verifyMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total
      }
    });
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    res.status(500).json({ success: false, message: 'Error fetching blogs' });
  }
});

// POST create new blog
router.post('/admin/blogs', verifyMiddleware, async (req, res) => {
  try {
    const { title, content, excerpt, author, image, tags, status } = req.body;
    
    // Validation
    if (!title || !content || !excerpt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, content, and excerpt are required' 
      });
    }
    
    const blogData = {
      title,
      content,
      excerpt,
      author: author || 'Admin',
      image,
      tags: tags || [],
      status: status || 'published'
    };
    
    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    blogData.slug = slug;
    
    const blog = new Blog(blogData);
    await blog.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Blog post created successfully',
      data: blog 
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'A blog post with this title already exists' 
      });
    }
    
    res.status(500).json({ success: false, message: 'Error creating blog post' });
  }
});

// PUT update blog
router.put('/admin/blogs/:id', verifyMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, author, image, tags, status } = req.body;
    
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    // Update fields
    if (title) {
      blog.title = title;
      // Update slug if title changes
      blog.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (content) blog.content = content;
    if (excerpt) blog.excerpt = excerpt;
    if (author) blog.author = author;
    if (image !== undefined) blog.image = image;
    if (tags) blog.tags = tags;
    if (status) blog.status = status;
    
    await blog.save();
    
    res.json({ 
      success: true, 
      message: 'Blog post updated successfully',
      data: blog 
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'A blog post with this title already exists' 
      });
    }
    
    res.status(500).json({ success: false, message: 'Error updating blog post' });
  }
});

// DELETE blog
router.delete('/admin/blogs/:id', verifyMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findByIdAndDelete(id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Blog post deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ success: false, message: 'Error deleting blog post' });
  }
});

// GET blog statistics
router.get('/admin/blogs/stats', verifyMiddleware, async (req, res) => {
  try {
    const totalPosts = await Blog.countDocuments();
    const publishedPosts = await Blog.countDocuments({ status: 'published' });
    const draftPosts = await Blog.countDocuments({ status: 'draft' });
    const totalViews = await Blog.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews: totalViews[0]?.totalViews || 0
      }
    });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching blog statistics' });
  }
});

export default router;