const asyncHandler = require('../middleware/asyncHandler');
const MentorshipRequest = require('../models/MentorshipRequest');
const User = require('../models/User');

// @desc    Send mentorship request
// @route   POST /api/mentorship
// @access  Private (Students only)
const sendMentorshipRequest = asyncHandler(async (req, res) => {
  const { receiver, message, mentorshipType, duration } = req.body;

  // Validation: Only students can send mentorship requests
  if (req.user.role !== 'student') {
    res.status(403);
    throw new Error('Only students can send mentorship requests');
  }

  // Check if receiver exists
  const receiverUser = await User.findById(receiver);
  if (!receiverUser) {
    res.status(404);
    throw new Error('Receiver not found');
  }

  // Validation: Can only send requests to seniors, alumni, or faculty
  const allowedMentorRoles = ['senior', 'alumni', 'faculty'];
  if (!allowedMentorRoles.includes(receiverUser.role)) {
    res.status(400);
    throw new Error('Mentorship requests can only be sent to seniors, alumni, or faculty');
  }

  // Check if receiver is approved (especially for alumni)
  if (receiverUser.status !== 'approved') {
    res.status(400);
    throw new Error('Cannot send mentorship request to users with pending or rejected status');
  }

  // Check if request already exists
  const existingRequest = await MentorshipRequest.findOne({
    sender: req.user._id,
    receiver,
    status: 'pending',
  });

  if (existingRequest) {
    res.status(400);
    throw new Error('You already have a pending mentorship request with this user');
  }

  // Create mentorship request
  const mentorshipRequest = await MentorshipRequest.create({
    sender: req.user._id,
    receiver,
    message,
    mentorshipType: mentorshipType || 'general',
    duration: duration || 'short-term',
  });

  // Populate sender and receiver details
  await mentorshipRequest.populate('sender', 'name email role collegeName graduationYear');
  await mentorshipRequest.populate('receiver', 'name email role collegeName graduationYear');

  res.status(201).json({
    success: true,
    data: mentorshipRequest,
    message: 'Mentorship request sent successfully',
  });
});

// @desc    Get all mentorship requests (sent and received)
// @route   GET /api/mentorship
// @access  Private
const getMentorshipRequests = asyncHandler(async (req, res) => {
  const { type, status } = req.query;

  let query = {};

  // Filter by type (sent or received)
  if (type === 'sent') {
    query.sender = req.user._id;
  } else if (type === 'received') {
    query.receiver = req.user._id;
  } else {
    // Get both sent and received
    query.$or = [{ sender: req.user._id }, { receiver: req.user._id }];
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  const requests = await MentorshipRequest.find(query)
    .populate('sender', 'name email role collegeName graduationYear linkedinUrl')
    .populate('receiver', 'name email role collegeName graduationYear linkedinUrl')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests,
  });
});

// @desc    Get single mentorship request
// @route   GET /api/mentorship/:id
// @access  Private
const getMentorshipRequestById = asyncHandler(async (req, res) => {
  const request = await MentorshipRequest.findById(req.params.id)
    .populate('sender', 'name email role collegeName graduationYear linkedinUrl')
    .populate('receiver', 'name email role collegeName graduationYear linkedinUrl');

  if (!request) {
    res.status(404);
    throw new Error('Mentorship request not found');
  }

  // Check if user is part of this request
  if (
    request.sender._id.toString() !== req.user._id.toString() &&
    request.receiver._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('You are not authorized to view this mentorship request');
  }

  res.status(200).json({
    success: true,
    data: request,
  });
});

// @desc    Respond to mentorship request (accept/reject)
// @route   PUT /api/mentorship/:id/respond
// @access  Private (Seniors/Alumni/Faculty only)
const respondToMentorshipRequest = asyncHandler(async (req, res) => {
  const { status, responseMessage } = req.body;

  // Validation: Only seniors, alumni, and faculty can respond
  const allowedResponderRoles = ['senior', 'alumni', 'faculty'];
  if (!allowedResponderRoles.includes(req.user.role)) {
    res.status(403);
    throw new Error('Only seniors, alumni, and faculty can respond to mentorship requests');
  }

  // Validate status
  if (!['accepted', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Status must be either "accepted" or "rejected"');
  }

  const request = await MentorshipRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Mentorship request not found');
  }

  // Check if user is the receiver
  if (request.receiver.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only respond to mentorship requests sent to you');
  }

  // Check if request is still pending
  if (request.status !== 'pending') {
    res.status(400);
    throw new Error(`This request has already been ${request.status}`);
  }

  // Update request
  request.status = status;
  request.responseMessage = responseMessage;
  request.respondedAt = Date.now();

  await request.save();

  // Populate details
  await request.populate('sender', 'name email role collegeName graduationYear');
  await request.populate('receiver', 'name email role collegeName graduationYear');

  res.status(200).json({
    success: true,
    data: request,
    message: `Mentorship request ${status} successfully`,
  });
});

// @desc    Cancel mentorship request
// @route   DELETE /api/mentorship/:id
// @access  Private (Sender only)
const cancelMentorshipRequest = asyncHandler(async (req, res) => {
  const request = await MentorshipRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Mentorship request not found');
  }

  // Check if user is the sender
  if (request.sender.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only cancel mentorship requests that you sent');
  }

  // Can only cancel pending requests
  if (request.status !== 'pending') {
    res.status(400);
    throw new Error('You can only cancel pending requests');
  }

  // Update status to cancelled instead of deleting
  request.status = 'cancelled';
  await request.save();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Mentorship request cancelled successfully',
  });
});

// @desc    Get mentorship statistics
// @route   GET /api/mentorship/stats
// @access  Private
const getMentorshipStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get counts for different statuses
  const sentRequests = await MentorshipRequest.countDocuments({ sender: userId });
  const receivedRequests = await MentorshipRequest.countDocuments({ receiver: userId });
  const pendingSent = await MentorshipRequest.countDocuments({
    sender: userId,
    status: 'pending',
  });
  const pendingReceived = await MentorshipRequest.countDocuments({
    receiver: userId,
    status: 'pending',
  });
  const acceptedSent = await MentorshipRequest.countDocuments({
    sender: userId,
    status: 'accepted',
  });
  const acceptedReceived = await MentorshipRequest.countDocuments({
    receiver: userId,
    status: 'accepted',
  });

  res.status(200).json({
    success: true,
    data: {
      sent: {
        total: sentRequests,
        pending: pendingSent,
        accepted: acceptedSent,
      },
      received: {
        total: receivedRequests,
        pending: pendingReceived,
        accepted: acceptedReceived,
      },
    },
  });
});

// @desc    Get available mentors (seniors, alumni, faculty)
// @route   GET /api/mentorship/mentors
// @access  Private
const getAvailableMentors = asyncHandler(async (req, res) => {
  const { role, collegeName, skills, page = 1, limit = 10 } = req.query;

  // Build query for mentors
  const query = {
    role: { $in: ['senior', 'alumni', 'faculty'] },
    status: 'approved',
    isActive: true,
    _id: { $ne: req.user._id }, // Exclude current user
  };

  if (role) {
    query.role = role;
  }

  if (collegeName) {
    query.collegeName = { $regex: collegeName, $options: 'i' };
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const mentors = await User.find(query)
    .select('name email role collegeName graduationYear linkedinUrl')
    .skip(skip)
    .limit(limitNum)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: mentors.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: mentors,
  });
});

module.exports = {
  sendMentorshipRequest,
  getMentorshipRequests,
  getMentorshipRequestById,
  respondToMentorshipRequest,
  cancelMentorshipRequest,
  getMentorshipStats,
  getAvailableMentors,
};
