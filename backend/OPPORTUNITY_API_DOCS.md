# Opportunity & Application API Documentation

## Base URLs
```
http://localhost:5000/api/opportunities
http://localhost:5000/api/applications
```

---

## OPPORTUNITY ENDPOINTS

### 1. Get All Opportunities

**Endpoint:** `GET /api/opportunities`

**Description:** Get all opportunities with filters and search

**Access:** Public

**Query Parameters:**
- `type` - Filter by type: job, internship
- `status` - Filter by status: active, closed, draft (default: active)
- `company` - Filter by company name
- `location` - Filter by location
- `locationType` - Filter by location type: on-site, remote, hybrid
- `skills` - Filter by skills (comma-separated)
- `search` - Search in title, description, company
- `postedBy` - Filter by poster user ID
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)

**Example:**
```bash
GET /api/opportunities?type=job&skills=javascript,react&page=1
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
      "_id": "opp_id",
      "title": "Software Engineer",
      "description": "Job description",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "locationType": "hybrid",
      "type": "job",
      "postedBy": {
        "_id": "user_id",
        "name": "John Doe",
        "role": "alumni"
      },
      "skills": ["JavaScript", "React"],
      "status": "active",
      "views": 150,
      "applicationsCount": 25,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Single Opportunity

**Endpoint:** `GET /api/opportunities/:id`

**Description:** Get detailed information about a specific opportunity

**Access:** Public

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "opp_id",
    "title": "Software Engineer",
    "description": "Full job description...",
    "company": "Tech Corp",
    "location": "San Francisco, CA",
    "locationType": "hybrid",
    "type": "job",
    "postedBy": {...},
    "requirements": ["Bachelor's degree", "3+ years experience"],
    "skills": ["JavaScript", "React", "Node.js"],
    "salary": {
      "min": 80000,
      "max": 120000,
      "currency": "USD"
    },
    "duration": "Full-time",
    "applicationDeadline": "2024-12-31T00:00:00.000Z",
    "status": "active",
    "views": 151,
    "applicationsCount": 25
  }
}
```

---

### 3. Create Opportunity

**Endpoint:** `POST /api/opportunities`

**Description:** Create a new job/internship opportunity

**Access:** Private (Senior/Alumni/Faculty/Admin only, must be approved)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "Software Engineer",
  "description": "We are looking for a talented software engineer...",
  "company": "Tech Corp",
  "location": "San Francisco, CA",
  "locationType": "hybrid",
  "type": "job",
  "requirements": [
    "Bachelor's degree in Computer Science",
    "3+ years of experience",
    "Strong JavaScript skills"
  ],
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "salary": {
    "min": 80000,
    "max": 120000,
    "currency": "USD"
  },
  "duration": "Full-time",
  "applicationDeadline": "2024-12-31",
  "applicationUrl": "https://company.com/apply"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {...},
  "message": "Opportunity created successfully"
}
```

**Error Responses:**
- 403: Only seniors, alumni, faculty, and admins can post opportunities
- 403: Your account is pending approval...

---

### 4. Update Opportunity

**Endpoint:** `PUT /api/opportunities/:id`

**Description:** Update an opportunity

**Access:** Private (Owner or Admin)

**Success Response (200):**
```json
{
  "success": true,
  "data": {...},
  "message": "Opportunity updated successfully"
}
```

---

### 5. Delete Opportunity

**Endpoint:** `DELETE /api/opportunities/:id`

**Description:** Delete an opportunity

**Access:** Private (Owner or Admin)

---

### 6. Close Opportunity

**Endpoint:** `PUT /api/opportunities/:id/close`

**Description:** Close an opportunity (stop accepting applications)

**Access:** Private (Owner or Admin)

---

### 7. Get My Posted Opportunities

**Endpoint:** `GET /api/opportunities/my/posted`

**Description:** Get all opportunities posted by the authenticated user

**Access:** Private

---

### 8. Get Opportunity Statistics

**Endpoint:** `GET /api/opportunities/stats/overview`

**Description:** Get statistics about posted opportunities

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "opportunities": {
      "total": 10,
      "active": 7,
      "closed": 3
    },
    "applications": {
      "total": 125
    }
  }
}
```

