const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      trim: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    projects: [
      {
        title: {
          type: String,
          required: [true, 'Project title is required'],
          trim: true,
        },
        description: {
          type: String,
          required: [true, 'Project description is required'],
          trim: true,
        },
        technologies: [String],
        link: {
          type: String,
          trim: true,
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        isCurrent: {
          type: Boolean,
          default: false,
        },
      },
    ],
    experience: [
      {
        company: {
          type: String,
          required: [true, 'Company name is required'],
          trim: true,
        },
        position: {
          type: String,
          required: [true, 'Position is required'],
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        startDate: {
          type: Date,
          required: [true, 'Start date is required'],
        },
        endDate: {
          type: Date,
        },
        isCurrent: {
          type: Boolean,
          default: false,
        },
        location: {
          type: String,
          trim: true,
        },
      },
    ],
    education: [
      {
        institution: {
          type: String,
          required: [true, 'Institution name is required'],
          trim: true,
        },
        degree: {
          type: String,
          required: [true, 'Degree is required'],
          trim: true,
        },
        fieldOfStudy: {
          type: String,
          trim: true,
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        grade: {
          type: String,
          trim: true,
        },
      },
    ],
    resume: {
      filename: {
        type: String,
      },
      url: {
        type: String,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    socialLinks: {
      github: {
        type: String,
        trim: true,
      },
      portfolio: {
        type: String,
        trim: true,
      },
      twitter: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
profileSchema.index({ userId: 1 });
profileSchema.index({ skills: 1 });

module.exports = mongoose.model('Profile', profileSchema);
