import express from 'express';
import { body } from 'express-validator';
import supabase from '../config/supabase.js'; // Import Supabase client
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/achievements
// @desc    Get all published achievements
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*, users(email)') // Join with users table to get author email
      .eq('is_published', true)
      .order('order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    res.json({
      success: true,
      data: data.map((achievement) => ({
        ...achievement,
        author: achievement.users, // Map users object to author
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/achievements
// @desc    Create a new achievement
// @access  Private (Admin only)
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('icon')
      .optional()
      .isIn([
        'award',
        'briefcase',
        'globe',
        'trending-up',
        'code',
        'users',
        'star',
        'target',
        'cloud',
        'palette',
        'settings',
      ]),
    body('category')
      .optional()
      .isIn([
        'skills',
        'experience',
        'achievements',
        'certifications',
        'other',
      ]),
    body('order').optional().isNumeric(),
  ],
  async (req, res) => {
    try {
      const { title, description, items, icon, category, order } = req.body;

      const { data, error } = await supabase
        .from('achievements')
        .insert([
          {
            title,
            description,
            items: items || [],
            icon: icon || 'award',
            category: category || 'skills',
            order: order || 0,
            author_id: req.user.id, // Use req.user.id for author_id
            is_published: false,
          },
        ])
        .select('*, users(email)'); // Select the newly created achievement and join with users

      if (error) {
        console.error('Supabase insert error:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error',
        });
      }

      res.status(201).json({
        success: true,
        data: { ...data[0], author: data[0].users }, // Map users object to author
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

// @route   PUT /api/achievements/:id
// @desc    Update an achievement
// @access  Private (Admin only)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  [
    body('title').optional().trim().isLength({ min: 1, max: 100 }),
    body('description').optional().trim().isLength({ min: 1, max: 500 }),
    body('items').optional().isArray(),
    body('icon')
      .optional()
      .isIn([
        'award',
        'briefcase',
        'globe',
        'trending-up',
        'code',
        'users',
        'star',
        'target',
        'cloud',
        'palette',
        'settings',
      ]),
    body('category')
      .optional()
      .isIn([
        'skills',
        'experience',
        'achievements',
        'certifications',
        'other',
      ]),
    body('order').optional().isNumeric(),
    body('isPublished').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const { title, description, items, icon, category, order, isPublished } =
        req.body;

      const updatePayload = { updated_at: new Date().toISOString() };
      if (title) updatePayload.title = title;
      if (description) updatePayload.description = description;
      if (items) updatePayload.items = items;
      if (icon) updatePayload.icon = icon;
      if (category) updatePayload.category = category;
      if (order !== undefined) updatePayload.order = order;
      if (isPublished !== undefined) updatePayload.is_published = isPublished;

      const { data, error } = await supabase
        .from('achievements')
        .update(updatePayload)
        .eq('id', req.params.id)
        .select('*, users(email)'); // Select the updated achievement and join with users

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
          message: 'Achievement not found',
        });
      }

      res.json({
        success: true,
        data: { ...data[0], author: data[0].users }, // Map users object to author
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

// @route   DELETE /api/achievements/:id
// @desc    Delete an achievement
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('achievements')
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
      message: 'Achievement deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/achievements/admin/all
// @desc    Get all achievements for admin (including unpublished)
// @access  Private (Admin only)
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const rangeFrom = (page - 1) * limit;
    const rangeTo = page * limit - 1;

    const { data, count, error } = await supabase
      .from('achievements')
      .select('*, users(email)', { count: 'exact' }) // Join and get exact count
      .order('order', { ascending: true })
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
      data: data.map((achievement) => ({
        ...achievement,
        author: achievement.users,
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
