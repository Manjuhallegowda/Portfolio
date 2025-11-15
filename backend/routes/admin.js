import express from 'express';
import admin from '../config/firebaseAdmin.js'; // Firebase Admin SDK
import supabase from '../config/supabase.js'; // Import Supabase client
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// -------------------------------------------------------------------------------------------------
// POST /api/admin/setup
// One-time admin creation.
// Creates a Firebase Auth user (email/password) and a local User with role 'admin' + firebaseUid.
// IMPORTANT: Disable/remove this route after initial setup in production.
// -------------------------------------------------------------------------------------------------
router.post('/setup', async (req, res) => {
  try {
    // Dev fallback: allow a mock admin when there is no DB or in test env.
    // This part is now less relevant as we always expect Supabase.
    // Keeping it simple for now, assuming Supabase is always available.

    // Production path: real DB present — create admin in Firebase + local DB.
    const { count: adminCount, error: countError } = await supabase
      .from('users')
      .select('count', { count: 'exact' })
      .eq('role', 'admin');

    if (countError) {
      console.error('Supabase count admin error:', countError);
      return res.status(500).json({
        success: false,
        message: 'Database error during admin count',
      });
    }

    if (adminCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists. Use login instead.',
      });
    }

    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // 1) Create (or fetch) Firebase user so frontend can sign in and get an ID token.
    let fbUser;
    try {
      fbUser = await admin.auth().createUser({ email, password });
    } catch (err) {
      if (
        err.code === 'auth/email-already-exists' ||
        err.message?.includes('already exists')
      ) {
        fbUser = await admin.auth().getUserByEmail(email);
      } else {
        console.error('Firebase createUser error:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to create Firebase user',
          error: err.message,
        });
      }
    }

    // 2) Create the local admin linked to the Firebase UID.
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          email,
          role: 'admin',
          firebase_uid: fbUser.uid, // Use firebase_uid
        },
      ])
      .select('*');

    if (createError) {
      console.error('Supabase create user error:', createError);
      return res.status(500).json({
        success: false,
        message: 'Database error during user creation',
      });
    }

    // We do NOT return a backend JWT here. The intended flow is:
    // - Frontend signs in with Firebase (email/password) -> gets Firebase ID token
    // - Frontend calls /api/auth/login with that ID token
    // - Backend verifies token and (recommendation) issues a backend JWT for protect()
    return res.status(201).json({
      success: true,
      message:
        'Admin created. Sign in using Firebase email/password, then call /api/auth/login to receive a backend JWT.',
      data: {
        id: newUser[0].id, // Use id
        email: newUser[0].email,
        role: newUser[0].role,
      },
    });
  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// All routes below require admin access
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    const [
      { count: totalUsers, error: errUsers },
      { count: totalBlogs, error: errBlogs },
      { count: publishedBlogs, error: errPublishedBlogs },
      { count: totalProjects, error: errProjects },
      { count: publishedProjects, error: errPublishedProjects },
      { count: totalContacts, error: errContacts },
      { count: unreadContacts, error: errUnreadContacts },
      { count: totalAchievements, error: errAchievements },
      { count: publishedAchievements, error: errPublishedAchievements },
      { count: totalSections, error: errSections },
      { count: publishedSections, error: errPublishedSections },
    ] = await Promise.all([
      supabase.from('users').select('count', { count: 'exact' }),
      supabase.from('blogs').select('count', { count: 'exact' }),
      supabase.from('blogs').select('count', { count: 'exact' }).eq('is_published', true),
      supabase.from('projects').select('count', { count: 'exact' }),
      supabase.from('projects').select('count', { count: 'exact' }).eq('is_published', true),
      supabase.from('contacts').select('count', { count: 'exact' }),
      supabase.from('contacts').select('count', { count: 'exact' }).eq('is_read', false),
      supabase.from('achievements').select('count', { count: 'exact' }),
      supabase.from('achievements').select('count', { count: 'exact' }).eq('is_published', true),
      supabase.from('sections').select('count', { count: 'exact' }),
      supabase.from('sections').select('count', { count: 'exact' }).eq('is_published', true),
    ]);

    if (errUsers || errBlogs || errPublishedBlogs || errProjects || errPublishedProjects || errContacts || errUnreadContacts || errAchievements || errPublishedAchievements || errSections || errPublishedSections) {
      console.error('Supabase count error:', errUsers || errBlogs || errPublishedBlogs || errProjects || errPublishedProjects || errContacts || errUnreadContacts || errAchievements || errPublishedAchievements || errSections || errPublishedSections);
      return res.status(500).json({ success: false, message: 'Database error fetching counts' });
    }

    const { data: recentBlogs, error: recentBlogsError } = await supabase
      .from('blogs')
      .select('title, is_published, created_at, users(email)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentBlogsError) {
      console.error('Supabase recent blogs error:', recentBlogsError);
      return res.status(500).json({ success: false, message: 'Database error fetching recent blogs' });
    }

    const { data: recentContacts, error: recentContactsError } = await supabase
      .from('contacts')
      .select('name, email, subject, is_read, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentContactsError) {
      console.error('Supabase recent contacts error:', recentContactsError);
      return res.status(500).json({ success: false, message: 'Database error fetching recent contacts' });
    }

    return res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalBlogs,
          publishedBlogs,
          totalProjects,
          publishedProjects,
          totalContacts,
          unreadContacts,
          totalAchievements,
          publishedAchievements,
          totalSections,
          publishedSections,
        },
        recentActivity: {
          blogs: recentBlogs.map(blog => ({ ...blog, author: blog.users })),
          contacts: recentContacts,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const rangeFrom = (page - 1) * limit;
    const rangeTo = page * limit - 1;

    const { data: users, count, error } = await supabase
      .from('users')
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

    return res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user or admin',
      });
    }

    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id);

    if (fetchError) {
      console.error('Supabase fetch user error:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    if (!existingUsers || existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ role: role, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('*');

    if (updateError) {
      console.error('Supabase update user role error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    return res.json({
      success: true,
      data: {
        id: updatedUser[0].id,
        email: updatedUser[0].email,
        role: updatedUser[0].role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id);

    if (fetchError) {
      console.error('Supabase fetch user error:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    if (!existingUsers || existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = existingUsers[0];

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const { count: adminCount, error: countError } = await supabase
        .from('users')
        .select('count', { count: 'exact' })
        .eq('role', 'admin');

      if (countError) {
        console.error('Supabase count admin error:', countError);
        return res.status(500).json({
          success: false,
          message: 'Database error during admin count',
        });
      }

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user',
        });
      }
    }

    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) {
      console.error('Supabase delete user error:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Database error',
      });
    }

    return res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

export default router;
