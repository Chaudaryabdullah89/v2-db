import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300
  },
  author: {
    type: String,
    required: true,
    default: 'Admin'
  },
  image: {
    type: String,
    required: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  readTime: {
    type: Number,
    default: 5
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create slug from title before saving
BlogSchema.pre('save', function(next) {
  // Generate slug if it doesn't exist or if title is modified
  if (!this.slug || this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  next();
});

// Calculate read time based on content length
BlogSchema.pre('save', function(next) {
  if (!this.isModified('content')) return next();
  
  const wordsPerMinute = 200;
  const wordCount = this.content.split(' ').length;
  this.readTime = Math.ceil(wordCount / wordsPerMinute);
  
  next();
});

const Blog = mongoose.model('Blog', BlogSchema);

export default Blog; 