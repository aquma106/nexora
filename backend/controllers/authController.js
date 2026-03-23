const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, collegeName, graduationYear, linkedinUrl } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Validate required fields
  if (!name || !email || !password || !role || !collegeName || !graduationYear) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Validate role
  const validRoles = ['student', 'senior', 'alumni', 'faculty', 'admin'];
  if (!validRoles.includes(role)) {
    res.status(400);
    throw new Error('Invalid role specified');
  }

  // Student-specific validation: Must use college email
  if (role === 'student') {
    const collegeEmailPattern = /@(.+\.)?(edu|ac\.|college)/i;
    if (!collegeEmailPattern.test(email)) {
      res.status(400);
      throw new Error('Students must register using their college email address');
    }
  }

  // Alumni-specific validation
  if (role === 'alumni') {
    if (!linkedinUrl) {
      res.status(400);
      throw new Error('Alumni must provide LinkedIn URL');
    }
    if (!graduationYear) {
      res.status(400);
      throw new Error('Alumni must provide graduation year');
    }
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    collegeName,
    graduationYear,
    linkedinUrl: linkedinUrl || undefined,
    status: role === 'alumni' ? 'pending' : 'approved',
  });

  // Generate JWT token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      collegeName: user.collegeName,
      graduationYear: user.graduationYear,
      linkedinUrl: user.linkedinUrl,
      token,
    },
    message: role === 'alumni' 
      ? 'Registration successful. Your account is pending approval.' 
      : 'Registration successful',
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find user by email (include password field)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Please contact support.');
  }

  // Check if user is approved (for alumni)
  if (user.status === 'rejected') {
    res.status(403);
    throw new Error('Your account registration was rejected. Please contact support.');
  }

  if (user.status === 'pending') {
    res.status(403);
    throw new Error('Your account is pending approval. Please wait for admin verification.');
  }

  // Verify password
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      collegeName: user.collegeName,
      graduationYear: user.graduationYear,
      linkedinUrl: user.linkedinUrl,
      token,
    },
    message: 'Login successful',
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current password and new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  await user.save();

  // Generate new token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    data: {
      token,
    },
    message: 'Password updated successfully',
  });
});

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
};
