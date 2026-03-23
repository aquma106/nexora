const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'senior', 'alumni', 'faculty', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'Please specify a role'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: '{VALUE} is not a valid status',
      },
      default: function() {
        // Alumni start with pending status, others are auto-approved
        return this.role === 'alumni' ? 'pending' : 'approved';
      },
    },
    collegeName: {
      type: String,
      required: [true, 'Please add college name'],
      trim: true,
    },
    graduationYear: {
      type: Number,
      required: [true, 'Please add graduation year'],
      min: [1950, 'Graduation year must be after 1950'],
      max: [new Date().getFullYear() + 10, 'Graduation year is too far in the future'],
    },
    linkedinUrl: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub|company)\/[a-zA-Z0-9_-]+\/?$/,
        'Please add a valid LinkedIn URL',
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validation: Students must use college email
userSchema.pre('validate', function(next) {
  if (this.role === 'student') {
    // Check if email ends with .edu or contains college domain
    const collegeEmailPattern = /@(.+\.)?(edu|ac\.|college)/i;
    if (!collegeEmailPattern.test(this.email)) {
      this.invalidate('email', 'Students must use their college email address');
    }
  }
  next();
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });

module.exports = mongoose.model('User', userSchema);
