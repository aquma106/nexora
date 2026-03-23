const asyncHandler = require('../middleware/asyncHandler');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get all unique conversation IDs
  const messages = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { receiver: userId }],
        isDeleted: false,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiver', userId] },
                  { $eq: ['$isRead', false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $sort: { 'lastMessage.createdAt': -1 },
    },
  ]);

  // Populate user details
  const conversations = await Promise.all(
    messages.map(async (conv) => {
      const lastMessage = await Message.findById(conv.lastMessage._id)
        .populate('sender', 'name email role')
        .populate('receiver', 'name email role');

      // Determine the other user in the conversation
      const otherUserId =
        lastMessage.sender._id.toString() === userId.toString()
          ? lastMessage.receiver._id
          : lastMessage.sender._id;

      const otherUser = await User.findById(otherUserId).select(
        'name email role collegeName'
      );

      return {
        conversationId: conv._id,
        otherUser,
        lastMessage,
        unreadCount: conv.unreadCount,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: conversations.length,
    data: conversations,
  });
});

// @desc    Get messages in a conversation
// @route   GET /api/messages/conversation/:userId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Create conversation ID
  const ids = [req.user._id.toString(), userId].sort();
  const conversationId = `${ids[0]}_${ids[1]}`;

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Get messages
  const messages = await Message.find({
    conversationId,
    isDeleted: false,
  })
    .populate('sender', 'name email role')
    .populate('receiver', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Reverse to show oldest first
  messages.reverse();

  const total = await Message.countDocuments({
    conversationId,
    isDeleted: false,
  });

  res.status(200).json({
    success: true,
    count: messages.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: messages,
  });
});

// @desc    Send message (REST API fallback)
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { receiver, text, attachments } = req.body;

  // Validate input
  if (!receiver || !text) {
    res.status(400);
    throw new Error('Receiver and message text are required');
  }

  // Check if receiver exists
  const receiverUser = await User.findById(receiver);
  if (!receiverUser) {
    res.status(404);
    throw new Error('Receiver not found');
  }

  // Prevent sending message to yourself
  if (receiver === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot send message to yourself');
  }

  // Create conversation ID
  const ids = [req.user._id.toString(), receiver].sort();
  const conversationId = `${ids[0]}_${ids[1]}`;

  // Create message
  const message = await Message.create({
    sender: req.user._id,
    receiver,
    text,
    attachments: attachments || [],
    conversationId,
  });

  // Populate details
  await message.populate('sender', 'name email role');
  await message.populate('receiver', 'name email role');

  res.status(201).json({
    success: true,
    data: message,
    message: 'Message sent successfully',
  });
});

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  // Only receiver can mark as read
  if (message.receiver.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only mark messages sent to you as read');
  }

  message.isRead = true;
  message.readAt = Date.now();
  await message.save();

  res.status(200).json({
    success: true,
    data: message,
  });
});

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  // Only sender or receiver can delete
  const isSender = message.sender.toString() === req.user._id.toString();
  const isReceiver = message.receiver.toString() === req.user._id.toString();

  if (!isSender && !isReceiver) {
    res.status(403);
    throw new Error('You can only delete your own messages');
  }

  // Soft delete - add user to deletedBy array
  if (!message.deletedBy.includes(req.user._id)) {
    message.deletedBy.push(req.user._id);
  }

  // If both users deleted, mark as deleted
  if (message.deletedBy.length >= 2) {
    message.isDeleted = true;
  }

  await message.save();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Message deleted successfully',
  });
});

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({
    receiver: req.user._id,
    isRead: false,
    isDeleted: false,
  });

  res.status(200).json({
    success: true,
    data: {
      unreadCount: count,
    },
  });
});

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount,
};
