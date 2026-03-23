const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const MentorshipRequest = require('../models/MentorshipRequest');
const Message = require('../models/Message');

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const {
    role,
    status,
    search,
    collegeName,
    graduationYear,
    page = 1,
    limit = 20,
  } = req.query;

  // Build query
  const query = {};

  if (role) {
    query.role = role;
  }

  if (status) {
    query.status = status;
  }

  if (collegeName) {
    query.collegeName = { $regex: collegeName, $options: 'i' };
  }

  if (graduationYear) {
    query.graduationYear = parseInt(graduationYear);
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: users,
  });
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get user's profile
  const profile = await Profile.findOne({ userId: user._id });

  // Get user statistics
  const opportunitiesPosted = await Opportunity.countDocuments({
    postedBy: user._id,
  });
  const applicationsSubmitted = await Application.countDocuments({
    userId: user._id,
  });
  const mentorshipRequestsSent = await MentorshipRequest.countDocuments({
    sender: user._id,
  });
  const mentorshipRequestsReceived = await MentorshipRequest.countDocuments({
    receiver: user._id,
  });

  res.status(200).json({
    success: true,
    data: {
      user,
      profile,
      statistics: {
        opportunitiesPosted,
        applicationsSubmitted,
        mentorshipRequestsSent,
        mentorshipRequestsReceived,
      },
    },
  });
});

// @desc    Get alumni verification queue (pending alumni)
// @route   GET /api/admin/alumni/pending
// @access  Private (Admin only)
const getPendingAlumni = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const pendingAlumni = await User.find({
    role: 'alumni',
    status: 'pending',
  })
    .select('-password')
    .sort({ createdAt: 1 }) // Oldest first (FIFO)
    .skip(skip)
    .limit(limitNum);

  const total = await User.countDocuments({
    role: 'alumni',
    status: 'pending',
  });

  res.status(200).json({
    success: true,
    count: pendingAlumni.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: pendingAlumni,
  });
});

// @desc    Approve alumni
// @route   PUT /api/admin/users/:id/approve
// @access  Private (Admin only)
const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user is pending
  if (user.status !== 'pending') {
    res.status(400);
    throw new Error(`User status is already ${user.status}`);
  }

  // Update status to approved
  user.status = 'approved';
  await user.save();

  res.status(200).json({
    success: true,
    data: user,
    message: `${user.role} ${user.name} has been approved`,
  });
});

// @desc    Reject alumni
// @route   PUT /api/admin/users/:id/reject
// @access  Private (Admin only)
const rejectUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user is pending
  if (user.status !== 'pending') {
    res.status(400);
    throw new Error(`User status is already ${user.status}`);
  }

  // Update status to rejected
  user.status = 'rejected';
  await user.save();

  res.status(200).json({
    success: true,
    data: user,
    message: `${user.role} ${user.name} has been rejected`,
    reason: reason || 'No reason provided',
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update user (excluding password)
  const { password, ...updateData } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: updatedUser,
    message: 'User updated successfully',
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent deleting yourself
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }

  // Delete user's related data
  await Profile.deleteOne({ userId: user._id });
  await Opportunity.deleteMany({ postedBy: user._id });
  await Application.deleteMany({ userId: user._id });
  await MentorshipRequest.deleteMany({
    $or: [{ sender: user._id }, { receiver: user._id }],
  });
  await Message.deleteMany({
    $or: [{ sender: user._id }, { receiver: user._id }],
  });

  // Delete user
  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'User and all related data deleted successfully',
  });
});

// @desc    Deactivate user account
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private (Admin only)
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent deactivating yourself
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot deactivate your own account');
  }

  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    data: user,
    message: 'User account deactivated successfully',
  });
});

// @desc    Activate user account
// @route   PUT /api/admin/users/:id/activate
// @access  Private (Admin only)
const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isActive = true;
  await user.save();

  res.status(200).json({
    success: true,
    data: user,
    message: 'User account activated successfully',
  });
});

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getDashboardStats = asyncHandler(async (req, res) => {
  // User statistics
  const totalUsers = await User.countDocuments();
  const studentCount = await User.countDocuments({ role: 'student' });
  const seniorCount = await User.countDocuments({ role: 'senior' });
  const alumniCount = await User.countDocuments({ role: 'alumni' });
  const facultyCount = await User.countDocuments({ role: 'faculty' });
  const pendingAlumni = await User.countDocuments({
    role: 'alumni',
    status: 'pending',
  });
  const approvedUsers = await User.countDocuments({ status: 'approved' });
  const rejectedUsers = await User.countDocuments({ status: 'rejected' });

  // Content statistics
  const totalOpportunities = await Opportunity.countDocuments();
  const activeOpportunities = await Opportunity.countDocuments({
    status: 'active',
  });
  const totalApplications = await Application.countDocuments();
  const totalMentorshipRequests = await MentorshipRequest.countDocuments();
  const acceptedMentorships = await MentorshipRequest.countDocuments({
    status: 'accepted',
  });
  const totalMessages = await Message.countDocuments();
  const totalProfiles = await Profile.countDocuments();

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsersThisWeek = await User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const newOpportunitiesThisWeek = await Opportunity.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const newApplicationsThisWeek = await Application.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        students: studentCount,
        seniors: seniorCount,
        alumni: alumniCount,
        faculty: facultyCount,
        pendingAlumni,
        approved: approvedUsers,
        rejected: rejectedUsers,
      },
      content: {
        opportunities: {
          total: totalOpportunities,
          active: activeOpportunities,
        },
        applications: totalApplications,
        mentorships: {
          total: totalMentorshipRequests,
          accepted: acceptedMentorships,
        },
        messages: totalMessages,
        profiles: totalProfiles,
      },
      recentActivity: {
        newUsersThisWeek,
        newOpportunitiesThisWeek,
        newApplicationsThisWeek,
      },
    },
  });
});

// @desc    Get recent users
// @route   GET /api/admin/users/recent
// @access  Private (Admin only)
const getRecentUsers = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const recentUsers = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: recentUsers.length,
    data: recentUsers,
  });
});

module.exports = {
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
};
