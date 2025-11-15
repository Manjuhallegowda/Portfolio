import express from 'express';
import { body } from 'express-validator';
import supabase from '../config/supabase.js'; // Import Supabase client
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/contact
// @desc    Get all contact messages
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const rangeFrom = (page - 1) * limit;
    const rangeTo = page * limit - 1;

    const { data, count, error } = await supabase
      .from('contacts')
      .select('*', { count: 'exact' })
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
      data: data,
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

// @route   GET /api/contact/:id
// @desc    Get single contact message
// @access  Private (Admin only)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', req.params.id);

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    res.json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/contact
// @desc    Create a new contact message
// @access  Public
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('subject').trim().isLength({ min: 1, max: 200 }),
    body('message').trim().isLength({ min: 1, max: 2000 }),
  ],
  async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      const { data, error } = await supabase.from('contacts').insert([
        {
          name,
          email,
          subject,
          message,
        },
      ]).select('*');

      if (error) {
        console.error('Supabase insert error:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error',
        });
      }

      res.status(201).json({
        success: true,
        data: data[0],
        message: 'Contact message sent successfully',
      });
    } catch (error) {
      console.error(error);
      if (error.name === 'ValidationError') { // This error type is from express-validator, not Supabase
        const messages = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: messages,
        });
      }
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// @route   PUT /api/contact/:id
// @desc    Update contact message (mark as read/unread)
// @access  Private (Admin only)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  [body('isRead').optional().isBoolean()],
  async (req, res) => {
    try {
      const { data: existingContacts, error: fetchError } = await supabase
        .from('contacts')
        .select('id')
        .eq('id', req.params.id);

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
        });
      }

      if (!existingContacts || existingContacts.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Contact message not found',
        });
      }

      const { isRead } = req.body;

      const updatePayload = { updated_at: new Date().toISOString() };
      if (isRead !== undefined) {
        updatePayload.is_read = isRead;
      }

      const { data, error } = await supabase
        .from('contacts')
        .update(updatePayload)
        .eq('id', req.params.id)
        .select('*');

      if (error) {
        console.error('Supabase update error:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error',
        });
      }

      res.json({
        success: true,
        data: data[0],
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

// @route   DELETE /api/contact/:id
// @desc    Delete a contact message
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: existingContacts, error: fetchError } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', req.params.id);

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    if (!existingContacts || existingContacts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    const { error } = await supabase.from('contacts').delete().eq('id', req.params.id);

    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    res.json({
      success: true,
      message: 'Contact message deleted successfully',
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
