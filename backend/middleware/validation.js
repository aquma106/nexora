const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware to check for validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
    });
  }
  
  next();
};

/**
 * Sanitize string input - remove HTML tags and trim
 */
const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  return value.replace(/<[^>]*>/g, '').trim();
};

/**
 * Custom validators
 */
const customValidators = {
  isStrongPassword: (value) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(value);
  },
  
  isCollegeEmail: (value) => {
    const collegeEmailPattern = /@(.+\.)?(edu|ac\.|college)/i;
    return collegeEmailPattern.test(value);
  },
  
  isValidLinkedInUrl: (value) => {
    if (!value) return true; // Optional field
    const linkedInPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub|company)\/[a-zA-Z0-9_-]+\/?$/;
    return linkedInPattern.test(value);
  },
  
  isValidYear: (value) => {
    const year = parseInt(value);
    const currentYear = new Date().getFullYear();
    return year >= 1950 && year <= currentYear + 10;
  },
  
  isValidRole: (value) => {
    const validRoles = ['student', 'senior', 'alumni', 'faculty', 'admin'];
    return validRoles.includes(value);
  },
  
  isValidStatus: (value) => {
    const validStatuses = ['pending', 'approved', 'rejected'];
    return validStatuses.includes(value);
  },
  
  isValidObjectId: (value) => {
    return /^[0-9a-fA-F]{24}$/.test(value);
  },
};

/**
 * Validation rules for authentication
 */
const authValidation = {
  register: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces')
      .customSanitizer(sanitizeString),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail()
      .customSanitizer(sanitizeString),
    
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    
    body('role')
      .notEmpty().withMessage('Role is required')
      .custom(customValidators.isValidRole).withMessage('Invalid role'),
    
    body('collegeName')
      .trim()
      .notEmpty().withMessage('College name is required')
      .isLength({ min: 2, max: 100 }).withMessage('College name must be between 2 and 100 characters')
      .customSanitizer(sanitizeString),
    
    body('graduationYear')
      .notEmpty().withMessage('Graduation year is required')
      .isInt().withMessage('Graduation year must be a number')
      .custom(customValidators.isValidYear).withMessage('Invalid graduation year'),
    
    body('linkedinUrl')
      .optional()
      .trim()
      .custom(customValidators.isValidLinkedInUrl).withMessage('Invalid LinkedIn URL')
      .customSanitizer(sanitizeString),
    
    // Custom validation for student email
    body('email').custom((value, { req }) => {
      if (req.body.role === 'student') {
        if (!customValidators.isCollegeEmail(value)) {
          throw new Error('Students must use their college email address');
        }
      }
      return true;
    }),
    
    // Custom validation for alumni LinkedIn
    body('linkedinUrl').custom((value, { req }) => {
      if (req.body.role === 'alumni' && !value) {
        throw new Error('LinkedIn URL is required for alumni');
      }
      return true;
    }),
    
    validate,
  ],
  
  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    
    body('password')
      .notEmpty().withMessage('Password is required'),
    
    validate,
  ],
  
  updatePassword: [
    body('currentPassword')
      .notEmpty().withMessage('Current password is required'),
    
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error('New password must be different from current password');
        }
        return true;
      }),
    
    validate,
  ],
};

/**
 * Validation rules for profiles
 */
const profileValidation = {
  create: [
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters')
      .customSanitizer(sanitizeString),
    
    body('skills')
      .optional()
      .isArray().withMessage('Skills must be an array')
      .custom((value) => {
        if (value && value.length > 50) {
          throw new Error('Maximum 50 skills allowed');
        }
        return true;
      }),
    
    body('skills.*')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 }).withMessage('Each skill must be between 1 and 50 characters')
      .customSanitizer(sanitizeString),
    
    body('location')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Location must not exceed 100 characters')
      .customSanitizer(sanitizeString),
    
    body('socialLinks.linkedin')
      .optional()
      .trim()
      .isURL().withMessage('Invalid LinkedIn URL'),
    
    body('socialLinks.github')
      .optional()
      .trim()
      .isURL().withMessage('Invalid GitHub URL'),
    
    body('socialLinks.portfolio')
      .optional()
      .trim()
      .isURL().withMessage('Invalid portfolio URL'),
    
    validate,
  ],
  
  addProject: [
    body('title')
      .trim()
      .notEmpty().withMessage('Project title is required')
      .isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters')
      .customSanitizer(sanitizeString),
    
    body('description')
      .trim()
      .notEmpty().withMessage('Project description is required')
      .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters')
      .customSanitizer(sanitizeString),
    
    body('technologies')
      .optional()
      .isArray().withMessage('Technologies must be an array'),
    
    body('link')
      .optional()
      .trim()
      .isURL().withMessage('Invalid project link'),
    
    validate,
  ],
};

