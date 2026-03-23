# Messaging System Documentation

## Overview

Real-time messaging system using Socket.io for WebSocket connections and REST APIs for message history.

## Installation

```bash
cd backend
npm install socket.io
npm run dev
```

---

## REST API Endpoints

### Base URL
```
http://localhost:5000/api/messages
```

### 1. Get All Conversations

**Endpoint:** `GET /api/messages/conversations`

**Description:** Get all conversations with last message and unread count

**Access:** Private

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "conversationId": "user1_id_user2_id",
      "otherUser": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student"
      },
      "lastMessage": {
        "_id": "message_id",
        "sender": {...},
        "receiver": {...},
        "text": "Hello!",
        "isRead": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "unreadCount": 3
    }
  ]
}
```

---

### 2. Get Messages in Conversation

**Endpoint:** `GET /api/messages/conversation/:userId`

**Description:** Get all messages with a specific user

**Access:** Private

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Messages per page (default: 50)

**Success Response (200):**
```json
{
  "success": true,
  "count": 20,
  "total": 45,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "_id": "message_id",
      "sender": {...},
      "receiver": {...},
      "text": "Hello!",
      "isRead": true,
      "readAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 3. Send Message (REST Fallback)

**Endpoint:** `POST /api/messages`

**Description:** Send a message (use Socket.io for real-time)

**Access:** Private (Must be approved)

**Request Body:**
```json
{
  "receiver": "user_id",
  "text": "Hello, how are you?",
  "attachments": [
    {
      "filename": "document.pdf",
      "url": "https://storage.example.com/files/document.pdf",
      "fileType": "application/pdf",
      "fileSize": 1024000
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "message_id",
    "sender": {...},
    "receiver": {...},
    "text": "Hello, how are you?",
    "conversationId": "user1_id_user2_id",
    "isRead": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Message sent successfully"
}
```

---

### 4. Mark Message as Read

**Endpoint:** `PUT /api/messages/:id/read`

**Description:** Mark a message as read

**Access:** Private (Receiver only)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "message_id",
    "isRead": true,
    "readAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5. Delete Message

**Endpoint:** `DELETE /api/messages/:id`

**Description:** Delete a message (soft delete)

**Access:** Private (Sender or Receiver)

**Success Response (200):**
```json
{
  "success": true,
  "data": {},
  "message": "Message deleted successfully"
}
```

---

### 6. Get Unread Count

**Endpoint:** `GET /api/messages/unread/count`

**Description:** Get total unread message count

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

## Socket.io WebSocket Events

### Connection URL
```
ws://localhost:5000
```

### Authentication

Connect with JWT token in auth object:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token_here'
  }
});
```

---

### Client Events (Emit)

#### 1. sendMessage

Send a real-time message

**Emit:**
```javascript
socket.emit('sendMessage', {
  receiverId: 'user_id',
  text: 'Hello!',
  attachments: []
}, (response) => {
  if (response.success) {
    console.log('Message sent:', response.data);
  } else {
    console.error('Error:', response.message);
  }
});
```

**Callback Response:**
```javascript
{
  success: true,
  data: {
    _id: 'message_id',
    sender: {...},
    receiver: {...},
    text: 'Hello!',
    conversationId: 'user1_id_user2_id',
    createdAt: '2024-01-01T00:00:00.000Z'
  }
}
```

---

#### 2. typing

Indicate user is typing

**Emit:**
```javascript
socket.emit('typing', {
  receiverId: 'user_id'
});
```

---

#### 3. stopTyping

Indicate user stopped typing

**Emit:**
```javascript
socket.emit('stopTyping', {
  receiverId: 'user_id'
});
```

---

#### 4. markAsRead

Mark a message as read

**Emit:**
```javascript
socket.emit('markAsRead', {
  messageId: 'message_id'
}, (response) => {
  if (response.success) {
    console.log('Message marked as read');
  }
});
```

---

#### 5. getConversation

Get conversation history

**Emit:**
```javascript
socket.emit('getConversation', {
  userId: 'user_id'
}, (response) => {
  if (response.success) {
    console.log('Messages:', response.data);
  }
});
```

---

### Server Events (Listen)

#### 1. receiveMessage

Receive a new message

**Listen:**
```javascript
socket.on('receiveMessage', (message) => {
  console.log('New message:', message);
  // Update UI with new message
});
```

**Data:**
```javascript
{
  _id: 'message_id',
  sender: {
    _id: 'user_id',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student'
  },
  receiver: {...},
  text: 'Hello!',
  conversationId: 'user1_id_user2_id',
  isRead: false,
  createdAt: '2024-01-01T00:00:00.000Z'
}
```

---

#### 2. messageSent

Confirmation that your message was sent

**Listen:**
```javascript
socket.on('messageSent', (message) => {
  console.log('Message sent successfully:', message);
});
```

---

#### 3. userTyping

Another user is typing

**Listen:**
```javascript
socket.on('userTyping', (data) => {
  console.log(`${data.name} is typing...`);
  // Show typing indicator
});
```

---

#### 4. userStoppedTyping

User stopped typing

**Listen:**
```javascript
socket.on('userStoppedTyping', (data) => {
  console.log('User stopped typing');
  // Hide typing indicator
});
```

---

#### 5. messageRead

Your message was read

**Listen:**
```javascript
socket.on('messageRead', (data) => {
  console.log('Message read:', data.messageId);
  // Update message status to read
});
```

---

#### 6. userOnline

User came online

**Listen:**
```javascript
socket.on('userOnline', (data) => {
  console.log(`${data.name} is now online`);
  // Update user status in UI
});
```

---

#### 7. userOffline

User went offline

**Listen:**
```javascript
socket.on('userOffline', (data) => {
  console.log('User went offline:', data.userId);
  // Update user status in UI
});
```

---

#### 8. activeUsers

List of currently active users

**Listen:**
```javascript
socket.on('activeUsers', (userIds) => {
  console.log('Active users:', userIds);
  // Update online status for users
});
```

---

## Complete Client Example

```javascript
import { io } from 'socket.io-client';

