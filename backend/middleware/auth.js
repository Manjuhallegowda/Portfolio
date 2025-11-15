import admin from '../config/firebaseAdmin.js';
import supabase from '../config/supabase.js';

// Protect routes - require authentication
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route (no token provided)',
      });
    }

    try {
      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      const { uid } = decodedToken;

      // Get user from database using firebaseUid
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', uid);

      if (error) {
        console.error('Supabase query error:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error during user lookup',
        });
      }

      if (!users || users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found or not registered in backend',
        });
      }

      req.user = users[0]; // Attach the first user found

      next();
    } catch (error) {
      console.error('Firebase ID token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route (invalid Firebase ID token)',
      });
    }
  } catch (error) {
    console.error('Auth middleware server error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid } = decodedToken;
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('firebase_uid', uid);

        if (error) {
          console.error('Supabase query error in optionalAuth:', error);
          req.user = null; // Treat as no user if database error
        } else if (users && users.length > 0) {
          req.user = users[0];
        } else {
          req.user = null;
        }
      } catch (error) {
        // Token is invalid but we don't fail the request
        console.warn('Optional auth: Firebase ID token invalid', error);
        req.user = null;
      }
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Optional auth server error:', error);
    next();
  }
};
