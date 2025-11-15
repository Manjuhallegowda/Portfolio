import express from 'express';
import supabase from '../config/supabase.js'; // Import Supabase client
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/sections
// @desc    Get all sections
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { data: sections, error } = await supabase
      .from('sections')
      .select('*, users(email)');

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    res.json({
      success: true,
      data: sections.map((section) => ({
        ...section,
        author: section.users,
      })),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/sections/:name
// @desc    Get a single section by name
// @access  Public
router.get('/:name', async (req, res) => {
  try {
    const { data: sections, error } = await supabase
      .from('sections')
      .select('*, users(email)')
      .eq('name', req.params.name);

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    let section = sections && sections.length > 0 ? sections[0] : null;

    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: 'Section not found' });
    }

    res.json({ ...section, author: section.users });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/sections
// @desc    Create a new section
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  const {
    name,
    page,
    title,
    subtitle,
    content,
    images,
    videos,
    links,
    order,
    isPublished,
    metadata,
  } = req.body;

  try {
    const { data, error } = await supabase
      .from('sections')
      .insert([
        {
          name,
          page,
          title,
          subtitle,
          content,
          images,
          videos,
          links,
          order,
          is_published: isPublished,
          metadata,
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

    res
      .status(201)
      .json({ success: true, data: { ...data[0], author: data[0].users } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/sections/:id
// @desc    Update a section
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const {
    name,
    page,
    title,
    subtitle,
    content,
    images,
    videos,
    links,
    order,
    isPublished,
    metadata,
  } = req.body;

  const updatePayload = { updated_at: new Date().toISOString() };
  if (name) updatePayload.name = name;
  if (page) updatePayload.page = page;
  if (title) updatePayload.title = title;
  if (subtitle) updatePayload.subtitle = subtitle;
  if (content) updatePayload.content = content;
  if (images) updatePayload.images = images;
  if (videos) updatePayload.videos = videos;
  if (links) updatePayload.links = links;
  if (order !== undefined) updatePayload.order = order;
  if (isPublished !== undefined) updatePayload.is_published = isPublished;
  if (metadata) updatePayload.metadata = metadata;
  updatePayload.author_id = req.user.id; // Update author on modification

  try {
    const { data, error } = await supabase
      .from('sections')
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
      return res
        .status(404)
        .json({ success: false, message: 'Section not found' });
    }

    res.json({ success: true, data: { ...data[0], author: data[0].users } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/sections/:id
// @desc    Delete a section
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('sections')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    res.json({ success: true, message: 'Section removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
