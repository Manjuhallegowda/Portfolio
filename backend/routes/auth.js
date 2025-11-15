import express from 'express';
import admin from '../config/firebaseAdmin.js';
import supabase from '../config/supabase.js'; // Import Supabase client
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Verify Firebase ID token, sync/find local user, and issue backend JWT
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No Firebase ID token provided',
      });
    }

    // 1) Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email: firebaseEmail } = decodedToken;

    if (!uid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Firebase ID token',
      });
    }

    // 2) Find or create the local user linked to this Firebase UID
    let { data: users, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', uid);

    if (findError) {
      console.error('Supabase find user error:', findError);
      return res.status(500).json({
        success: false,
        message: 'Database error during user lookup',
      });
    }

    let user;
    if (!users || users.length === 0) {
      // User not found, create new user
      const { data: newUsers, error: createError } = await supabase
        .from('users')
        .insert([
          {
            email: firebaseEmail || 'no-email@unknown.local',
            firebase_uid: uid,
            role: 'user', // Default role
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
      user = newUsers[0];
    } else {
      user = users[0];
      // keep local email in sync if needed
      if (firebaseEmail && user.email !== firebaseEmail) {
        const { data: updatedUsers, error: updateEmailError } = await supabase
          .from('users')
          .update({ email: firebaseEmail })
          .eq('id', user.id)
          .select('*');
        if (updateEmailError) {
          console.error('Supabase update email error:', updateEmailError);
        } else {
          user = updatedUsers[0];
        }
      }
    }

    // 3) Update last login
    const { data: updatedUsers, error: updateLoginError } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)
      .select('*');

    if (updateLoginError) {
      console.error('Supabase update last_login error:', updateLoginError);
      // Don't necessarily fail the request, but log it
    } else {
      user = updatedUsers[0];
    }

    return res.json({
      success: true,
      user: {
        id: user.id, // Use user.id from Supabase
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid Firebase ID token or server error',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user (uses backend JWT via `protect`)
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      user: {
        id: req.user.id, // Use req.user.id from Supabase
        email: req.user.email,
        role: req.user.role,
        created_at: req.user.created_at, // Use created_at from Supabase
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Client clears token; optional: clear httpOnly cookie if used
 * @access  Public (or Private if you wish)
 */
router.post('/logout', (_req, res) => {
  // If using httpOnly cookie tokens, also clear it here:
  // res.clearCookie('token', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });

  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
