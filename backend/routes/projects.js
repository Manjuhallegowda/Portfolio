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
  upload.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        longDescription,
        technologies,
        category,
        demoUrl,
        githubUrl,
        status,
        isFeatured,
        order,
        isPublished,
      } = req.body;
      const slug = generateSlug(title);

      let featuredImageUrl = null;
      const imageUrls = [];

      // Upload featured image if provided
      if (req.files && req.files.featuredImage) {
        const file = req.files.featuredImage[0];
        const result = await uploadToR2(
          file.buffer,
          file.originalname,
          file.mimetype,
          'portfolio/projects'
        );
        featuredImageUrl = result.url;
      }

      // Upload gallery images if provided
      if (req.files && req.files.images) {
        for (const file of req.files.images) {
          const result = await uploadToR2(
            file.buffer,
            file.originalname,
            file.mimetype,
            'portfolio/projects'
          );
          imageUrls.push(result.url);
        }
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            title,
            slug,
            description,
            long_description: longDescription,
            technologies: technologies
              ? `{${technologies
                  .split(',')
                  .map((t) => `"${t.trim()}"`)
                  .join(',')}}`
              : null,
            category: category || 'web',
            featured_image_url: featuredImageUrl,
            images:
              imageUrls.length > 0
                ? `{${imageUrls.map((url) => `"${url}"`).join(',')}}`
                : null,
            demo_url: demoUrl,
            github_url: githubUrl,
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
  upload.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { data: existingProjects, error: fetchError } = await supabase
        .from('projects')
        .select('featured_image_url, images, title, is_published')
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
        github_url,
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
        const techArray = technologies.split(',').map((t) => `"${t.trim()}"`);
        updatePayload.technologies = `{${techArray.join(',')}}`;
      }
      if (category) updatePayload.category = category;
      if (demoUrl) updatePayload.demo_url = demoUrl;
      if (github_url) updatePayload.github_url = github_url;
      if (status) updatePayload.status = status;
      if (isFeatured !== undefined)
        updatePayload.is_featured = isFeatured === 'true';
      if (order !== undefined) updatePayload.order = parseInt(order, 10);
      if (isPublished !== undefined) updatePayload.is_published = isPublished;

      // Upload new featured image if provided
      if (req.files && req.files.featuredImage) {
        // Delete old featured image from Cloudflare R2
        if (existingProject.featured_image_url) {
          const oldKey = existingProject.featured_image_url.replace(
            `${process.env.R2_PUBLIC_URL}/`,
            ''
          );
          await deleteFromR2(oldKey);
        }

        const file = req.files.featuredImage[0];
        const result = await uploadToR2(
          file.buffer,
          file.originalname,
          file.mimetype,
          'portfolio/projects'
        );
        updatePayload.featured_image_url = result.url;
      }

      // Upload new gallery images if provided
      if (req.files && req.files.images) {
        // Delete old gallery images from Cloudflare R2
        if (existingProject.images && existingProject.images.length > 0) {
          for (const imageUrl of existingProject.images) {
            const oldKey = imageUrl.replace(
              `${process.env.R2_PUBLIC_URL}/`,
              ''
            );
            await deleteFromR2(oldKey);
          }
        }

        const imageUrls = [];
        for (const file of req.files.images) {
          const result = await uploadToR2(
            file.buffer,
            file.originalname,
            file.mimetype,
            'portfolio/projects'
          );
          imageUrls.push(result.url);
        }
        updatePayload.images = `{${imageUrls
          .map((url) => `"${url}"`)
          .join(',')}}`;
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
      .select('featured_image_url, images')
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

    // Delete featured image from Cloudflare R2
    if (existingProject.featured_image_url) {
      const key = existingProject.featured_image_url.replace(
        `${process.env.R2_PUBLIC_URL}/`,
        ''
      );
      await deleteFromR2(key);
    }

    // Delete gallery images from Cloudflare R2
    if (existingProject.images && existingProject.images.length > 0) {
      for (const imageUrl of existingProject.images) {
        const key = imageUrl.replace(`${process.env.R2_PUBLIC_URL}/`, '');
        await deleteFromR2(key);
      }
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id);

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
