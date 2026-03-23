const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updatePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authValidation } = require('../middleware/validation');
const { authLimiter, registerLimiter, checkUserStatus } = require('../middleware/security');

// Public routes with rate limiting and validation
router.post('/register', registerLimiter, authValidation.register, register);
router.post('/login', authLimiter, authValidation.login, login);

// Protected routes with user status checks
router.get('/me', protect, checkUserStatus, getMe);
router.put('/updatepassword', protect, checkUserStatus, authValidation.updatePassword, updatePassword);

module.exports = router;
