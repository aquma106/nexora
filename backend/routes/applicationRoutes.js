const express = require('express');
const router = express.Router();
const {
  applyForOpportunity,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
  getMyApplications,
  getApplicationStats,
} = require('../controllers/applicationController');
const { protect, restrictPendingUsers } = require('../middleware/auth');

// All application routes require authentication

// Get my applications
router.get('/my/applications', protect, getMyApplications);

// Get application statistics
router.get('/stats/overview', protect, getApplicationStats);

// Get all applications (filtered by role)
router.get('/', protect, getApplications);

// Apply for opportunity (must be approved)
router.post('/', protect, restrictPendingUsers, applyForOpportunity);

// Get single application
router.get('/:id', protect, getApplicationById);

// Update application status (poster or admin only)
router.put('/:id/status', protect, updateApplicationStatus);

// Withdraw application (applicant only)
router.delete('/:id', protect, withdrawApplication);

module.exports = router;
