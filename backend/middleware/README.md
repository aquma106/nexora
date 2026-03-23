# Middleware Documentation

## Authentication & Authorization Middleware

### 1. `protect`
**Purpose:** Verify JWT token and authenticate user

**Usage:**
```javascript
router.get('/profile', protect, getProfile);
```

**Checks:**
- Valid JWT token in Authorization header
- User exists in database
- User account is active
- User account is approved

**Errors:**
- 401: No token, invalid token, or user not found
- 403: Account deactivated or not approved

---

### 2. `authorize(...roles)`
**Purpose:** Restrict access to specific user roles

**Usage:**
```javascript
// Single role
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

// Multiple roles
router.post('/opportunities', protect, authorize('admin', 'faculty', 'alumni'), createOpportunity);
```

**Parameters:**
- `...roles` - One or more role names (student, senior, alumni, faculty, admin)

**Errors:**
- 401: User not authenticated
- 403: User role not in allowed roles list

---

### 3. `requireApproval`
**Purpose:** Block users with pending or rejected status from any action

**Usage:**
```javascript
router.post('/profile', protect, requireApproval, createProfile);
```

**Checks:**
- User status is "approved"
- Blocks "pending" and "rejected" users

**Errors:**
- 401: User not authenticated
- 403: Account pending or rejected

---

### 4. `requireAlumniApproval`
**Purpose:** Specifically check if alumni users are approved

**Usage:**
```javascript
router.post('/mentorship', protect, requireAlumniApproval, createMentorshipRequest);
```

**Checks:**
- If user is alumni AND status is pending, block the action
- Other roles pass through without checks

**Errors:**
- 401: User not authenticated
- 403: Alumni account pending approval

---

### 5. `restrictPendingUsers`
**Purpose:** Block pending users from posting jobs, mentorship requests, etc.

**Usage:**
```javascript
// Block pending users from posting jobs
router.post('/opportunities', protect, restrictPendingUsers, createOpportunity);

// Block pending users from sending mentorship requests
router.post('/mentorship', protect, restrictPendingUsers, createMentorshipRequest);
```

**Checks:**
- User status is not "pending"
- User status is not "rejected"

**Errors:**
- 401: User not authenticated
- 403: Account pending or rejected

---

### 6. `checkOwnership(ownerField)`
**Purpose:** Verify user owns the resource they're trying to access/modify

**Usage:**
```javascript
// Check if user owns their profile
router.put('/users/:id', protect, checkOwnership('userId'), updateUser);

// Admins bypass ownership check
```

**Parameters:**
- `ownerField` - Field name to check (default: 'userId')

**Behavior:**
- Admins can access any resource
- Regular users can only access their own resources

**Errors:**
- 401: User not authenticated
- 403: User doesn't own the resource

---

### 7. `optionalAuth`
**Purpose:** Authenticate user if token is provided, but don't fail if missing

**Usage:**
```javascript
// Public route that shows different data for authenticated users
router.get('/opportunities', optionalAuth, getOpportunities);
```

**Behavior:**
- If token provided and valid: `req.user` is populated
- If no token or invalid token: `req.user` is null
- Never throws errors

---

## Common Usage Patterns

### Public Route (No Authentication)
```javascript
router.post('/auth/register', register);
router.post('/auth/login', login);
```

### Protected Route (Authentication Required)
```javascript
router.get('/auth/me', protect, getMe);
```

### Role-Based Access
```javascript
// Only admins
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

// Multiple roles allowed
router.post('/opportunities', 
  protect, 
  authorize('admin', 'faculty', 'alumni'), 
  createOpportunity
);
```

### Block Pending Users
```javascript
// Block pending users from posting jobs
router.post('/opportunities', 
  protect, 
  restrictPendingUsers, 
  authorize('admin', 'faculty', 'alumni'),
  createOpportunity
);

// Block pending users from mentorship actions
router.post('/mentorship', 
  protect, 
  restrictPendingUsers,
  createMentorshipRequest
);
```

### Alumni-Specific Approval Check
```javascript
// Only check if alumni are approved
router.post('/mentorship', 
  protect, 
  requireAlumniApproval,
  createMentorshipRequest
);
```

### Resource Ownership
```javascript
// Users can only update their own profile
router.put('/profile/:id', 
  protect, 
  checkOwnership('userId'),
  updateProfile
);
```

### Combined Middleware
```javascript
// Complex example: Post job opportunity
router.post('/opportunities',
  protect,                    // Must be logged in
  restrictPendingUsers,       // Must be approved (not pending)
  authorize('admin', 'faculty', 'alumni'), // Must have specific role
  createOpportunity
);

// Send mentorship request
router.post('/mentorship',
  protect,                    // Must be logged in
  restrictPendingUsers,       // Must be approved
  createMentorshipRequest
);

// Update own profile
router.put('/profile/:id',
  protect,                    // Must be logged in
  checkOwnership('userId'),   // Must own the profile
  updateProfile
);
```

---

## Middleware Order Matters!

Always use middleware in this order:
1. `protect` - Authenticate user first
2. `requireApproval` / `restrictPendingUsers` / `requireAlumniApproval` - Check approval status
3. `authorize(...)` - Check role permissions
4. `checkOwnership(...)` - Check resource ownership
5. Controller function

**Example:**
```javascript
router.post('/opportunities',
  protect,                    // 1. Authenticate
  restrictPendingUsers,       // 2. Check approval
  authorize('admin', 'faculty'), // 3. Check role
  createOpportunity           // 4. Execute
);
```

---

## Error Response Format

All middleware errors follow this format:

```json
{
  "success": false,
  "message": "Error message here",
  "stack": "Stack trace (development only)"
}
```

**Common Status Codes:**
- 401: Authentication failed (no token, invalid token, user not found)
- 403: Authorization failed (wrong role, pending status, not owner)
- 404: Resource not found
- 500: Server error
