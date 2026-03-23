# Admin API Documentation

## Base URL
```
http://localhost:5000/api/admin
```

## Overview

Admin APIs for managing users, approving alumni, and viewing platform statistics. All endpoints require admin authentication.

---

## Authentication

All admin endpoints require:
1. Valid JWT token
2. User role must be "admin"

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "User role 'student' is not authorized to access this route. Required roles: admin"
}
```

---

## Endpoints

### 1. Get Dashboard Statistics

**Endpoint:** `GET /api/admin/stats`

**Description:** Get comprehensive platform statistics

**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "students": 80,
      "seniors": 20,
      "alumni": 40,
      "faculty": 9,
      "pendingAlumni": 5,
      "approved": 140,
      "rejected": 5
    },
    "content": {
      "opportunities": {
        "total": 45,
        "active": 30
      },
      "applications": 200,
      "mentorships": {
        "total": 75,
        "accepted": 50
      },
      "messages": 1500,
      "profiles": 120
    },
    "recentActivity": {
      "newUsersThisWeek": 12,
      "newOpportunitiesThisWeek": 5,
      "newApplicationsThisWeek": 25
    }
  }
}
```

---

### 2. Get All Users

**Endpoint:** `GET /api/admin/users`

**Description:** Get all users with filters and pagination

**Access:** Admin only

**Query Parameters:**
- `role` - Filter by role: student, senior, alumni, faculty, admin
- `status` - Filter by status: pending, approved, rejected
- `search` - Search by name or email
- `collegeName` - Filter by college name
- `graduationYear` - Filter by graduation year
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

**Example:**
```bash
GET /api/admin/users?role=alumni&status=approved&page=1&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 20,
  "total": 45,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "alumni",
      "status": "approved",
      "collegeName": "MIT",
      "graduationYear": 2020,
      "linkedinUrl": "https://linkedin.com/in/johndoe",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 3. Get User by ID

**Endpoint:** `GET /api/admin/users/:id`

**Description:** Get detailed information about a specific user

**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "alumni",
      "status": "approved",
      "collegeName": "MIT",
      "graduationYear": 2020,
      "linkedinUrl": "https://linkedin.com/in/johndoe",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "profile": {
      "_id": "profile_id",
      "bio": "Software engineer...",
      "skills": ["JavaScript", "React"],
      "projects": [...],
      "experience": [...]
    },
    "statistics": {
      "opportunitiesPosted": 5,
      "applicationsSubmitted": 10,
      "mentorshipRequestsSent": 3,
      "mentorshipRequestsReceived": 8
    }
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 4. Get Alumni Verification Queue

**Endpoint:** `GET /api/admin/alumni/pending`

**Description:** Get all pending alumni awaiting approval (FIFO order)

**Access:** Admin only

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "total": 5,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "_id": "user_id",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "alumni",
      "status": "pending",
      "collegeName": "MIT",
      "graduationYear": 2019,
      "linkedinUrl": "https://linkedin.com/in/janesmith",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 5. Approve User

**Endpoint:** `PUT /api/admin/users/:id/approve`

**Description:** Approve a pending user (typically alumni)

**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "alumni",
    "status": "approved",
    "collegeName": "MIT",
    "graduationYear": 2019
  },
  "message": "alumni Jane Smith has been approved"
}
```

**Error Responses:**
- 404: User not found
- 400: User status is already approved/rejected

---

### 6. Reject User

**Endpoint:** `PUT /api/admin/users/:id/reject`

**Description:** Reject a pending user

**Access:** Admin only

**Request Body (Optional):**
```json
{
  "reason": "LinkedIn profile does not match college information"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "Jane Smith",
    "status": "rejected"
  },
  "message": "alumni Jane Smith has been rejected",
  "reason": "LinkedIn profile does not match college information"
}
```

---

### 7. Update User

**Endpoint:** `PUT /api/admin/users/:id`

**Description:** Update user information

**Access:** Admin only

**Request Body:**
```json
{
  "name": "Updated Name",
  "role": "faculty",
  "status": "approved",
  "collegeName": "Stanford",
  "graduationYear": 2021
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "Updated Name",
    "role": "faculty",
    "status": "approved"
  },
  "message": "User updated successfully"
}
```

