const asyncHandler = require('../middleware/asyncHandler');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');

// @desc    Get all opportunities with filters
// @route   GET /api/opportunities
// @access  Public
const getOpportunities = asyncHandler(async (req, res) => {
  const {
    type,
    status,
    company,
    location,
    locationType,
    skills,
    search,
    postedBy,
    page = 1,
    limit = 10,
  } = req.query;

  // Build query
  const query = {};

  // Filter by type (job/internship)
  if (type) {
    query.type = type;
  }

  // Filter by status (default to active for public)
  if (status) {
    query.status = status;
  } else {
    query.status = 'active'; // Only show active opportunities by default
  }

  // Filter by company
  if (company) {
    query.company = { $regex: company, $options: 'i' };
  }

  // Filter by location
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  // Filter by location type
  if (locationType) {
    query.locationType = locationType;
  }

  // Filter by skills
  if (skills) {
    const skillsArray = skills.split(',').map((skill) => skill.trim());
    query.skills = { $in: skillsArray.map((s) => new RegExp(s, 'i')) };
  }

  // Filter by posted by
  if (postedBy) {
    query.postedBy = postedBy;
  }

  // Search in title and description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const opportunities = await Opportunity.find(query)
    .populate('postedBy', 'name email role collegeName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Get total count
  const total = await Opportunity.countDocuments(query);

  res.status(200).json({
    success: true,
    count: opportunities.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: opportunities,
  });
});

// @desc    Get single opportunity
// @route   GET /api/opportunities/:id
// @access  Public
const getOpportunityById = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id).populate(
    'postedBy',
    'name email role collegeName linkedinUrl'
  );

  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found');
  }

  // Increment views
  opportunity.views += 1;
  await opportunity.save();

  res.status(200).json({
    success: true,
    data: opportunity,
  });
});

// @desc    Create opportunity
// @route   POST /api/opportunities
// @access  Private (Senior/Alumni/Faculty/Admin only, must be approved)
const createOpportunity = asyncHandler(async (req, res) => {
  // Validation: Only seniors, alumni, faculty, and admins can post opportunities
  const allowedRoles = ['senior', 'alumni', 'faculty', 'admin'];
  if (!allowedRoles.includes(req.user.role)) {
    res.status(403);
    throw new Error('Only seniors, alumni, faculty, and admins can post opportunities');
  }

  // Add postedBy field
  const opportunityData = {
    ...req.body,
    postedBy: req.user._id,
  };

  // Create opportunity
  const opportunity = await Opportunity.create(opportunityData);

  // Populate poster details
  await opportunity.populate('postedBy', 'name email role collegeName');

  res.status(201).json({
    success: true,
    data: opportunity,
    message: 'Opportunity created successfully',
  });
});

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Private (Owner or Admin)
const updateOpportunity = asyncHandler(async (req, res) => {
  let opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found');
  }

  // Check ownership (only poster or admin can update)
  if (
    opportunity.postedBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('You can only update opportunities that you posted');
  }

  // Update opportunity
  opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('postedBy', 'name email role collegeName');

  res.status(200).json({
    success: true,
    data: opportunity,
    message: 'Opportunity updated successfully',
  });
});

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private (Owner or Admin)
const deleteOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found');
  }

  // Check ownership
  if (
    opportunity.postedBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('You can only delete opportunities that you posted');
  }

  await opportunity.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Opportunity deleted successfully',
  });
});

// @desc    Get my posted opportunities
// @route   GET /api/opportunities/my/posted
// @access  Private
const getMyOpportunities = asyncHandler(async (req, res) => {
  const opportunities = await Opportunity.find({ postedBy: req.user._id })
    .populate('postedBy', 'name email role collegeName')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: opportunities.length,
    data: opportunities,
  });
});

// @desc    Close opportunity (change status to closed)
// @route   PUT /api/opportunities/:id/close
// @access  Private (Owner or Admin)
const closeOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found');
  }

  // Check ownership
  if (
    opportunity.postedBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('You can only close opportunities that you posted');
  }

  opportunity.status = 'closed';
  await opportunity.save();

  res.status(200).json({
    success: true,
    data: opportunity,
    message: 'Opportunity closed successfully',
  });
});

// @desc    Get opportunity statistics
// @route   GET /api/opportunities/stats/overview
// @access  Private
const getOpportunityStats = asyncHandler(async (req, res) => {
  const totalOpportunities = await Opportunity.countDocuments({
    postedBy: req.user._id,
  });
  const activeOpportunities = await Opportunity.countDocuments({
    postedBy: req.user._id,
    status: 'active',
  });
  const closedOpportunities = await Opportunity.countDocuments({
    postedBy: req.user._id,
    status: 'closed',
  });

  // Get total applications for user's opportunities
  const userOpportunities = await Opportunity.find({ postedBy: req.user._id }).select('_id');
  const opportunityIds = userOpportunities.map((opp) => opp._id);
  const totalApplications = await Application.countDocuments({
    opportunityId: { $in: opportunityIds },
  });

  res.status(200).json({
    success: true,
    data: {
      opportunities: {
        total: totalOpportunities,
        active: activeOpportunities,
        closed: closedOpportunities,
      },
      applications: {
        total: totalApplications,
      },
    },
  });
});

module.exports = {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getMyOpportunities,
  closeOpportunity,
  getOpportunityStats,
};
