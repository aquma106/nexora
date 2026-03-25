# Messaging & Mentorship Flow Guide

## Overview
This guide explains how users can message mentors after a mentorship request is accepted.

## Complete Flow

### Step 1: Send Mentorship Request (Student)

1. **Navigate to Mentorship Page**
   - Click "Mentorship" in the sidebar

2. **Browse Available Mentors**
   - View seniors, alumni, and faculty members
   - See their college, graduation year, and LinkedIn profile

3. **Send Request**
   - Click "Send Request" on a mentor's card
   - Fill out the form:
     - Mentorship Type (career, technical, academic, general)
     - Duration (one-time, short-term, long-term)
     - Message introducing yourself
   - Click "Send Request"

4. **Track Your Request**
   - Go to "Sent Requests" tab
   - See status: pending, accepted, or rejected

### Step 2: Accept Request (Mentor)

1. **Navigate to Mentorship Page**
   - Click "Mentorship" in the sidebar

2. **View Received Requests**
   - Go to "Received Requests" tab
   - See pending requests with student details

3. **Accept or Reject**
   - Click "Accept" to approve the mentorship
   - Click "Reject" to decline

### Step 3: Start Messaging (After Acceptance)

#### Option A: From Mentorship Page (NEW!)

**For Students (after mentor accepts):**
1. Go to Mentorship page → "Sent Requests" tab
2. Find the accepted request
3. Click the blue "Message [Mentor Name]" button
4. You'll be redirected to the Messages page
5. Start typing your first message

**For Mentors (after accepting):**
1. Go to Mentorship page → "Received Requests" tab
2. Find the accepted request
3. Click the blue "Message [Student Name]" button
4. You'll be redirected to the Messages page
5. Start typing your first message

#### Option B: From Messages Page

1. **Navigate to Messages Page**
   - Click "Messages" in the sidebar

2. **Start Conversation**
   - If you clicked "Message" from Mentorship page, the conversation will be ready
   - Type your first message
   - Press Enter or click Send

3. **Real-time Features**
   - See when the other person is online (green dot)
   - See typing indicators
   - Get read receipts (double check mark)

## Important Notes

### Why No Conversation Initially?

Conversations only appear in the Messages page after:
1. A mentorship request is accepted, AND
2. Someone sends the first message

This is by design - accepting a mentorship request doesn't automatically create a conversation. You need to click the "Message" button to start chatting.

### Features Available

✅ Real-time messaging with Socket.io
✅ Online/offline status indicators
✅ Typing indicators
✅ Read receipts
✅ Message history
✅ Unread message counts
✅ Search conversations

### Permissions

- **Students** can send mentorship requests to seniors, alumni, and faculty
- **Seniors, Alumni, Faculty** can accept/reject requests and mentor students
- **Pending users** (especially alumni awaiting approval) cannot send or respond to requests
- **All approved users** can message each other after mentorship is accepted

## Troubleshooting

### "No conversations yet" in Messages page

**Cause:** No one has sent a message yet

**Solution:**
1. Go to Mentorship page
2. Check if you have any accepted requests
3. Click the "Message" button on an accepted request
4. Send your first message

### Can't find the "Message" button

**Cause:** The mentorship request is still pending or was rejected

**Solution:**
- Wait for the mentor to accept (if you're a student)
- Accept the request first (if you're a mentor)
- The "Message" button only appears for accepted requests

### Socket connection issues

**Cause:** Backend server not running or Socket.io not configured

**Solution:**
1. Ensure backend is running: `cd backend && npm start`
2. Check backend logs for Socket.io connection
3. Verify `VITE_API_URL` in frontend/.env points to correct backend

### Rate limit errors (429)

**Cause:** Too many requests in development

**Solution:**
- Restart the backend server to clear rate limits
- Rate limits are more lenient in development mode
- See `RATE_LIMIT_FIX.md` for details

## User Experience Flow Diagram

```
Student                          Mentor
   |                               |
   | 1. Browse mentors             |
   | 2. Send request               |
   |------------------------------>|
   |                               | 3. View request
   |                               | 4. Accept/Reject
   |<------------------------------|
   | 5. See "accepted" status      |
   | 6. Click "Message" button     |
   |------------------------------>|
   |                               | 7. Receive notification
   | 8. Type first message         |
   |------------------------------>|
   |                               | 9. See message
   |                               | 10. Reply
   |<------------------------------|
   | 11. Real-time chat begins     |
```

## API Endpoints Used

### Mentorship
- `POST /api/mentorship` - Send request
- `GET /api/mentorship?type=sent` - Get sent requests
- `GET /api/mentorship?type=received` - Get received requests
- `PUT /api/mentorship/:id/respond` - Accept/reject request

### Messaging
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/conversation/:userId` - Get messages with user
- Socket.io `sendMessage` event - Send real-time message

### Users
- `GET /api/users/:id` - Get user details for new conversation

## Code Changes Made

### 1. Mentorship.jsx
- Added `useNavigate` hook
- Added `FiMessageCircle` icon
- Added `handleStartConversation()` function
- Added "Message" button for accepted requests in both tabs

### 2. Messages.jsx
- Added `useLocation` hook to handle navigation state
- Added `showNewConversation` state
- Added `fetchUserForNewConversation()` function
- Updated `sendMessage()` to refresh conversations after first message
- Improved empty state messages

## Testing

### Test the Complete Flow

1. **Create two users:**
   - Student account
   - Alumni/Senior account (ensure approved)

2. **As Student:**
   - Login
   - Go to Mentorship
   - Send request to the mentor

3. **As Mentor:**
   - Login
   - Go to Mentorship → Received Requests
   - Accept the request

4. **As Student:**
   - Refresh Mentorship page
   - Go to Sent Requests
   - See "accepted" status
   - Click "Message [Mentor Name]"
   - Send first message

5. **As Mentor:**
   - Go to Messages
   - See the new conversation
   - Reply

6. **Verify:**
   - Real-time message delivery
   - Online status indicators
   - Typing indicators
   - Read receipts

## Future Enhancements

Potential improvements:
- Auto-send welcome message when mentorship is accepted
- Notification system for new messages
- File/image sharing in messages
- Video call integration
- Message search functionality
- Archive conversations
- Block/report users
- Group messaging for multiple mentees