/**
 * Validation rules for opportunities
 */
const opportunityValidation = {
  create: [
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters')
      .customSanitizer(sanitizeString),
    
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters')
      .customSanitizer(sanitizeString),
    
    body('type')
      .notEmpty().withMessage('Type is required')
      .isIn(['job', 'internship']).withMessage('Type must be either job or internship'),
    
    body('company')
      .trim()
      .notEmpty().withMessage('Company name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters')
      .customSanitizer(sanitizeString),
    
    body('location')
      .trim()
      .notEmpty().withMessage('Location is required')
      .customSanitizer(sanitizeString),
    
    body('locationType')
      .notEmpty().withMessage('Location type is required')
      .isIn(['onsite', 'remote', 'hybrid']).withMessage('Invalid location type'),
    
    body('skills')
      .optional()
      .isArray().withMessage('Skills must be an array'),
    
    body('applicationDeadline')
      .optional()
      .isISO8601().withMessage('Invalid date format')
      .custom((value) => {
        if (new Date(value) < new Date()) {
          throw new Error('Application deadline must be in the future');
        }
        return true;
      }),
    
    validate,
  ],
};

/**
 * Validation rules for applications
 */
const applicationValidation = {
  create: [
    body('opportunityId')
      .notEmpty().withMessage('Opportunity ID is required')
      .custom(customValidators.isValidObjectId).withMessage('Invalid opportunity ID'),
    
    body('coverLetter')
      .trim()
      .notEmpty().withMessage('Cover letter is required')
      .isLength({ min: 50, max: 2000 }).withMessage('Cover letter must be between 50 and 2000 characters')
      .customSanitizer(sanitizeString),
    
    validate,
  ],
};

/**
 * Validation rules for mentorship
 */
const mentorshipValidation = {
  sendRequest: [
    body('receiverId')
      .notEmpty().withMessage('Receiver ID is required')
      .custom(customValidators.isValidObjectId).withMessage('Invalid receiver ID'),
    
    body('message')
      .trim()
      .notEmpty().withMessage('Message is required')
      .isLength({ min: 20, max: 500 }).withMessage('Message must be between 20 and 500 characters')
      .customSanitizer(sanitizeString),
    
    body('mentorshipType')
      .optional()
      .isIn(['career', 'academic', 'technical', 'general']).withMessage('Invalid mentorship type'),
    
    body('duration')
      .optional()
      .isIn(['1-month', '3-months', '6-months', 'ongoing']).withMessage('Invalid duration'),
    
    validate,
  ],
  
  respond: [
    body('response')
      .trim()
      .notEmpty().withMessage('Response message is required')
      .isLength({ min: 10, max: 500 }).withMessage('Response must be between 10 and 500 characters')
      .customSanitizer(sanitizeString),
    
    validate,
  ],
};

/**
 * Validation rules for messages
 */
const messageValidation = {
  send: [
    body('receiverId')
      .notEmpty().withMessage('Receiver ID is required')
      .custom(customValidators.isValidObjectId).withMessage('Invalid receiver ID'),
    
    body('text')
      .trim()
      .notEmpty().withMessage('Message text is required')
      .isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters')
      .customSanitizer(sanitizeString),
    
    validate,
  ],
};

/**
 * Validation rules for admin operations
 */
const adminValidation = {
  updateUser: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
      .customSanitizer(sanitizeString),
    
    body('role')
      .optional()
      .custom(customValidators.isValidRole).withMessage('Invalid role'),
    
    body('status')
      .optional()
      .custom(customValidators.isValidStatus).withMessage('Invalid status'),
    
    validate,
  ],
  
  rejectUser: [
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Reason must not exceed 500 characters')
      .customSanitizer(sanitizeString),
    
    validate,
  ],
};

/**
 * Parameter validation
 */
const paramValidation = {
  objectId: [
    param('id')
      .custom(customValidators.isValidObjectId).withMessage('Invalid ID format'),
    
    validate,
  ],
  
  userId: [
    param('userId')
      .custom(customValidators.isValidObjectId).withMessage('Invalid user ID format'),
    
    validate,
  ],
};

/**
 * Query validation
 */
const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    
    validate,
  ],
  
  search: [
    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Search query must not exceed 100 characters')
      .customSanitizer(sanitizeString),
    
    validate,
  ],
};

module.exports = {
  validate,
  authValidation,
  profileValidation,
  opportunityValidation,
  applicationValidation,
  mentorshipValidation,
  messageValidation,
  adminValidation,
  paramValidation,
  queryValidation,
  customValidators,
};
