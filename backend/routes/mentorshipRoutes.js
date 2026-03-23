const express = require('express');
const router = express.Router();
const {
  sendMentorshipRequest,
  getMentorshipRequests,
  getMentorshipRequestById,
  respondToMentorshipRequest,
  cancelMentorshipRequest,
  getMentorshipStats,
  getAvailableMentors,
} = require('../controllers/mentorshipController');
const { protect, restrictPendingUsers } = require('../middleware/auth');

// All mentorship routes require authentication
// Pending users are blocked from mentorship actions

// Get available mentors
router.get('/mentors', protect, getAvailableMentors);

// Get mentorship statistics
router.get('/stats', protect, getMentorshipStats);

// Get all mentorship requests (sent and received)
router.get('/', protect, getMentorshipRequests);

// Send mentorship request (students only, must be approved)
router.post('/', protect, restrictPendingUsers, sendMentorshipRequest);

// Get single mentorship request
router.get('/:id', protect, getMentorshipRequestById);

// Respond to mentorship request (seniors/alumni/faculty only, must be approved)
router.put('/:id/respond', protect, restrictPendingUsers, respondToMentorshipRequest);

// Cancel mentorship request (sender only)
router.delete('/:id', protect, cancelMentorshipRequest);

module.exports = router;
