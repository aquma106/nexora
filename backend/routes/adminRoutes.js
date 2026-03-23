const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  getPendingAlumni,
  approveUser,
  rejectUser,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
  getDashboardStats,
  getRecentUsers,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard statistics
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/recent', getRecentUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Alumni verification queue
router.get('/alumni/pending', getPendingAlumni);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/reject', rejectUser);

// Account activation/deactivation
router.put('/users/:id/activate', activateUser);
router.put('/users/:id/deactivate', deactivateUser);

module.exports = router;
