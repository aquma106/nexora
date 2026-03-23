const asyncHandler = require('./asyncHandler');
const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    res.status(401);
    throw new Error('Not authorized to access this route. Please login.');
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401);
      throw new Error('Invalid or expired token. Please login again.');
    }

    // Get user from token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      res.status(401);
      throw new Error('User not found. Please login again.');
    }

    // Check if user is active
    if (!req.user.isActive) {
      res.status(403);
      throw new Error('Your account has been deactivated.');
    }

    // Check if user is approved
    if (req.user.status !== 'approved') {
      res.status(403);
      throw new Error('Your account is not approved yet.');
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized to access this route');
  }
});

// Grant access to specific roles
// Usage: authorize('admin', 'faculty')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('User not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `User role '${req.user.role}' is not authorized to access this route. Required roles: ${roles.join(', ')}`
      );
    }
    next();
  };
};

// Check if user is approved (not pending or rejected)
// Blocks users with status "pending" or "rejected"
const requireApproval = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  if (req.user.status === 'pending') {
    res.status(403);
    throw new Error(
      'Your account is pending approval. You cannot perform this action until an admin approves your account.'
    );
  }

  if (req.user.status === 'rejected') {
    res.status(403);
    throw new Error('Your account registration was rejected. Please contact support.');
  }

  if (req.user.status !== 'approved') {
    res.status(403);
    throw new Error('Your account is not approved. Please contact support.');
  }

  next();
});

// Block pending alumni from specific actions
// This middleware specifically checks for alumni with pending status
const requireAlumniApproval = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  // Only check alumni accounts
  if (req.user.role === 'alumni' && req.user.status === 'pending') {
    res.status(403);
    throw new Error(
      'Alumni accounts must be approved before performing this action. Please wait for admin verification.'
    );
  }

  next();
});

// Restrict actions for pending users (any role)
// Use this for actions like posting jobs, creating mentorship requests, etc.
const restrictPendingUsers = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  if (req.user.status === 'pending') {
    res.status(403);
    throw new Error(
      'Your account is pending approval. You cannot post jobs, send mentorship requests, or perform other actions until approved.'
    );
  }

  if (req.user.status === 'rejected') {
    res.status(403);
    throw new Error('Your account was rejected. Please contact support.');
  }

  next();
});

// Check if user owns the resource
// Usage: checkOwnership('userId') - checks if req.params.id matches req.user._id
// Or: checkOwnership('postedBy') - checks if resource.postedBy matches req.user._id
const checkOwnership = (ownerField = 'userId') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('User not authenticated');
    }

    // If checking URL parameter (like /users/:id)
    if (ownerField === 'userId' && req.params.id) {
      if (req.params.id !== req.user._id.toString()) {
        // Allow admins to bypass ownership check
        if (req.user.role !== 'admin') {
          res.status(403);
          throw new Error('You can only access your own resources');
        }
      }
    }

    next();
  });
};

// Optional authentication - doesn't fail if no token
// Useful for routes that work differently for authenticated vs non-authenticated users
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = await User.findById(decoded.id);
      }
    } catch (error) {
      // Silently fail - user remains unauthenticated
      req.user = null;
    }
  }

  next();
});

module.exports = {
  protect,
  authorize,
  requireApproval,
  requireAlumniApproval,
  restrictPendingUsers,
  checkOwnership,
  optionalAuth,
};
