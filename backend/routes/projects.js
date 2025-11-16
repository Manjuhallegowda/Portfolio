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

// @route   GET /api/projects
// @desc    Get all published projects
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const rangeFrom = (page - 1) * limit;
    const rangeTo = page * limit - 1;

    let query = supabase
      .from('projects')
      .select('*, users(email)', { count: 'exact' })
      .eq('is_published', true); // Assuming is_published exists in the schema

    // Search functionality
    if (req.query.search) {
      query = query.or(
        `title.ilike.%${req.query.search}%,description.ilike.%${req.query.search}%`
      );
    }

    // Category filter
    if (req.query.category) {
      query = query.eq('category', req.query.category);
    }

    const { data, count, error } = await query
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
      data: data.map((project) => ({
        ...project,
        author: project.users,
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

// @route   GET /api/projects/:slug
// @desc    Get single project by slug
// @access  Public
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
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

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.json({
      success: true,
      data: { ...projects[0], author: projects[0].users },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private (Admin only)
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('title').trim().isLength({ min: 1, max: 200 }),
    body('description').trim().isLength({ min: 1, max: 1000 }),
    body('technologies').optional().isArray(),
    body('category').optional().trim(),
    body('githubUrl').optional().isURL(),
    body('liveUrl').optional().isURL(),
  ],
  upload.single('featuredImage'),
  async (req, res) => {
    try {
      const {
        title,
        description,
        longDescription,
        technologies,
        category,
        demoUrl,
        sourceUrl,
        status,
        isFeatured,
        order,
        isPublished,
      } = req.body;
      const slug = generateSlug(title);

      let featuredImagePublicId = null;
      let featuredImageUrl = null;
      let featuredImageAlt = null;

      // Upload image to Cloudflare R2 if provided
      if (req.file) {
        const result = await uploadToR2(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          'portfolio/projects'
        );
        featuredImagePublicId = result.public_id;
        featuredImageUrl = result.url;
        featuredImageAlt = title; // Default alt text
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            title,
            slug,
            description,
            long_description: longDescription,
            technologies: technologies ? `{${technologies.split(',').map(t => `"${t.trim()}"`).join(',')}}` : null,
            category: category || 'web',
            featured_image_url: featuredImageUrl,
            demo_url: demoUrl,
            source_url: sourceUrl,
            status: status || 'completed',
            is_featured: isFeatured === 'true' || false,
            order: order ? parseInt(order, 10) : 0,
            is_published: isPublished === 'true' || false,
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

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private (Admin only)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  [
    body('title').optional().trim().isLength({ min: 1, max: 200 }),
    body('description').optional().trim().isLength({ min: 1, max: 1000 }),
    body('technologies').optional().isArray(),
    body('category').optional().trim(),
    body('githubUrl').optional().isURL(),
    body('liveUrl').optional().isURL(),
    body('isPublished').optional().isBoolean(),
  ],
  upload.single('featuredImage'),
  async (req, res) => {
    try {
      const { data: existingProjects, error: fetchError } = await supabase
        .from('projects')
        .select('featured_image_url, title, is_published')
        .eq('id', req.params.id);

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
        });
      }

      if (!existingProjects || existingProjects.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      const existingProject = existingProjects[0];

      const {
        title,
        description,
        longDescription,
        technologies,
        category,
        demoUrl,
        sourceUrl,
        status,
        isFeatured,
        order,
        isPublished,
      } = req.body;

      const updatePayload = { updated_at: new Date().toISOString() };
      if (title) {
        updatePayload.title = title;
        updatePayload.slug = generateSlug(title); // Regenerate slug if title changes
      }
      if (description) updatePayload.description = description;
      if (longDescription) updatePayload.long_description = longDescription;
      if (technologies) {
        const techArray = technologies.split(',').map(t => `"${t.trim()}"`);
        updatePayload.technologies = `{${techArray.join(',')}}`;
      }
      if (category) updatePayload.category = category;
      if (demoUrl) updatePayload.demo_url = demoUrl;
      if (sourceUrl) updatePayload.source_url = sourceUrl;
      if (status) updatePayload.status = status;
      if (isFeatured !== undefined) updatePayload.is_featured = isFeatured === 'true';
      if (order !== undefined) updatePayload.order = parseInt(order, 10);
      if (isPublished !== undefined) updatePayload.is_published = isPublished;

      // Upload new image if provided
      if (req.file) {
        // Delete old image from Cloudflare R2
        if (existingProject.featured_image_url) {
          const oldKey = existingProject.featured_image_url.replace(`${process.env.R2_PUBLIC_URL}/`, '');
          await deleteFromR2(oldKey);
        }

        const result = await uploadToR2(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          'portfolio/projects'
        );
        updatePayload.featured_image_url = result.url;
      }

      const { data, error } = await supabase
        .from('projects')
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
          message: 'Project not found',
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

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: existingProjects, error: fetchError } = await supabase
      .from('projects')
      .select('featured_image_url')
      .eq('id', req.params.id);

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    if (!existingProjects || existingProjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const existingProject = existingProjects[0];

    // Delete image from Cloudflare R2
    if (existingProject.featured_image_url) {
      const key = existingProject.featured_image_url.replace(`${process.env.R2_PUBLIC_URL}/`, '');
      await deleteFromR2(key);
    }

    const { error } = await supabase.from('projects').delete().eq('id', req.params.id);

    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/projects/admin/all
// @desc    Get all projects for admin (including unpublished)
// @access  Private (Admin only)
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const rangeFrom = (page - 1) * limit;
    const rangeTo = page * limit - 1;

    const { data, count, error } = await supabase
      .from('projects')
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
      data: data.map((project) => ({
        ...project,
        author: project.users,
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
