const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount,
} = require('../controllers/messageController');
const { protect, restrictPendingUsers } = require('../middleware/auth');

// All message routes require authentication

// Get all conversations
router.get('/conversations', protect, getConversations);

// Get unread message count
router.get('/unread/count', protect, getUnreadCount);

// Get messages in a conversation
router.get('/conversation/:userId', protect, getMessages);

// Send message (REST API fallback)
router.post('/', protect, restrictPendingUsers, sendMessage);

// Mark message as read
router.put('/:id/read', protect, markAsRead);

// Delete message
router.delete('/:id', protect, deleteMessage);

module.exports = router;
