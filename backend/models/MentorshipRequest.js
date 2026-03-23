const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required'],
    },
    message: {
      type: String,
      required: [true, 'Please add a message'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
    mentorshipType: {
      type: String,
      enum: ['career', 'technical', 'academic', 'general'],
      default: 'general',
    },
    duration: {
      type: String,
      enum: ['one-time', 'short-term', 'long-term'],
      default: 'short-term',
    },
    responseMessage: {
      type: String,
      trim: true,
      maxlength: [500, 'Response message cannot exceed 500 characters'],
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Validation: Sender and receiver cannot be the same
mentorshipRequestSchema.pre('validate', function(next) {
  if (this.sender.equals(this.receiver)) {
    this.invalidate('receiver', 'Cannot send mentorship request to yourself');
  }
  next();
});

// Index for faster queries
mentorshipRequestSchema.index({ sender: 1, receiver: 1 });
mentorshipRequestSchema.index({ status: 1 });
mentorshipRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
