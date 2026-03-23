# Chat UI Documentation

## Overview
Real-time messaging interface with Socket.io WebSocket integration. Supports one-to-one conversations with typing indicators, read receipts, and online/offline status.

---

## Features

### 1. Real-time Messaging
- Instant message delivery using Socket.io
- WebSocket connection with JWT authentication
- Automatic reconnection on connection loss
- Message persistence in MongoDB

### 2. Conversation List (Left Panel)
- Search conversations by user name
- Display last message preview
- Show unread message count badges
- Online/offline status indicators (green dot)
- Timestamp of last message
- Active conversation highlighting (blue background)

### 3. Message Window (Right Panel)
- Chat header with user info and online status
- Message bubbles (blue for sent, gray for received)
- Message timestamps
- Read receipts (single check = sent, double check = read)
- Typing indicators (animated dots)
- Auto-scroll to bottom on new messages

### 4. Message Input
- Text input with Enter key support
- Send button (disabled when empty)
- Typing indicator emission
- Auto-stop typing after 1 second of inactivity

---

## Socket.io Events

### Client Emits:
- `sendMessage` - Send a new message
- `typing` - User is typing
- `stopTyping` - User stopped typing
- `markAsRead` - Mark message as read
- `getConversation` - Fetch conversation history

### Client Listens:
- `connect` - Connection established
- `activeUsers` - List of online user IDs
- `userOnline` - User came online
- `userOffline` - User went offline
- `receiveMessage` - New message received
- `userTyping` - Other user is typing
- `userStoppedTyping` - Other user stopped typing
- `messageRead` - Message was read by recipient

---

## Component Structure

```jsx
Messages Component
├── Socket.io Connection (useEffect)
├── Conversations List
│   ├── Search Bar
│   └── Conversation Items
│       ├── Avatar with online indicator
│       ├── User name
│       ├── Last message preview
│       ├── Timestamp
│       └── Unread count badge
├── Message Window
│   ├── Chat Header
│   │   ├── Avatar with online indicator
│   │   └── Online/Offline status
│   ├── Messages Area
│   │   ├── Message Bubbles
│   │   ├── Typing Indicator
│   │   └── Auto-scroll ref
│   └── Message Input
│       ├── Text Input
│       └── Send Button
└── Empty State (no conversation selected)
```

---

## State Management

```javascript
const [socket, setSocket] = useState(null);              // Socket.io instance
const [conversations, setConversations] = useState([]);  // List of conversations
const [selectedConversation, setSelectedConversation] = useState(null); // Active chat
const [messages, setMessages] = useState([]);            // Messages in active chat
const [newMessage, setNewMessage] = useState('');        // Input field value
const [searchQuery, setSearchQuery] = useState('');      // Search filter
const [onlineUsers, setOnlineUsers] = useState([]);      // Array of online user IDs
const [typing, setTyping] = useState(false);             // Typing indicator state
```

---

## API Endpoints (REST Fallback)

### GET /api/messages/conversations
Get all conversations for logged-in user
```javascript
Response: {
  success: true,
  data: [
    {
      conversationId: "userId1_userId2",
      otherUser: { _id, name, email, role },
      lastMessage: { sender, text, createdAt },
      unreadCount: 3
    }
  ]
}
```

### GET /api/messages/conversation/:userId
Get all messages with a specific user
```javascript
Response: {
  success: true,
  data: [
    {
      _id: "messageId",
      sender: { _id, name, email, role },
      receiver: { _id, name, email, role },
      text: "Hello!",
      isRead: false,
      createdAt: "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Socket.io Connection

```javascript
const token = localStorage.getItem('token');
const newSocket = io('http://localhost:5000', {
  auth: { token },
});
```

### Authentication
- Token sent in `auth` object during connection
- Backend verifies JWT and attaches user to socket
- Only approved and active users can connect

---

## Sending Messages

```javascript
socket.emit('sendMessage', 
  {
    receiverId: selectedConversation.otherUser._id,
    text: newMessage,
  },
  (response) => {
    if (response.success) {
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
    }
  }
);
```

---

## Typing Indicators

### Start Typing
```javascript
socket.emit('typing', { 
  receiverId: selectedConversation.otherUser._id 
});
```

### Stop Typing (after 1 second)
```javascript
setTimeout(() => {
  socket.emit('stopTyping', { 
    receiverId: selectedConversation.otherUser._id 
  });
}, 1000);
```

---

## Read Receipts

Messages show:
- Single check (✓) - Message sent
- Double check (✓✓) - Message read

Backend automatically marks messages as read when conversation is opened.

---

## Online Status

- Green dot indicator on avatar when user is online
- Status text: "Online" or "Offline"
- Real-time updates via `userOnline` and `userOffline` events

---

## Responsive Design

### Mobile (< 768px)
- Conversation list takes full width
- Message window overlays on conversation selection

### Desktop (≥ 768px)
- Split view: 1/3 conversations, 2/3 messages
- Side-by-side layout

---

## Styling

### Colors
- Blue (#2563eb) - Sent messages, active conversation
- Gray (#f3f4f6) - Received messages
- Green (#10b981) - Online indicator
- Purple (#9333ea) - User avatars

### Animations
- Typing indicator: 3 bouncing dots with staggered delays
- Smooth scroll to bottom on new messages
- Hover effects on conversations

---

## Error Handling

- Socket connection errors logged to console
- Failed message sends show error in callback
- Graceful fallback to REST API if Socket.io fails

---

## Performance Optimizations

1. **Auto-scroll**: Only scrolls when new message arrives
2. **Typing debounce**: Stops typing indicator after 1 second
3. **Message limit**: Fetches last 50 messages per conversation
4. **Efficient re-renders**: Uses functional state updates

---

## Testing Checklist

- [ ] Socket.io connection establishes on mount
- [ ] Conversations load from API
- [ ] Messages load when conversation selected
- [ ] Send message works (Enter key and button)
- [ ] Typing indicator shows/hides correctly
- [ ] Online/offline status updates in real-time
- [ ] Read receipts display correctly
- [ ] Search filters conversations
- [ ] Auto-scroll works on new messages
- [ ] Responsive on mobile and desktop
- [ ] Socket disconnects on component unmount

---

## Future Enhancements

- [ ] File/image attachments
- [ ] Voice messages
- [ ] Message reactions (emoji)
- [ ] Delete/edit messages
- [ ] Group chats
- [ ] Message search within conversation
- [ ] Push notifications
- [ ] Message delivery status
- [ ] Last seen timestamp
- [ ] Block/unblock users
