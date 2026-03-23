const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

/**
 * Rate Limiting Configuration
 */

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registrations per hour
  message: {
    success: false,
    message: 'Too many accounts created from this IP, please try again after an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again after an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for admin operations
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    success: false,
    message: 'Too many admin requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Security Headers using Helmet
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * Prevent NoSQL Injection
 * Sanitizes user input to prevent MongoDB operator injection
 */
const preventNoSQLInjection = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Potential NoSQL injection attempt detected: ${key}`);
  },
});

/**
 * Prevent XSS Attacks
 * Sanitizes user input to prevent cross-site scripting
 */
const preventXSS = xss();

/**
 * Prevent HTTP Parameter Pollution
 */
const preventHPP = hpp({
  whitelist: [
    'role',
    'status',
    'type',
    'skills',
    'location',
    'page',
    'limit',
    'sort',
  ],
});

/**
 * Custom Security Middleware
 */

// Prevent access to deactivated accounts
const checkAccountStatus = (req, res, next) => {
  if (req.user && !req.user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated. Please contact support.',
    });
  }
  next();
};

// Prevent pending users from accessing certain features
const checkApprovalStatus = (req, res, next) => {
  if (req.user && req.user.status === 'pending') {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending approval. Please wait for admin verification.',
    });
  }
  next();
};

// Prevent rejected users from accessing the system
const checkRejectionStatus = (req, res, next) => {
  if (req.user && req.user.status === 'rejected') {
    return res.status(403).json({
      success: false,
      message: 'Your account has been rejected. Please contact support for more information.',
    });
  }
  next();
};

// Combine all status checks
const checkUserStatus = (req, res, next) => {
  if (!req.user) {
    return next();
  }

  if (!req.user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated. Please contact support.',
    });
  }

  if (req.user.status === 'rejected') {
    return res.status(403).json({
      success: false,
      message: 'Your account has been rejected. Please contact support.',
    });
  }

  next();
};

// Prevent users from performing actions on their own account
const preventSelfAction = (paramName = 'id') => {
  return (req, res, next) => {
    const targetUserId = req.params[paramName];
    
    if (req.user && req.user._id.toString() === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot perform this action on your own account',
      });
    }
    
    next();
  };
};

// Log suspicious activities
const logSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /(\$where|\$regex|\$ne|\$gt|\$lt)/i, // NoSQL injection patterns
    /<script|javascript:|onerror=/i, // XSS patterns
    /(\.\.|\/etc\/passwd|\/bin\/bash)/i, // Path traversal patterns
  ];

  const checkString = JSON.stringify(req.body) + JSON.stringify(req.query);
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      console.warn('Suspicious activity detected:', {
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        query: req.query,
        user: req.user?._id,
        timestamp: new Date().toISOString(),
      });
      break;
    }
  }
  
  next();
};

// Validate content type for POST/PUT requests
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type must be application/json',
      });
    }
  }
  
  next();
};

// Prevent large payloads
const payloadSizeLimit = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = req.get('Content-Length');
    
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024);
      const maxSizeInMB = parseInt(maxSize);
      
      if (sizeInMB > maxSizeInMB) {
        return res.status(413).json({
          success: false,
          message: `Payload too large. Maximum size is ${maxSize}`,
        });
      }
    }
    
    next();
  };
};

module.exports = {
  // Rate limiters
  apiLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  adminLimiter,
  
  // Security middleware
  securityHeaders,
  preventNoSQLInjection,
  preventXSS,
  preventHPP,
  
  // Custom security checks
  checkAccountStatus,
  checkApprovalStatus,
  checkRejectionStatus,
  checkUserStatus,
  preventSelfAction,
  logSuspiciousActivity,
  validateContentType,
  payloadSizeLimit,
};
