# Authentication API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Register a new user with role-based validation

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@college.edu",
  "password": "password123",
  "role": "student",
  "collegeName": "MIT",
  "graduationYear": 2024,
  "linkedinUrl": "https://linkedin.com/in/johndoe"
}
```

**Validation Rules:**
- Students MUST use college email (.edu, .ac, or contains "college")
- Alumni MUST provide linkedinUrl and graduationYear
- Alumni accounts start with status = "pending"
- Other roles are auto-approved

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@college.edu",
    "role": "student",
    "status": "approved",
    "collegeName": "MIT",
    "graduationYear": 2024,
    "token": "jwt_token_here"
  },
  "message": "Registration successful"
}
```

**Error Responses:**
- 400: User already exists
- 400: Students must use college email
- 400: Alumni must provide LinkedIn URL
- 400: Invalid role specified

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Login existing user and receive JWT token

**Request Body:**
```json
{
  "email": "john@college.edu",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@college.edu",
    "role": "student",
    "status": "approved",
    "collegeName": "MIT",
    "graduationYear": 2024,
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

**Error Responses:**
- 400: Please provide email and password
- 401: Invalid email or password
- 403: Account deactivated
- 403: Account pending approval (for alumni)
- 403: Account registration rejected

---

### 3. Get Current User

**Endpoint:** `GET /api/auth/me`

**Description:** Get currently logged in user details

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@college.edu",
    "role": "student",
    "status": "approved",
    "collegeName": "MIT",
    "graduationYear": 2024,
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- 401: Not authorized (no token or invalid token)
- 403: Account not approved

---

### 4. Update Password

**Endpoint:** `PUT /api/auth/updatepassword`

**Description:** Update user password

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_here"
  },
  "message": "Password updated successfully"
}
```

**Error Responses:**
- 400: Please provide current and new password
- 400: New password must be at least 6 characters
- 401: Current password is incorrect

---

## User Roles

- `student` - Must use college email, auto-approved
- `senior` - Auto-approved
- `alumni` - Must provide LinkedIn URL, status = pending
- `faculty` - Auto-approved
- `admin` - Auto-approved

## User Status

- `pending` - Awaiting approval (alumni only)
- `approved` - Can access the platform
- `rejected` - Cannot login

## Authentication Flow

1. User registers with appropriate credentials
2. Password is hashed using bcrypt
3. JWT token is generated and returned
4. Client stores token (localStorage/cookies)
5. Client sends token in Authorization header for protected routes
6. Server verifies token and grants access

## Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "stack": "Stack trace (development only)"
}
```

## Testing with cURL

### Register Student
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@college.edu",
    "password": "password123",
    "role": "student",
    "collegeName": "MIT",
    "graduationYear": 2024
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@college.edu",
    "password": "password123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
