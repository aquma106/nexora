const express = require('express');
const router = express.Router();
const {
  getProfiles,
  getProfileByUserId,
  getProfileById,
  createProfile,
  updateProfile,
  updateMyProfile,
  getMyProfile,
  deleteProfile,
  addProject,
  addExperience,
  addEducation,
  searchBySkills,
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getProfiles);
router.get('/search/skills', searchBySkills);
router.get('/user/:userId', getProfileByUserId);
router.get('/:id', getProfileById);

// Protected routes - Own profile management
router.get('/me/profile', protect, getMyProfile);
router.post('/', protect, createProfile);
router.put('/me', protect, updateMyProfile);
router.post('/me/projects', protect, addProject);
router.post('/me/experience', protect, addExperience);
router.post('/me/education', protect, addEducation);

// Protected routes - Update/delete by ID (ownership checked in controller)
router.put('/:id', protect, updateProfile);
router.delete('/:id', protect, deleteProfile);

module.exports = router;
