# Profile API Documentation

## Base URL
```
http://localhost:5000/api/profiles
```

---

## Public Endpoints

### 1. Get All Profiles (with Search & Filters)

**Endpoint:** `GET /api/profiles`

**Description:** Get all profiles with optional search and filtering

**Query Parameters:**
- `search` - Search by name or email
- `skills` - Filter by skills (comma-separated)
- `role` - Filter by user role (student, alumni, faculty, etc.)
- `graduationYear` - Filter by graduation year
- `collegeName` - Filter by college name
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)

**Example Request:**
```bash
GET /api/profiles?search=john&skills=javascript,react&page=1&limit=10
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
      "_id": "profile_id",
      "userId": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@college.edu",
        "role": "student",
        "collegeName": "MIT",
        "graduationYear": 2024
      },
      "bio": "Software developer passionate about web technologies",
      "skills": ["JavaScript", "React", "Node.js"],
      "projects": [...],
      "experience": [...],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Profile by User ID

**Endpoint:** `GET /api/profiles/user/:userId`

**Description:** Get a specific user's profile by their user ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "profile_id",
    "userId": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@college.edu",
      "role": "student"
    },
    "bio": "Software developer",
    "skills": ["JavaScript", "React"],
    "projects": [],
    "experience": [],
    "education": []
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Profile not found"
}
```

---

### 3. Get Profile by Profile ID

**Endpoint:** `GET /api/profiles/:id`

**Description:** Get a profile by its profile ID

**Success Response (200):** Same as above

---

### 4. Search Profiles by Skills

**Endpoint:** `GET /api/profiles/search/skills?skills=javascript,react`

**Description:** Search profiles by specific skills

**Query Parameters:**
- `skills` (required) - Comma-separated list of skills

**Success Response (200):**
```json
{
  "success": true,
  "count": 15,
  "data": [...]
}
```

---

## Protected Endpoints (Authentication Required)

### 5. Get My Profile

**Endpoint:** `GET /api/profiles/me/profile`

**Description:** Get the authenticated user's profile

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "profile_id",
    "userId": {...},
    "bio": "My bio",
    "skills": [...],
    "projects": [...],
    "experience": [...],
    "education": [...]
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Profile not found. Please create a profile first."
}
```

---

### 6. Create Profile

**Endpoint:** `POST /api/profiles`

**Description:** Create a new profile for the authenticated user

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "bio": "Passionate software developer with 3 years of experience",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "socialLinks": {
    "github": "https://github.com/johndoe",
    "portfolio": "https://johndoe.com",
    "twitter": "https://twitter.com/johndoe"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "profile_id",
    "userId": {...},
    "bio": "Passionate software developer",
    "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
    "socialLinks": {...}
  },
  "message": "Profile created successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Profile already exists for this user. Use update instead."
}
```

---

### 7. Update My Profile

**Endpoint:** `PUT /api/profiles/me`

**Description:** Update the authenticated user's profile

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "bio": "Updated bio",
  "skills": ["JavaScript", "TypeScript", "React", "Next.js"],
  "socialLinks": {
    "github": "https://github.com/johndoe"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {...},
  "message": "Profile updated successfully"
}
```

---

### 8. Update Profile by ID

**Endpoint:** `PUT /api/profiles/:id`

**Description:** Update a profile by ID (only own profile or admin)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:** Same as update my profile

**Success Response (200):** Same as above

**Error Response (403):**
```json
{
  "success": false,
  "message": "You can only update your own profile"
}
```

---

### 9. Delete Profile

**Endpoint:** `DELETE /api/profiles/:id`

**Description:** Delete a profile (only own profile or admin)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {},
  "message": "Profile deleted successfully"
}
```

---

### 10. Add Project

**Endpoint:** `POST /api/profiles/me/projects`

**Description:** Add a project to your profile

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "E-commerce Platform",
  "description": "Built a full-stack e-commerce platform with React and Node.js",
  "technologies": ["React", "Node.js", "MongoDB", "Stripe"],
  "link": "https://github.com/johndoe/ecommerce",
  "startDate": "2023-01-01",
  "endDate": "2023-06-01",
  "isCurrent": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {...},
  "message": "Project added successfully"
}
```

---

### 11. Add Experience

**Endpoint:** `POST /api/profiles/me/experience`

**Description:** Add work experience to your profile

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "company": "Tech Corp",
  "position": "Software Engineer",
  "description": "Developed web applications using React and Node.js",
  "startDate": "2022-01-01",
  "endDate": "2023-12-31",
  "isCurrent": false,
  "location": "San Francisco, CA"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {...},
  "message": "Experience added successfully"
}
```

---

### 12. Add Education

**Endpoint:** `POST /api/profiles/me/education`

**Description:** Add education to your profile

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "institution": "MIT",
  "degree": "Bachelor of Science",
  "fieldOfStudy": "Computer Science",
  "startDate": "2020-09-01",
  "endDate": "2024-05-01",
  "grade": "3.8 GPA"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {...},
  "message": "Education added successfully"
}
```

---

## Complete Profile Structure

```json
{
  "_id": "profile_id",
  "userId": "user_id",
  "bio": "Software developer passionate about web technologies",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "projects": [
    {
      "title": "E-commerce Platform",
      "description": "Full-stack e-commerce application",
      "technologies": ["React", "Node.js", "MongoDB"],
      "link": "https://github.com/johndoe/ecommerce",
      "startDate": "2023-01-01",
      "endDate": "2023-06-01",
      "isCurrent": false
    }
  ],
  "experience": [
    {
      "company": "Tech Corp",
      "position": "Software Engineer",
      "description": "Developed web applications",
      "startDate": "2022-01-01",
      "endDate": "2023-12-31",
      "isCurrent": false,
      "location": "San Francisco, CA"
    }
  ],
  "education": [
    {
      "institution": "MIT",
      "degree": "Bachelor of Science",
      "fieldOfStudy": "Computer Science",
      "startDate": "2020-09-01",
      "endDate": "2024-05-01",
      "grade": "3.8 GPA"
    }
  ],
  "resume": {
    "filename": "resume.pdf",
    "url": "https://storage.example.com/resumes/resume.pdf",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  },
  "socialLinks": {
    "github": "https://github.com/johndoe",
    "portfolio": "https://johndoe.com",
    "twitter": "https://twitter.com/johndoe"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

---

## Testing Examples

### Create Profile
```bash
curl -X POST http://localhost:5000/api/profiles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Software developer",
    "skills": ["JavaScript", "React", "Node.js"]
  }'
```

### Search Profiles
```bash
curl -X GET "http://localhost:5000/api/profiles?search=john&skills=javascript,react&page=1"
```

### Get My Profile
```bash
curl -X GET http://localhost:5000/api/profiles/me/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update My Profile
```bash
curl -X PUT http://localhost:5000/api/profiles/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated bio",
    "skills": ["JavaScript", "TypeScript", "React"]
  }'
```

### Add Project
```bash
curl -X POST http://localhost:5000/api/profiles/me/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Project",
    "description": "Project description",
    "technologies": ["React", "Node.js"]
  }'
```

---

## Authorization Rules

1. **Public Access:**
   - View all profiles
   - Search profiles
   - View specific profile

2. **Authenticated Users:**
   - Create their own profile
   - Update their own profile
   - Delete their own profile
   - Add projects/experience/education

3. **Admins:**
   - Can update/delete any profile
   - Full access to all operations

4. **Ownership:**
   - Users can only modify their own profile
   - Admins can modify any profile