// Connect to server
const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token')
  }
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

// Listen for incoming messages
socket.on('receiveMessage', (message) => {
  console.log('New message received:', message);
  // Add message to chat UI
  addMessageToUI(message);
});

// Listen for typing indicators
socket.on('userTyping', (data) => {
  showTypingIndicator(data.userId, data.name);
});

socket.on('userStoppedTyping', (data) => {
  hideTypingIndicator(data.userId);
});

// Listen for read receipts
socket.on('messageRead', (data) => {
  updateMessageStatus(data.messageId, 'read');
});

// Listen for online/offline status
socket.on('userOnline', (data) => {
  updateUserStatus(data.userId, 'online');
});

socket.on('userOffline', (data) => {
  updateUserStatus(data.userId, 'offline');
});

// Send a message
function sendMessage(receiverId, text) {
  socket.emit('sendMessage', {
    receiverId,
    text
  }, (response) => {
    if (response.success) {
      console.log('Message sent:', response.data);
      addMessageToUI(response.data);
    } else {
      console.error('Failed to send:', response.message);
    }
  });
}

// Typing indicator
let typingTimeout;
function handleTyping(receiverId) {
  socket.emit('typing', { receiverId });
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('stopTyping', { receiverId });
  }, 3000);
}

// Mark as read
function markMessageAsRead(messageId) {
  socket.emit('markAsRead', { messageId }, (response) => {
    if (response.success) {
      console.log('Marked as read');
    }
  });
}

// Get conversation
function loadConversation(userId) {
  socket.emit('getConversation', { userId }, (response) => {
    if (response.success) {
      displayMessages(response.data);
    }
  });
}
```

---

## Features

✅ Real-time messaging with Socket.io
✅ Message persistence in MongoDB
✅ Typing indicators
✅ Read receipts
✅ Online/offline status
✅ Conversation threading
✅ Unread message count
✅ Message attachments support
✅ Soft delete messages
✅ JWT authentication for WebSocket
✅ REST API fallback
✅ Pagination for message history

---

## Security

- JWT authentication required for WebSocket connections
- Users must be approved (not pending)
- Cannot send messages to yourself
- Only receiver can mark messages as read
- Soft delete preserves message history

---

## Testing

### Test WebSocket Connection
```bash
# Install socket.io-client for testing
npm install -g socket.io-client

# Or use the browser console with socket.io-client library
```

### Test REST API
```bash
# Get conversations
curl -X GET http://localhost:5000/api/messages/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send message
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiver": "user_id",
    "text": "Hello!"
  }'
```
