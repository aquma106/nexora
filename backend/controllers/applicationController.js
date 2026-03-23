const asyncHandler = require('../middleware/asyncHandler');
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');

// @desc    Apply for opportunity
// @route   POST /api/applications
// @access  Private (Must be approved)
const applyForOpportunity = asyncHandler(async (req, res) => {
  const { opportunityId, coverLetter, resume, answers } = req.body;

  // Check if opportunity exists
  const opportunity = await Opportunity.findById(opportunityId);
  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found');
  }

  // Check if opportunity is active
  if (opportunity.status !== 'active') {
    res.status(400);
    throw new Error('This opportunity is no longer accepting applications');
  }

  // Check if application deadline has passed
  if (opportunity.applicationDeadline && new Date() > opportunity.applicationDeadline) {
    res.status(400);
    throw new Error('Application deadline has passed');
  }

  // Check if user already applied
  const existingApplication = await Application.findOne({
    userId: req.user._id,
    opportunityId,
  });

  if (existingApplication) {
    res.status(400);
    throw new Error('You have already applied for this opportunity');
  }

  // Create application
  const application = await Application.create({
    userId: req.user._id,
    opportunityId,
    coverLetter,
    resume,
    answers,
  });

  // Increment applications count on opportunity
  opportunity.applicationsCount += 1;
  await opportunity.save();

  // Populate details
  await application.populate('userId', 'name email role collegeName graduationYear');
  await application.populate('opportunityId', 'title company type');

  res.status(201).json({
    success: true,
    data: application,
    message: 'Application submitted successfully',
  });
});

// @desc    Get all applications (user's own or all if admin/poster)
// @route   GET /api/applications
// @access  Private
const getApplications = asyncHandler(async (req, res) => {
  const { opportunityId, status, page = 1, limit = 10 } = req.query;

  let query = {};

  // If user is admin or checking applications for their posted opportunities
  if (req.user.role === 'admin') {
    // Admin can see all applications
    if (opportunityId) {
      query.opportunityId = opportunityId;
    }
  } else {
    // Check if user is viewing applications for their posted opportunity
    if (opportunityId) {
      const opportunity = await Opportunity.findById(opportunityId);
      if (!opportunity) {
        res.status(404);
        throw new Error('Opportunity not found');
      }

      // Only poster can view applications for their opportunity
      if (opportunity.postedBy.toString() === req.user._id.toString()) {
        query.opportunityId = opportunityId;
      } else {
        res.status(403);
        throw new Error('You can only view applications for opportunities you posted');
      }
    } else {
      // Regular users can only see their own applications
      query.userId = req.user._id;
    }
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const applications = await Application.find(query)
    .populate('userId', 'name email role collegeName graduationYear')
    .populate('opportunityId', 'title company type location status')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Application.countDocuments(query);

  res.status(200).json({
    success: true,
    count: applications.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: applications,
  });
});

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('userId', 'name email role collegeName graduationYear linkedinUrl')
    .populate('opportunityId', 'title company type location description requirements')
    .populate('reviewedBy', 'name email');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Check authorization
  const opportunity = await Opportunity.findById(application.opportunityId._id);
  const isOwner = application.userId._id.toString() === req.user._id.toString();
  const isPoster = opportunity.postedBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isPoster && !isAdmin) {
    res.status(403);
    throw new Error('You are not authorized to view this application');
  }

  res.status(200).json({
    success: true,
    data: application,
  });
});

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Opportunity poster or Admin)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, feedback } = req.body;

  // Validate status
  const validStatuses = ['submitted', 'under-review', 'shortlisted', 'rejected', 'accepted'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Check if user is the opportunity poster or admin
  const opportunity = await Opportunity.findById(application.opportunityId);
  const isPoster = opportunity.postedBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isPoster && !isAdmin) {
    res.status(403);
    throw new Error('Only the opportunity poster or admin can update application status');
  }

  // Update application
  application.status = status;
  application.feedback = feedback;
  application.reviewedBy = req.user._id;
  application.reviewedAt = Date.now();

  await application.save();

  // Populate details
  await application.populate('userId', 'name email role collegeName graduationYear');
  await application.populate('opportunityId', 'title company type');
  await application.populate('reviewedBy', 'name email');

  res.status(200).json({
    success: true,
    data: application,
    message: 'Application status updated successfully',
  });
});

// @desc    Withdraw application
// @route   DELETE /api/applications/:id
// @access  Private (Application owner only)
const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Check if user owns the application
  if (application.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only withdraw your own applications');
  }

  // Can only withdraw if not already accepted or rejected
  if (['accepted', 'rejected'].includes(application.status)) {
    res.status(400);
    throw new Error(`Cannot withdraw application that has been ${application.status}`);
  }

  // Update status to withdrawn instead of deleting
  application.status = 'withdrawn';
  await application.save();

  // Decrement applications count
  const opportunity = await Opportunity.findById(application.opportunityId);
  if (opportunity && opportunity.applicationsCount > 0) {
    opportunity.applicationsCount -= 1;
    await opportunity.save();
  }

  res.status(200).json({
    success: true,
    data: {},
    message: 'Application withdrawn successfully',
  });
});

// @desc    Get my applications
// @route   GET /api/applications/my/applications
// @access  Private
const getMyApplications = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const query = { userId: req.user._id };

  if (status) {
    query.status = status;
  }

  const applications = await Application.find(query)
    .populate('opportunityId', 'title company type location status')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications,
  });
});

// @desc    Get application statistics
// @route   GET /api/applications/stats/overview
// @access  Private
const getApplicationStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const total = await Application.countDocuments({ userId });
  const submitted = await Application.countDocuments({ userId, status: 'submitted' });
  const underReview = await Application.countDocuments({ userId, status: 'under-review' });
  const shortlisted = await Application.countDocuments({ userId, status: 'shortlisted' });
  const accepted = await Application.countDocuments({ userId, status: 'accepted' });
  const rejected = await Application.countDocuments({ userId, status: 'rejected' });

  res.status(200).json({
    success: true,
    data: {
      total,
      submitted,
      underReview,
      shortlisted,
      accepted,
      rejected,
    },
  });
});

module.exports = {
  applyForOpportunity,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
  getMyApplications,
  getApplicationStats,
};
