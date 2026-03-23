const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Please add company name'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    locationType: {
      type: String,
      enum: ['on-site', 'remote', 'hybrid'],
      default: 'on-site',
    },
    type: {
      type: String,
      enum: {
        values: ['job', 'internship'],
        message: '{VALUE} is not a valid opportunity type',
      },
      required: [true, 'Please specify opportunity type'],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Posted by user is required'],
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    salary: {
      min: {
        type: Number,
        min: [0, 'Salary cannot be negative'],
      },
      max: {
        type: Number,
        min: [0, 'Salary cannot be negative'],
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    duration: {
      type: String,
      trim: true,
    },
    applicationDeadline: {
      type: Date,
    },
    applicationUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
    },
    views: {
      type: Number,
      default: 0,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Validation: Salary max should be greater than min
opportunitySchema.pre('validate', function(next) {
  if (this.salary && this.salary.min && this.salary.max) {
    if (this.salary.max < this.salary.min) {
      this.invalidate('salary.max', 'Maximum salary must be greater than minimum salary');
    }
  }
  next();
});

// Index for faster queries
opportunitySchema.index({ type: 1, status: 1 });
opportunitySchema.index({ postedBy: 1 });
opportunitySchema.index({ createdAt: -1 });
opportunitySchema.index({ skills: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
