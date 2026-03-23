const express = require('express');
const router = express.Router();
const {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getMyOpportunities,
  closeOpportunity,
  getOpportunityStats,
} = require('../controllers/opportunityController');
const { protect, authorize, restrictPendingUsers } = require('../middleware/auth');

// Public routes
router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);

// Protected routes - require authentication and approval
router.get('/my/posted', protect, getMyOpportunities);
router.get('/stats/overview', protect, getOpportunityStats);

// Create opportunity - only seniors, alumni, faculty, admin (must be approved)
router.post(
  '/',
  protect,
  restrictPendingUsers,
  authorize('senior', 'alumni', 'faculty', 'admin'),
  createOpportunity
);

// Update/delete opportunity - owner or admin
router.put('/:id', protect, restrictPendingUsers, updateOpportunity);
router.delete('/:id', protect, deleteOpportunity);
router.put('/:id/close', protect, closeOpportunity);

module.exports = router;
