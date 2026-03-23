# Mentorship API Documentation

## Base URL
```
http://localhost:5000/api/mentorship
```

## Overview

The mentorship system allows students to connect with seniors, alumni, and faculty for guidance and support.

### Rules:
1. Only students can send mentorship requests
2. Only seniors, alumni, and faculty can respond to requests
3. Pending users (especially alumni) cannot send or respond to requests
4. Users cannot send requests to themselves
5. Only one pending request allowed between two users

---

## Endpoints

### 1. Send Mentorship Request

**Endpoint:** `POST /api/mentorship`

**Description:** Send a mentorship request from student to senior/alumni/faculty

**Access:** Private (Students only, must be approved)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "receiver": "user_id_of_mentor",
  "message": "Hi, I would like to learn more about web development from you.",
  "mentorshipType": "technical",
  "duration": "short-term"
}
```

**Fields:**
- `receiver` (required) - User ID of the mentor
- `message` (required) - Message to the mentor (max 1000 chars)
- `mentorshipType` (optional) - Type: career, technical, academic, general (default: general)
- `duration` (optional) - Duration: one-time, short-term, long-term (default: short-term)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "request_id",
    "sender": {
      "_id": "student_id",
      "name": "John Doe",
      "email": "john@college.edu",
      "role": "student",
      "collegeName": "MIT",
      "graduationYear": 2024
    },
    "receiver": {
      "_id": "mentor_id",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "alumni",
      "collegeName": "MIT",
      "graduationYear": 2020
    },
    "message": "Hi, I would like to learn more about web development from you.",
    "mentorshipType": "technical",
    "duration": "short-term",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Mentorship request sent successfully"
}
```

**Error Responses:**
- 403: Only students can send mentorship requests
- 400: Mentorship requests can only be sent to seniors, alumni, or faculty
- 400: You already have a pending mentorship request with this user
- 400: Cannot send mentorship request to users with pending or rejected status
- 404: Receiver not found

---

### 2. Get All Mentorship Requests

**Endpoint:** `GET /api/mentorship`

**Description:** Get all mentorship requests (sent and received)

**Access:** Private

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `type` - Filter by type: "sent" or "received" (optional)
- `status` - Filter by status: pending, accepted, rejected, cancelled (optional)

**Example Requests:**
```bash
# Get all requests (sent and received)
GET /api/mentorship

# Get only sent requests
GET /api/mentorship?type=sent

# Get only received requests
GET /api/mentorship?type=received

# Get pending received requests
GET /api/mentorship?type=received&status=pending

# Get accepted sent requests
GET /api/mentorship?type=sent&status=accepted
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "request_id",
      "sender": {...},
      "receiver": {...},
      "message": "Request message",
      "mentorshipType": "technical",
      "duration": "short-term",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Single Mentorship Request

**Endpoint:** `GET /api/mentorship/:id`

**Description:** Get details of a specific mentorship request

**Access:** Private (Only sender or receiver)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "request_id",
    "sender": {...},
    "receiver": {...},
    "message": "Request message",
    "mentorshipType": "technical",
    "duration": "short-term",
    "status": "pending",
    "responseMessage": null,
    "respondedAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- 404: Mentorship request not found
- 403: You are not authorized to view this mentorship request

---

### 4. Respond to Mentorship Request

**Endpoint:** `PUT /api/mentorship/:id/respond`

**Description:** Accept or reject a mentorship request

**Access:** Private (Seniors/Alumni/Faculty only, must be approved)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "status": "accepted",
  "responseMessage": "I'd be happy to mentor you! Let's schedule a call."
}
```

**Fields:**
- `status` (required) - Either "accepted" or "rejected"
- `responseMessage` (optional) - Response message (max 500 chars)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "request_id",
    "sender": {...},
    "receiver": {...},
    "message": "Original request message",
    "status": "accepted",
    "responseMessage": "I'd be happy to mentor you! Let's schedule a call.",
    "respondedAt": "2024-01-02T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Mentorship request accepted successfully"
}
```

**Error Responses:**
- 403: Only seniors, alumni, and faculty can respond to mentorship requests
- 403: You can only respond to mentorship requests sent to you
- 400: Status must be either "accepted" or "rejected"
- 400: This request has already been accepted/rejected
- 404: Mentorship request not found

---

### 5. Cancel Mentorship Request

**Endpoint:** `DELETE /api/mentorship/:id`

**Description:** Cancel a pending mentorship request

**Access:** Private (Sender only)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {},
  "message": "Mentorship request cancelled successfully"
}
```

