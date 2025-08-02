import express from 'express';
import Comment from '../models/comment.model.js';
import Blog from '../models/blog.model.js';

const router = express.Router();

// GET comments for a specific blog
router.get('/blogs/:blogId/comments', async (req, res) => {
  try {
    console.log('=== FETCHING COMMENTS ===');
    const { blogId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    console.log('Blog ID:', blogId);
    console.log('Page:', page, 'Limit:', limit);
    
    // Verify blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }
    
    // Get approved comments only
    const comments = await Comment.find({ 
      blogId, 
      status: 'approved',
      parentComment: null // Only top-level comments
    })
    .populate('replies', null, { status: 'approved' })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    const total = await Comment.countDocuments({ 
      blogId, 
      status: 'approved',
      parentComment: null 
    });
    
    console.log('Comments found:', comments.length);
    console.log('Total comments:', total);
    
    res.json({
      success: true,
      data: comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalComments: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching comments' 
    });
  }
});

// POST new comment
router.post('/blogs/:blogId/comments', async (req, res) => {
  try {
    console.log('=== CREATING COMMENT ===');
    const { blogId } = req.params;
    const { author, email, content, parentComment } = req.body;
    
    console.log('Request body:', { author, email, content: content?.substring(0, 50) + '...', parentComment });
    
    // Validation
    if (!author || !email || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Author, email, and content are required' 
      });
    }
    
    if (content.length > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment content cannot exceed 1000 characters' 
      });
    }
    
    // Verify blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }
    
    // Verify parent comment exists if provided
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({ 
          success: false, 
          message: 'Parent comment not found' 
        });
      }
    }
    
    // Create comment
    const commentData = {
      blogId,
      author: author.trim(),
      email: email.trim().toLowerCase(),
      content: content.trim(),
      parentComment: parentComment || null,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress
    };
    
    const comment = new Comment(commentData);
    await comment.save();
    
    console.log('Comment created successfully:', comment._id);
    
    // If this is a reply, add it to parent's replies array
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: comment._id }
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Comment submitted successfully and awaiting approval',
      data: comment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating comment' 
    });
  }
});

// POST like a comment
router.post('/comments/:commentId/like', async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { likes: 1 } },
      { new: true }
    );
    
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }
    
    res.json({
      success: true,
      data: { likes: comment.likes }
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error liking comment' 
    });
  }
});

// Admin routes for comment management
router.get('/admin/comments', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const comments = await Comment.find(query)
      .populate('blogId', 'title slug')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Comment.countDocuments(query);
    
    res.json({
      success: true,
      data: comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalComments: total
      }
    });
  } catch (error) {
    console.error('Error fetching admin comments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching comments' 
    });
  }
});

// PUT update comment status (admin)
router.put('/admin/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'approved', 'spam'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }
    
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { status },
      { new: true }
    );
    
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Comment status updated successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating comment' 
    });
  }
});

// DELETE comment (admin)
router.delete('/admin/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findByIdAndDelete(commentId);
    
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }
    
    // Remove from parent's replies if it's a reply
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: commentId }
      });
    }
    
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting comment' 
    });
  }
});

export default router; 