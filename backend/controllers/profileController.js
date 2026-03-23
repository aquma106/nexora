const asyncHandler = require('../middleware/asyncHandler');
const Profile = require('../models/Profile');
const User = require('../models/User');

// @desc    Get all profiles with search and filters
// @route   GET /api/profiles
// @access  Public
const getProfiles = asyncHandler(async (req, res) => {
  const {
    search,
    skills,
    role,
    graduationYear,
    collegeName,
    page = 1,
    limit = 10,
  } = req.query;

  // Build query
  const query = {};

  // Search by name or bio (join with User model)
  let userQuery = {};
  if (search) {
    userQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (role) {
    userQuery.role = role;
  }

  if (graduationYear) {
    userQuery.graduationYear = parseInt(graduationYear);
  }

  if (collegeName) {
    userQuery.collegeName = { $regex: collegeName, $options: 'i' };
  }

  // Get matching user IDs
  let userIds = [];
  if (Object.keys(userQuery).length > 0) {
    const users = await User.find(userQuery).select('_id');
    userIds = users.map((user) => user._id);
    query.userId = { $in: userIds };
  }

  // Filter by skills
  if (skills) {
    const skillsArray = skills.split(',').map((skill) => skill.trim());
    query.skills = { $in: skillsArray.map((s) => new RegExp(s, 'i')) };
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const profiles = await Profile.find(query)
    .populate('userId', 'name email role collegeName graduationYear linkedinUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Get total count
  const total = await Profile.countDocuments(query);

  res.status(200).json({
    success: true,
    count: profiles.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: profiles,
  });
});

// @desc    Get profile by user ID
// @route   GET /api/profiles/user/:userId
// @access  Public
const getProfileByUserId = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ userId: req.params.userId }).populate(
    'userId',
    'name email role collegeName graduationYear linkedinUrl'
  );

  if (!profile) {
    res.status(404);
    throw new Error('Profile not found');
  }

  res.status(200).json({
    success: true,
    data: profile,
  });
});

// @desc    Get profile by profile ID
// @route   GET /api/profiles/:id
// @access  Public
const getProfileById = asyncHandler(async (req, res) => {
  const profile = await Profile.findById(req.params.id).populate(
    'userId',
    'name email role collegeName graduationYear linkedinUrl'
  );

  if (!profile) {
    res.status(404);
    throw new Error('Profile not found');
  }

  res.status(200).json({
    success: true,
    data: profile,
  });
});

// @desc    Create user profile
// @route   POST /api/profiles
// @access  Private
const createProfile = asyncHandler(async (req, res) => {
  // Check if profile already exists for this user
  const existingProfile = await Profile.findOne({ userId: req.user._id });

  if (existingProfile) {
    res.status(400);
    throw new Error('Profile already exists for this user. Use update instead.');
  }

  // Create profile
  const profile = await Profile.create({
    userId: req.user._id,
    ...req.body,
  });

  // Populate user data
  await profile.populate('userId', 'name email role collegeName graduationYear linkedinUrl');

  res.status(201).json({
    success: true,
    data: profile,
    message: 'Profile created successfully',
  });
});

// @desc    Update user profile
// @route   PUT /api/profiles/:id
// @access  Private (Own profile only)
const updateProfile = asyncHandler(async (req, res) => {
  let profile = await Profile.findById(req.params.id);

  if (!profile) {
    res.status(404);
    throw new Error('Profile not found');
  }

  // Check ownership (only user can update their own profile, or admin)
  if (profile.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You can only update your own profile');
  }

  // Update profile
  profile = await Profile.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('userId', 'name email role collegeName graduationYear linkedinUrl');

  res.status(200).json({
    success: true,
    data: profile,
    message: 'Profile updated successfully',
  });
});

// @desc    Update own profile (by authenticated user)
// @route   PUT /api/profiles/me
// @access  Private
const updateMyProfile = asyncHandler(async (req, res) => {
  let profile = await Profile.findOne({ userId: req.user._id });

  if (!profile) {
    res.status(404);
    throw new Error('Profile not found. Please create a profile first.');
  }

  // Update profile
  profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  ).populate('userId', 'name email role collegeName graduationYear linkedinUrl');

  res.status(200).json({
    success: true,
    data: profile,
    message: 'Profile updated successfully',
  });
});

// @desc    Get own profile
// @route   GET /api/profiles/me
// @access  Private
const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user._id }).populate(
    'userId',
    'name email role collegeName graduationYear linkedinUrl'
  );

  if (!profile) {
    res.status(404);
    throw new Error('Profile not found. Please create a profile first.');
  }

  res.status(200).json({
    success: true,
    data: profile,
  });
});

// @desc    Delete profile
// @route   DELETE /api/profiles/:id
// @access  Private (Own profile or admin)
const deleteProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findById(req.params.id);

  if (!profile) {
    res.status(404);
    throw new Error('Profile not found');
  }

  // Check ownership
  if (profile.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You can only delete your own profile');
  }

  await profile.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Profile deleted successfully',
  });
});

// @desc    Add project to profile
// @route   POST /api/profiles/me/projects
// @access  Private
const addProject = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user._id });

  if (!profile) {
    res.status(404);
    throw new Error('Profile not found. Please create a profile first.');
  }

  profile.projects.push(req.body);
  await profile.save();

  res.status(200).json({
    success: true,
    data: profile,
    message: 'Project added successfully',
  });
});

// @desc    Add experience to profile
// @route   POST /api/profiles/me/experience
// @access  Private
const addExperience = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user._id });

  if (!profile) {
    res.status(404);
    throw new Error('Profile not found. Please create a profile first.');
  }

  profile.experience.push(req.body);
  await profile.save();

  res.status(200).json({
    success: true,
    data: profile,
    message: 'Experience added successfully',
  });
});

// @desc    Add education to profile
// @route   POST /api/profiles/me/education
// @access  Private
const addEducation = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user._id });

  if (!profile) {
    res.status(404);
    throw new Error('Profile not found. Please create a profile first.');
  }

  profile.education.push(req.body);
  await profile.save();

  res.status(200).json({
    success: true,
    data: profile,
    message: 'Education added successfully',
  });
});

// @desc    Search profiles by skills
// @route   GET /api/profiles/search/skills
// @access  Public
const searchBySkills = asyncHandler(async (req, res) => {
  const { skills } = req.query;

  if (!skills) {
    res.status(400);
    throw new Error('Please provide skills to search');
  }

  const skillsArray = skills.split(',').map((skill) => skill.trim());

  const profiles = await Profile.find({
    skills: { $in: skillsArray.map((s) => new RegExp(s, 'i')) },
  })
    .populate('userId', 'name email role collegeName graduationYear linkedinUrl')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: profiles.length,
    data: profiles,
  });
});

module.exports = {
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
};