**Error Responses:**
- 403: You can only cancel mentorship requests that you sent
- 400: You can only cancel pending requests
- 404: Mentorship request not found

---

### 6. Get Mentorship Statistics

**Endpoint:** `GET /api/mentorship/stats`

**Description:** Get statistics about sent and received mentorship requests

**Access:** Private

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "sent": {
      "total": 10,
      "pending": 3,
      "accepted": 5
    },
    "received": {
      "total": 15,
      "pending": 4,
      "accepted": 8
    }
  }
}
```

---

### 7. Get Available Mentors

**Endpoint:** `GET /api/mentorship/mentors`

**Description:** Get list of available mentors (seniors, alumni, faculty)

**Access:** Private

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `role` - Filter by role: senior, alumni, faculty (optional)
- `collegeName` - Filter by college name (optional)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)

**Example Requests:**
```bash
# Get all mentors
GET /api/mentorship/mentors

# Get only alumni mentors
GET /api/mentorship/mentors?role=alumni

# Get mentors from specific college
GET /api/mentorship/mentors?collegeName=MIT

# Pagination
GET /api/mentorship/mentors?page=2&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "_id": "user_id",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "alumni",
      "collegeName": "MIT",
      "graduationYear": 2020,
      "linkedinUrl": "https://linkedin.com/in/janesmith"
    }
  ]
}
```

---

## Mentorship Request Statuses

- `pending` - Request sent, awaiting response
- `accepted` - Request accepted by mentor
- `rejected` - Request rejected by mentor
- `cancelled` - Request cancelled by sender

---

## Mentorship Types

- `career` - Career guidance and advice
- `technical` - Technical skills and knowledge
- `academic` - Academic support and guidance
- `general` - General mentorship

---

## Duration Options

- `one-time` - Single session or conversation
- `short-term` - Few weeks to a few months
- `long-term` - Extended mentorship relationship

---

## Validation Rules

### Sending Requests:
1. Must be a student
2. Must be approved (not pending)
3. Can only send to seniors, alumni, or faculty
4. Cannot send to users with pending/rejected status
5. Cannot send duplicate pending requests
6. Cannot send to yourself

### Responding to Requests:
1. Must be senior, alumni, or faculty
2. Must be approved (not pending)
3. Can only respond to requests sent to you
4. Can only respond to pending requests
5. Must specify "accepted" or "rejected"

---

## Testing Examples

### Send Mentorship Request (as Student)
```bash
curl -X POST http://localhost:5000/api/mentorship \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiver": "mentor_user_id",
    "message": "I would like to learn about web development",
    "mentorshipType": "technical",
    "duration": "short-term"
  }'
```

### Get Received Requests (as Mentor)
```bash
curl -X GET "http://localhost:5000/api/mentorship?type=received&status=pending" \
  -H "Authorization: Bearer MENTOR_TOKEN"
```

### Accept Request (as Mentor)
```bash
curl -X PUT http://localhost:5000/api/mentorship/REQUEST_ID/respond \
  -H "Authorization: Bearer MENTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted",
    "responseMessage": "Happy to help! Let'\''s connect."
  }'
```

### Get Available Mentors (as Student)
```bash
curl -X GET "http://localhost:5000/api/mentorship/mentors?role=alumni" \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### Get Statistics
```bash
curl -X GET http://localhost:5000/api/mentorship/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Common Use Cases

### Student Workflow:
1. Browse available mentors: `GET /api/mentorship/mentors`
2. Send request: `POST /api/mentorship`
3. Check sent requests: `GET /api/mentorship?type=sent`
4. View statistics: `GET /api/mentorship/stats`

### Mentor Workflow:
1. Check received requests: `GET /api/mentorship?type=received&status=pending`
2. View request details: `GET /api/mentorship/:id`
3. Accept/reject request: `PUT /api/mentorship/:id/respond`
4. View accepted mentorships: `GET /api/mentorship?type=received&status=accepted`

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
- 403: Forbidden (wrong role or not approved)
- 404: Not found
- 500: Server error
