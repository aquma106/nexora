const Message = require('../models/Message');
const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

// Store active users and their socket IDs
const activeUsers = new Map();

const socketHandler = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify token
      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Authentication error: Invalid token'));
      }

      // Get user from database
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Check if user is active and approved
      if (!user.isActive) {
        return next(new Error('Authentication error: Account deactivated'));
      }

      if (user.status !== 'approved') {
        return next(new Error('Authentication error: Account not approved'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

    // Add user to active users
    activeUsers.set(socket.user._id.toString(), socket.id);

    // Emit online status to all users
    io.emit('userOnline', {
      userId: socket.user._id,
      name: socket.user.name,
    });

    // Join user to their own room
    socket.join(socket.user._id.toString());

    // Send active users list to the newly connected user
    socket.emit('activeUsers', Array.from(activeUsers.keys()));

    // Handle sending messages
    socket.on('sendMessage', async (data, callback) => {
      try {
        const { receiverId, text, attachments } = data;

        // Validate input
        if (!receiverId || !text) {
          return callback({
            success: false,
            message: 'Receiver ID and message text are required',
          });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
          return callback({
            success: false,
            message: 'Receiver not found',
          });
        }

        // Prevent sending message to yourself
        if (receiverId === socket.user._id.toString()) {
          return callback({
            success: false,
            message: 'Cannot send message to yourself',
          });
        }

        // Create conversation ID (consistent regardless of who sends first)
        const ids = [socket.user._id.toString(), receiverId].sort();
        const conversationId = `${ids[0]}_${ids[1]}`;

        // Save message to database
        const message = await Message.create({
          sender: socket.user._id,
          receiver: receiverId,
          text,
          attachments: attachments || [],
          conversationId,
        });

        // Populate sender and receiver details
        await message.populate('sender', 'name email role');
        await message.populate('receiver', 'name email role');

        // Emit message to receiver if they're online
        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', message);
        }

        // Send confirmation to sender
        socket.emit('messageSent', message);

        // Send success callback
        callback({
          success: true,
          data: message,
        });
      } catch (error) {
        console.error('Error sending message:', error);
        callback({
          success: false,
          message: error.message || 'Failed to send message',
        });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { receiverId } = data;
      const receiverSocketId = activeUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', {
          userId: socket.user._id,
          name: socket.user.name,
        });
      }
    });

    // Handle stop typing indicator
    socket.on('stopTyping', (data) => {
      const { receiverId } = data;
      const receiverSocketId = activeUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userStoppedTyping', {
          userId: socket.user._id,
        });
      }
    });

    // Handle mark message as read
    socket.on('markAsRead', async (data, callback) => {
      try {
        const { messageId } = data;

        const message = await Message.findById(messageId);

        if (!message) {
          return callback({
            success: false,
            message: 'Message not found',
          });
        }

        // Only receiver can mark as read
        if (message.receiver.toString() !== socket.user._id.toString()) {
          return callback({
            success: false,
            message: 'You can only mark messages sent to you as read',
          });
        }

        message.isRead = true;
        message.readAt = Date.now();
        await message.save();

        // Notify sender that message was read
        const senderSocketId = activeUsers.get(message.sender.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit('messageRead', {
            messageId: message._id,
            readAt: message.readAt,
          });
        }

        callback({
          success: true,
          data: message,
        });
      } catch (error) {
        callback({
          success: false,
          message: error.message || 'Failed to mark message as read',
        });
      }
    });

    // Handle get conversation
    socket.on('getConversation', async (data, callback) => {
      try {
        const { userId } = data;

        // Create conversation ID
        const ids = [socket.user._id.toString(), userId].sort();
        const conversationId = `${ids[0]}_${ids[1]}`;

        // Get messages
        const messages = await Message.find({
          conversationId,
          isDeleted: false,
        })
          .populate('sender', 'name email role')
          .populate('receiver', 'name email role')
          .sort({ createdAt: 1 })
          .limit(50);

        callback({
          success: true,
          data: messages,
        });
      } catch (error) {
        callback({
          success: false,
          message: error.message || 'Failed to get conversation',
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.user._id})`);

      // Remove user from active users
      activeUsers.delete(socket.user._id.toString());

      // Emit offline status to all users
      io.emit('userOffline', {
        userId: socket.user._id,
      });
    });
  });
};

module.exports = socketHandler;
