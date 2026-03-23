// Central export file for all middleware
const asyncHandler = require('./asyncHandler');
const { errorHandler, notFound } = require('./errorHandler');
const logger = require('./logger');
const {
  protect,
  authorize,
  requireApproval,
  requireAlumniApproval,
  restrictPendingUsers,
  checkOwnership,
  optionalAuth,
} = require('./auth');

module.exports = {
  // Async handler
  asyncHandler,
  
  // Error handling
  errorHandler,
  notFound,
  
  // Logging
  logger,
  
  // Authentication & Authorization
  protect,
  authorize,
  requireApproval,
  requireAlumniApproval,
  restrictPendingUsers,
  checkOwnership,
  optionalAuth,
};