---

## APPLICATION ENDPOINTS

### 1. Apply for Opportunity

**Endpoint:** `POST /api/applications`

**Description:** Submit an application for an opportunity

**Access:** Private (Must be approved)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "opportunityId": "opp_id",
  "coverLetter": "I am excited to apply for this position...",
  "resume": {
    "filename": "resume.pdf",
    "url": "https://storage.example.com/resumes/resume.pdf"
  },
  "answers": [
    {
      "question": "Why do you want to work here?",
      "answer": "I am passionate about..."
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "app_id",
    "userId": {...},
    "opportunityId": {...},
    "coverLetter": "...",
    "status": "submitted",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Application submitted successfully"
}
```

**Error Responses:**
- 400: You have already applied for this opportunity
- 400: This opportunity is no longer accepting applications
- 400: Application deadline has passed
- 404: Opportunity not found

---

### 2. Get Applications

**Endpoint:** `GET /api/applications`

**Description:** Get applications (filtered by role)

**Access:** Private

**Query Parameters:**
- `opportunityId` - Filter by opportunity (poster/admin only)
- `status` - Filter by status
- `page` - Page number
- `limit` - Results per page

**Behavior:**
- Regular users: See only their own applications
- Opportunity posters: See applications for their opportunities
- Admins: See all applications

---

### 3. Get My Applications

**Endpoint:** `GET /api/applications/my/applications`

**Description:** Get all applications submitted by the authenticated user

**Access:** Private

**Query Parameters:**
- `status` - Filter by status

---

### 4. Get Single Application

**Endpoint:** `GET /api/applications/:id`

**Description:** Get detailed information about an application

**Access:** Private (Applicant, Poster, or Admin)

---

### 5. Update Application Status

**Endpoint:** `PUT /api/applications/:id/status`

**Description:** Update the status of an application

**Access:** Private (Opportunity poster or Admin)

**Request Body:**
```json
{
  "status": "shortlisted",
  "feedback": "Great application! We'd like to interview you."
}
```

**Valid Statuses:**
- submitted
- under-review
- shortlisted
- rejected
- accepted
- withdrawn

---

### 6. Withdraw Application

**Endpoint:** `DELETE /api/applications/:id`

**Description:** Withdraw an application

**Access:** Private (Applicant only)

**Error:**
- 400: Cannot withdraw application that has been accepted/rejected

---

### 7. Get Application Statistics

**Endpoint:** `GET /api/applications/stats/overview`

**Description:** Get statistics about your applications

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 15,
    "submitted": 3,
    "underReview": 5,
    "shortlisted": 2,
    "accepted": 3,
    "rejected": 2
  }
}
```

---

## Complete Workflow Examples

### Poster Workflow (Alumni/Senior/Faculty):
1. Create opportunity: `POST /api/opportunities`
2. View posted opportunities: `GET /api/opportunities/my/posted`
3. View applications: `GET /api/applications?opportunityId=XXX`
4. Review application: `PUT /api/applications/:id/status`
5. Close opportunity: `PUT /api/opportunities/:id/close`

### Applicant Workflow (Student):
1. Browse opportunities: `GET /api/opportunities?type=job`
2. View details: `GET /api/opportunities/:id`
3. Apply: `POST /api/applications`
4. Track applications: `GET /api/applications/my/applications`
5. View statistics: `GET /api/applications/stats/overview`

---

## Authorization Rules

### Posting Opportunities:
- Only seniors, alumni, faculty, and admins
- Must be approved (not pending)

### Applying:
- Any authenticated user
- Must be approved (not pending)
- Cannot apply twice to same opportunity
- Cannot apply after deadline

### Viewing Applications:
- Users see their own applications
- Posters see applications for their opportunities
- Admins see all applications

### Updating Status:
- Only opportunity poster or admin
- Can update to any valid status