**Note:** Cannot update password through this endpoint

---

### 8. Delete User

**Endpoint:** `DELETE /api/admin/users/:id`

**Description:** Permanently delete user and all related data

**Access:** Admin only

**What Gets Deleted:**
- User account
- User profile
- Posted opportunities
- Applications
- Mentorship requests (sent and received)
- Messages (sent and received)

**Success Response (200):**
```json
{
  "success": true,
  "data": {},
  "message": "User and all related data deleted successfully"
}
```

**Error Responses:**
- 404: User not found
- 400: You cannot delete your own account

---

### 9. Deactivate User

**Endpoint:** `PUT /api/admin/users/:id/deactivate`

**Description:** Deactivate user account (soft delete)

**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "isActive": false
  },
  "message": "User account deactivated successfully"
}
```

**Note:** Deactivated users cannot login

---

### 10. Activate User

**Endpoint:** `PUT /api/admin/users/:id/activate`

**Description:** Reactivate a deactivated user account

**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "isActive": true
  },
  "message": "User account activated successfully"
}
```

---

### 11. Get Recent Users

**Endpoint:** `GET /api/admin/users/recent`

**Description:** Get recently registered users

**Access:** Admin only

**Query Parameters:**
- `limit` - Number of users to return (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "user_id",
      "name": "New User",
      "email": "newuser@example.com",
      "role": "student",
      "status": "approved",
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

---

## Alumni Verification Workflow

### Step 1: Alumni Registers
```bash
POST /api/auth/register
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "alumni",
  "collegeName": "MIT",
  "graduationYear": 2019,
  "linkedinUrl": "https://linkedin.com/in/janesmith"
}
```
**Result:** User created with status = "pending"

---

### Step 2: Admin Views Pending Queue
```bash
GET /api/admin/alumni/pending
```
**Result:** List of all pending alumni (oldest first)

---

### Step 3: Admin Reviews Alumni Profile
```bash
GET /api/admin/users/:id
```
**Result:** Detailed user information including LinkedIn URL

---

### Step 4a: Admin Approves Alumni
```bash
PUT /api/admin/users/:id/approve
```
**Result:** Alumni can now login and access all features

---

### Step 4b: Admin Rejects Alumni
```bash
PUT /api/admin/users/:id/reject
{
  "reason": "Unable to verify college affiliation"
}
```
**Result:** Alumni cannot login, status = "rejected"

---

## Testing Examples

### Get Dashboard Stats
```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Get All Users
```bash
curl -X GET "http://localhost:5000/api/admin/users?role=alumni&status=pending" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Get Pending Alumni
```bash
curl -X GET http://localhost:5000/api/admin/alumni/pending \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Approve Alumni
```bash
curl -X PUT http://localhost:5000/api/admin/users/USER_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Reject Alumni
```bash
curl -X PUT http://localhost:5000/api/admin/users/USER_ID/reject \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "LinkedIn profile does not match"
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:5000/api/admin/users/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Deactivate User
```bash
curl -X PUT http://localhost:5000/api/admin/users/USER_ID/deactivate \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Admin Dashboard Features

### User Management:
- View all users with filters
- Search by name/email
- Filter by role, status, college
- View detailed user profiles
- Update user information
- Delete users permanently
- Deactivate/activate accounts

### Alumni Verification:
- View pending alumni queue (FIFO)
- Review LinkedIn profiles
- Approve/reject with reasons
- Track approval statistics

### Platform Statistics:
- Total users by role
- Pending alumni count
- Content statistics (opportunities, applications, etc.)
- Recent activity (last 7 days)
- Mentorship statistics

---

## Security Notes

1. Only users with role "admin" can access these endpoints
2. Admins cannot delete their own account
3. Admins cannot deactivate their own account
4. User passwords are never returned in responses
5. Deleting a user cascades to all related data

---

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message here",
  "stack": "Stack trace (development only)"
}
```

Common status codes:
- 400: Bad request (validation error)
- 401: Unauthorized (no token or invalid token)
- 403: Forbidden (not admin role)
- 404: Not found
- 500: Server error
