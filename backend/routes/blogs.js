import express from 'express';
import { body } from 'express-validator';
import supabase from '../config/supabase.js'; // Import Supabase client
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { uploadToR2, deleteFromR2 } from '../utils/cloudflareR2.js';
import multer from 'multer';

const router = express.Router();

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Helper to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// @route   GET /api/blogs
// @desc    Get all published blogs
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const rangeFrom = (page - 1) * limit;
    const rangeTo = page * limit - 1;

    let query = supabase
      .from('blogs')
      .select('*, users(email)', { count: 'exact' })
      .eq('is_published', true);

    // Search functionality
    if (req.query.search) {
      // Supabase doesn't have direct $text search like Mongo.
      // You might need to implement full-text search using tsvector or a separate search service.
      // For now, a simple ILIKE search on title/content/excerpt/tags
      query = query.or(
        `title.ilike.%${req.query.search}%,excerpt.ilike.%${req.query.search}%,content.ilike.%${req.query.search}%`
      );
      // For tags, you'd need to check if the array contains the search term, which is more complex
      // query = query.contains('tags', [req.query.search]); // This checks for exact array match, not contains
    }

    // Tag filter
    if (req.query.tag) {
      query = query.contains('tags', [req.query.tag]);
    }

    const { data, count, error } = await query
      .order('published_at', { ascending: false })
      .range(rangeFrom, rangeTo);

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    res.json({
      success: true,
      data: data.map((blog) => ({
        ...blog,
        author: blog.users,
      })),
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/blogs/:slug
// @desc    Get single blog by slug
// @access  Public
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*, users(email)')
      .eq('slug', req.params.slug)
      .eq('is_published', true);

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    const blog = blogs[0];

    // Increment view count
    const { error: updateError } = await supabase
      .from('blogs')
      .update({ views: blog.views + 1 })
      .eq('id', blog.id);

    if (updateError) {
      console.error('Supabase view count update error:', updateError);
      // Don't fail the request, just log the error
    }

    res.json({
      success: true,
      data: { ...blog, author: blog.users },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/blogs
// @desc    Create a new blog
// @access  Private (Admin only)
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('title').trim().isLength({ min: 1, max: 200 }),
    body('excerpt').trim().isLength({ min: 1, max: 500 }),
    body('content').trim().isLength({ min: 1 }),
    body('tags').optional(),
    body('readTime').optional().trim(),
  ],
  upload.single('featuredImage'),
  async (req, res) => {
    try {
      const { title, excerpt, content, tags, readTime, isPublished } = req.body;
      const slug = generateSlug(title);

      let featuredImagePublicId = null;
      let featuredImageUrl = null;

      // Upload image to Cloudflare R2 if provided
      if (req.file) {
        const result = await uploadToR2(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          'portfolio/blogs'
        );
        featuredImagePublicId = result.public_id;
        featuredImageUrl = result.url;
      }

      const readTimeInt = readTime ? parseInt(readTime, 10) : 5;
      const isPublishedBool = isPublished === 'true' || isPublished === true;

      const { data, error } = await supabase
        .from('blogs')
        .insert([
          {
            title,
            slug,
            excerpt,
            content,
            featured_image_url: featuredImageUrl,
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            read_time: readTimeInt,
            is_published: isPublishedBool,
            published_at: isPublishedBool ? new Date().toISOString() : null,
            author_id: req.user.id,
          },
        ])
        .select('*, users(email)');

      if (error) {
        console.error('Supabase insert error:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error',
        });
      }

      res.status(201).json({
        success: true,
        data: { ...data[0], author: data[0].users },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// @route   PUT /api/blogs/:id
// @desc    Update a blog
// @access  Private (Admin only)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  [
    body('title').optional().trim().isLength({ min: 1, max: 200 }),
    body('excerpt').optional().trim().isLength({ min: 1, max: 500 }),
    body('content').optional().trim().isLength({ min: 1 }),
    body('tags').optional(),
    body('readTime').optional().trim(),
    body('isPublished').optional().isBoolean(),
  ],
  upload.single('featuredImage'),
  async (req, res) => {
    try {
      const { data: existingBlogs, error: fetchError } = await supabase
        .from('blogs')
        .select('featured_image_url, title, is_published')
        .eq('id', req.params.id);

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
        });
      }

      if (!existingBlogs || existingBlogs.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Blog not found',
        });
      }

      const existingBlog = existingBlogs[0];

      const { title, excerpt, content, tags, readTime, isPublished } = req.body;

      const updatePayload = { updated_at: new Date().toISOString() };
      if (title) {
        updatePayload.title = title;
        updatePayload.slug = generateSlug(title); // Regenerate slug if title changes
      }
      if (excerpt) updatePayload.excerpt = excerpt;
      if (content) updatePayload.content = content;
      if (tags) updatePayload.tags = tags.split(',').map(t => t.trim());
      if (readTime) updatePayload.read_time = readTime;
      if (isPublished !== undefined) {
        updatePayload.is_published = isPublished;
        // Set published_at if it's being published and wasn't before
        if (isPublished && !existingBlog.is_published) {
          updatePayload.published_at = new Date().toISOString();
        } else if (!isPublished) {
          updatePayload.published_at = null; // Clear published_at if unpublished
        }
      }

      // Upload new image if provided
      if (req.file) {
        // Delete old image from Cloudflare R2
        if (existingBlog.featured_image_url) {
          const key = existingBlog.featured_image_url.replace(`${process.env.R2_PUBLIC_URL}/`, '');
          await deleteFromR2(key);
        }

        const result = await uploadToR2(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          'portfolio/blogs'
        );
        updatePayload.featured_image_url = result.url;
      }

      const { data, error } = await supabase
        .from('blogs')
        .update(updatePayload)
        .eq('id', req.params.id)
        .select('*, users(email)');

      if (error) {
        console.error('Supabase update error:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error',
        });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Blog not found',
        });
      }

      res.json({
        success: true,
        data: { ...data[0], author: data[0].users },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: existingBlogs, error: fetchError } = await supabase
      .from('blogs')
      .select('featured_image_url')
      .eq('id', req.params.id);

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    if (!existingBlogs || existingBlogs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    const existingBlog = existingBlogs[0];

    // Delete image from Cloudflare R2
    if (existingBlog.featured_image_url) {
      const key = existingBlog.featured_image_url.replace(`${process.env.R2_PUBLIC_URL}/`, '');
      await deleteFromR2(key);
    }

    const { error } = await supabase.from('blogs').delete().eq('id', req.params.id);

    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    res.json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/blogs/admin/all
// @desc    Get all blogs for admin (including unpublished)
// @access  Private (Admin only)
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const rangeFrom = (page - 1) * limit;
    const rangeTo = page * limit - 1;

    const { data, count, error } = await supabase
      .from('blogs')
      .select('*, users(email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(rangeFrom, rangeTo);

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    res.json({
      success: true,
      data: data.map((blog) => ({
        ...blog,
        author: blog.users,
      })),
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

export default router;
