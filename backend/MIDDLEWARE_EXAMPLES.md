# Middleware Usage Examples

## Real-World Route Examples

### Opportunity Routes (Jobs/Internships)

```javascript
const express = require('express');
const router = express.Router();
const {
  protect,
  authorize,
  restrictPendingUsers,
  optionalAuth,
} = require('../middleware/auth');
const {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} = require('../controllers/opportunityController');

// Public - anyone can view (but authenticated users see more details)
router.get('/', optionalAuth, getOpportunities);
router.get('/:id', optionalAuth, getOpportunityById);

// Protected - only approved faculty, alumni, and admins can post jobs
router.post('/',
  protect,
  restrictPendingUsers,  // Block pending users
  authorize('admin', 'faculty', 'alumni'),
  createOpportunity
);

// Protected - only owner or admin can update
router.put('/:id',
  protect,
  restrictPendingUsers,
  authorize('admin', 'faculty', 'alumni'),
  updateOpportunity
);

// Protected - only admin can delete
router.delete('/:id',
  protect,
  authorize('admin'),
  deleteOpportunity
);

module.exports = router;
```

---

### Mentorship Request Routes

```javascript
const express = require('express');
const router = express.Router();
const {
  protect,
  restrictPendingUsers,
} = require('../middleware/auth');
const {
  getMentorshipRequests,
  createMentorshipRequest,
  respondToRequest,
  cancelRequest,
} = require('../controllers/mentorshipController');

// All mentorship actions require approval
// Pending alumni cannot send or respond to mentorship requests

router.get('/',
  protect,
  getMentorshipRequests
);

router.post('/',
  protect,
  restrictPendingUsers,  // Block pending users from sending requests
  createMentorshipRequest
);

router.put('/:id/respond',
  protect,
  restrictPendingUsers,  // Block pending users from responding
  respondToRequest
);

router.delete('/:id',
  protect,
  cancelRequest
);

module.exports = router;
```

---

### Application Routes

```javascript
const express = require('express');
const router = express.Router();
const {
  protect,
  authorize,
  restrictPendingUsers,
} = require('../middleware/auth');
const {
  getApplications,
  createApplication,
  updateApplicationStatus,
  withdrawApplication,
} = require('../controllers/applicationController');

// Get all applications (admin/faculty see all, users see their own)
router.get('/',
  protect,
  getApplications
);

// Apply to opportunity - pending users cannot apply
router.post('/',
  protect,
  restrictPendingUsers,  // Must be approved to apply
  createApplication
);

// Update application status (admin/faculty only)
router.put('/:id/status',
  protect,
  authorize('admin', 'faculty'),
  updateApplicationStatus
);

// Withdraw application (user's own application)
router.delete('/:id',
  protect,
  withdrawApplication
);

module.exports = router;
```

---

### Profile Routes

```javascript
const express = require('express');
const router = express.Router();
const {
  protect,
  checkOwnership,
  optionalAuth,
} = require('../middleware/auth');
const {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
} = require('../controllers/profileController');

// Public - anyone can view profiles
router.get('/', optionalAuth, getProfiles);
router.get('/:id', optionalAuth, getProfileById);

// Protected - users can create their own profile
router.post('/',
  protect,
  createProfile
);

// Protected - users can only update their own profile
router.put('/:id',
  protect,
  checkOwnership('userId'),
  updateProfile
);

// Protected - users can only delete their own profile
router.delete('/:id',
  protect,
  checkOwnership('userId'),
  deleteProfile
);

module.exports = router;
```

---

### Message Routes

```javascript
const express = require('express');
const router = express.Router();
const {
  protect,
  restrictPendingUsers,
} = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
} = require('../controllers/messageController');

// All messaging requires authentication and approval
router.get('/conversations',
  protect,
  getConversations
);

router.get('/:conversationId',
  protect,
  getMessages
);

router.post('/',
  protect,
  restrictPendingUsers,  // Pending users cannot send messages
  sendMessage
);

router.put('/:id/read',
  protect,
  markAsRead
);

router.delete('/:id',
  protect,
  deleteMessage
);

module.exports = router;
```

---

### User Management Routes (Admin)

```javascript
const express = require('express');
const router = express.Router();
const {
  protect,
  authorize,
} = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  approveUser,
  rejectUser,
} = require('../controllers/userController');

// All user management requires admin role
router.get('/',
  protect,
  authorize('admin'),
  getUsers
);

router.get('/:id',
  protect,
  authorize('admin'),
  getUserById
);

router.put('/:id',
  protect,
  authorize('admin'),
  updateUser
);

router.delete('/:id',
  protect,
  authorize('admin'),
  deleteUser
);

// Approve pending alumni
router.put('/:id/approve',
  protect,
  authorize('admin'),
  approveUser
);

// Reject pending alumni
router.put('/:id/reject',
  protect,
  authorize('admin'),
  rejectUser
);

module.exports = router;
```

---

## Summary of Middleware Usage by Feature

### Features Blocked for Pending Users:
1. ✅ Posting jobs/internships
2. ✅ Sending mentorship requests
3. ✅ Responding to mentorship requests
4. ✅ Applying to opportunities
5. ✅ Sending messages

### Features Allowed for Pending Users:
1. ✅ Viewing their profile
2. ✅ Viewing public opportunities
3. ✅ Viewing public profiles
4. ✅ Updating their own profile (to add LinkedIn, etc.)

### Admin-Only Features:
1. ✅ Approving/rejecting users
2. ✅ Deleting users
3. ✅ Viewing all applications
4. ✅ Deleting opportunities

---

## Testing Middleware

### Test Pending Alumni:
```bash
# 1. Register as alumni (status = pending)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alumni User",
    "email": "alumni@example.com",
    "password": "password123",
    "role": "alumni",
    "collegeName": "MIT",
    "graduationYear": 2020,
    "linkedinUrl": "https://linkedin.com/in/alumni"
  }'

# 2. Try to post a job (should fail with 403)
curl -X POST http://localhost:5000/api/opportunities \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer",
    "description": "Job description",
    "type": "job"
  }'

# Expected: 403 - "Your account is pending approval..."
```

### Test Role Authorization:
```bash
# Try to access admin route as student (should fail)
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer STUDENT_TOKEN"

# Expected: 403 - "User role 'student' is not authorized..."
```
