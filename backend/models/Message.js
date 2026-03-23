const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
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
    text: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    attachments: [
      {
        filename: {
          type: String,
        },
        url: {
          type: String,
        },
        fileType: {
          type: String,
        },
        fileSize: {
          type: Number,
        },
      },
    ],
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create conversation ID before saving
messageSchema.pre('validate', function(next) {
  if (!this.conversationId && this.sender && this.receiver) {
    // Create a consistent conversation ID regardless of who sends first
    const ids = [this.sender.toString(), this.receiver.toString()].sort();
    this.conversationId = `${ids[0]}_${ids[1]}`;
  }
  
  // Validation: Sender and receiver cannot be the same
  if (this.sender.equals(this.receiver)) {
    this.invalidate('receiver', 'Cannot send message to yourself');
  }
  
  next();
});

// Index for faster queries
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ isRead: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
