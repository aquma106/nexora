# Frontend-Backend Integration Testing Guide

## Overview
This document provides comprehensive testing procedures to verify the complete frontend-backend integration, JWT authentication, route protection, and full application flow.

---

## Prerequisites

### 1. Start Backend Server
```bash
cd backend
npm install
npm run dev
```
**Expected Output:**
```
Server running in development mode on port 5000
Socket.io server ready for connections
MongoDB connected successfully
```

### 2. Start Frontend Server
```bash
cd frontend
npm install
npm run dev
```
**Expected Output:**
```
VITE v8.x.x ready in xxx ms
➜ Local: http://localhost:3000/
```

### 3. Verify Environment Variables

**Backend `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nexora
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Integration Components

### 1. Axios Configuration (`frontend/src/utils/axios.js`)

**Features:**
- ✅ Base URL from environment variable
- ✅ Request interceptor adds JWT token
- ✅ Response interceptor handles 401 errors
- ✅ Automatic redirect to login on unauthorized

**Test:**
```javascript
// Check token is added to requests
const token = localStorage.getItem('token');
// Should be in Authorization header: Bearer <token>
```

### 2. AuthContext (`frontend/src/context/AuthContext.jsx`)

**Features:**
- ✅ JWT stored in localStorage
- ✅ User data stored in localStorage
- ✅ Token verification on app load
- ✅ Login/Register/Logout functions
- ✅ Update user function
- ✅ Loading state management

**State:**
```javascript
{
  user: { _id, name, email, role, status, ... },
  loading: boolean,
  isAuthenticated: boolean
}
```

### 3. ProtectedRoute (`frontend/src/components/ProtectedRoute.jsx`)

**Features:**
- ✅ Redirects to login if not authenticated
- ✅ Role-based access control
- ✅ Loading state during auth check
- ✅ Redirects to dashboard if unauthorized role

---

## Complete Flow Testing

### Test 1: User Registration Flow

**Scenario:** New student registers

**Steps:**
1. Navigate to `http://localhost:3000/register`
2. Fill in form:
   - Name: "Test Student"
   - Email: "student@college.edu"
   - Password: "password123"
   - Confirm Password: "password123"
   - Role: "Student"
   - College: "MIT"
   - Graduation Year: 2024
3. Click "Sign Up"

**Expected Backend Request:**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test Student",
  "email": "student@college.edu",
  "password": "password123",
  "role": "student",
  "collegeName": "MIT",
  "graduationYear": 2024
}
```

**Expected Backend Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "Test Student",
    "email": "student@college.edu",
    "role": "student",
    "status": "approved",
    "token": "jwt_token_here"
  }
}
```

**Expected Frontend Behavior:**
- ✅ Token stored in localStorage
- ✅ User data stored in localStorage
- ✅ Redirect to `/dashboard`
- ✅ User is authenticated

**Verify:**
```javascript
// Open browser console
localStorage.getItem('token') // Should return JWT token
localStorage.getItem('user') // Should return user JSON
```

---

### Test 2: Alumni Registration (Pending Status)

**Scenario:** Alumni registers and needs approval

**Steps:**
1. Navigate to `http://localhost:3000/register`
2. Fill in form:
   - Name: "Test Alumni"
   - Email: "alumni@example.com"
   - Password: "password123"
   - Role: "Alumni"
   - College: "MIT"
   - Graduation Year: 2020
   - LinkedIn URL: "https://linkedin.com/in/testalumni"
3. Click "Sign Up"

**Expected Backend Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "Test Alumni",
    "email": "alumni@example.com",
    "role": "alumni",
    "status": "pending",
    "token": "jwt_token_here"
  }
}
```

**Expected Frontend Behavior:**
- ✅ Success screen shown
- ✅ Message: "Your account is pending approval"
- ✅ Token NOT stored (pending status)
- ✅ Redirect to login after 3 seconds

---

### Test 3: Login Flow

**Scenario:** Existing user logs in

**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Email: "student@college.edu"
   - Password: "password123"
3. Click "Sign In"

**Expected Backend Request:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "student@college.edu",
  "password": "password123"
}
```

**Expected Backend Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "Test Student",
    "email": "student@college.edu",
    "role": "student",
    "status": "approved",
    "token": "jwt_token_here"
  }
}
```

**Expected Frontend Behavior:**
- ✅ Token stored in localStorage
- ✅ User data stored in localStorage
- ✅ AuthContext user state updated
- ✅ Redirect to `/dashboard`
- ✅ Sidebar shows user info

---

### Test 4: Protected Route Access

**Scenario:** Unauthenticated user tries to access protected route

**Steps:**
1. Clear localStorage (logout)
2. Navigate to `http://localhost:3000/dashboard`

**Expected Behavior:**
- ✅ Redirect to `/login`
- ✅ Dashboard not accessible

**Scenario:** Authenticated user accesses protected route

**Steps:**
1. Login as student
2. Navigate to `/dashboard`

**Expected Behavior:**
- ✅ Dashboard loads successfully
- ✅ User info displayed
- ✅ Sidebar shows navigation

---

### Test 5: Role-Based Access Control

**Scenario:** Student tries to access admin panel

**Steps:**
1. Login as student
2. Navigate to `http://localhost:3000/admin`

**Expected Behavior:**
- ✅ Redirect to `/dashboard`
- ✅ Admin panel not accessible

**Scenario:** Admin accesses admin panel

**Steps:**
1. Login as admin
2. Navigate to `/admin`

**Expected Behavior:**
- ✅ Admin panel loads
- ✅ Dashboard statistics displayed
- ✅ User management accessible

---

### Test 6: JWT Token in API Requests

**Scenario:** Verify token is sent with API requests

**Steps:**
1. Login as any user
2. Open browser DevTools → Network tab
3. Navigate to `/profile`
4. Check API request headers

**Expected Request Headers:**
```http
GET http://localhost:5000/api/profiles/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Verify:**
- ✅ Authorization header present
- ✅ Bearer token format
- ✅ Token matches localStorage

---

### Test 7: Token Expiration Handling

**Scenario:** Expired token triggers logout

**Steps:**
1. Login as user
2. Manually expire token in backend (or wait for expiration)
3. Make any API request (e.g., navigate to profile)

**Expected Behavior:**
- ✅ API returns 401 Unauthorized
- ✅ Axios interceptor catches error
- ✅ localStorage cleared
- ✅ Redirect to `/login`
- ✅ User logged out

---

### Test 8: Logout Flow

**Scenario:** User logs out

**Steps:**
1. Login as any user
2. Click user menu → Logout

**Expected Behavior:**
- ✅ localStorage.removeItem('token') called
- ✅ localStorage.removeItem('user') called
- ✅ AuthContext user state set to null
- ✅ Redirect to `/login`
- ✅ Cannot access protected routes

**Verify:**
```javascript
// Open browser console
localStorage.getItem('token') // Should return null
localStorage.getItem('user') // Should return null
```

---

### Test 9: Token Verification on App Load

**Scenario:** User refreshes page while logged in

**Steps:**
1. Login as user
2. Navigate to `/dashboard`
3. Refresh page (F5)

**Expected Behavior:**
- ✅ AuthContext checks localStorage
- ✅ Token found
- ✅ API call to `/auth/me` to verify token
- ✅ User data updated from server
- ✅ User remains logged in
- ✅ Dashboard loads without redirect

**Backend Request:**
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer <token>
```

---

### Test 10: Invalid Token Handling

**Scenario:** User has invalid token in localStorage

**Steps:**
1. Manually set invalid token:
   ```javascript
   localStorage.setItem('token', 'invalid_token_123');
   localStorage.setItem('user', JSON.stringify({ name: 'Test' }));
   ```
2. Refresh page

**Expected Behavior:**
- ✅ AuthContext tries to verify token
- ✅ API returns 401 Unauthorized
- ✅ localStorage cleared
- ✅ User set to null
- ✅ Redirect to `/login`

---

### Test 11: CORS Configuration

**Scenario:** Verify CORS allows frontend requests

**Steps:**
1. Open browser DevTools → Console
2. Make API request from frontend
3. Check for CORS errors

**Expected Behavior:**
- ✅ No CORS errors
- ✅ Requests succeed
- ✅ Backend allows origin: http://localhost:3000

**Backend CORS Config:**
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
```

---

### Test 12: Complete User Journey

**Scenario:** End-to-end user flow

**Steps:**
1. **Register** as student
2. **Login** with credentials
3. **View Dashboard** (protected route)
4. **Update Profile** (API call with token)
5. **Browse Opportunities** (API call with token)
6. **Send Message** (Socket.io with token)
7. **Logout**
8. **Try to access dashboard** (should redirect to login)

**Expected Behavior:**
- ✅ All steps complete successfully
- ✅ Token sent with every API request
- ✅ Protected routes accessible when authenticated
- ✅ Logout clears authentication
- ✅ Cannot access protected routes after logout

---

## API Endpoint Testing

### Test 13: Authentication Endpoints

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student",
    "collegeName": "MIT"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Current User:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

---

### Test 14: Protected Endpoints

**Get Profile (requires auth):**
```bash
curl -X GET http://localhost:5000/api/profiles/me \
  -H "Authorization: Bearer <token>"
```

**Expected Response (with valid token):**
```json
{
  "success": true,
  "data": { /* profile data */ }
}
```

**Expected Response (without token):**
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

**Expected Response (invalid token):**
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

---

### Test 15: Admin Endpoints

**Get All Users (admin only):**
```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer <admin_token>"
```

**Expected Response (admin token):**
```json
{
  "success": true,
  "data": [ /* users array */ ]
}
```

**Expected Response (non-admin token):**
```json
{
  "success": false,
  "message": "User role 'student' is not authorized to access this route"
}
```

---

## Browser Testing

### Test 16: LocalStorage Persistence

**Steps:**
1. Login as user
2. Open DevTools → Application → Local Storage
3. Verify entries:
   - `token`: JWT string
   - `user`: JSON object

**Expected:**
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
user: {"_id":"...","name":"Test User","email":"...","role":"student"}
```

---

### Test 17: Network Tab Inspection

**Steps:**
1. Login as user
2. Open DevTools → Network tab
3. Navigate through app
4. Inspect API requests

**Verify:**
- ✅ All API requests go to `http://localhost:5000/api`
- ✅ Authorization header present on protected routes
- ✅ Responses are JSON
- ✅ Status codes correct (200, 401, 403, etc.)

---

### Test 18: Console Error Check

**Steps:**
1. Open DevTools → Console
2. Navigate through entire app
3. Check for errors

**Expected:**
- ✅ No console errors
- ✅ No CORS errors
- ✅ No 404 errors
- ✅ No authentication errors

---

## Socket.io Integration

### Test 19: Socket.io Authentication

**Steps:**
1. Login as user
2. Navigate to `/messages`
3. Open DevTools → Network → WS (WebSocket)

**Expected:**
- ✅ WebSocket connection established
- ✅ Token sent in auth handshake
- ✅ Connection successful
- ✅ User can send/receive messages

**Socket Connection:**
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') }
});
```

---

## Error Handling

### Test 20: Network Error Handling

**Scenario:** Backend is down

**Steps:**
1. Stop backend server
2. Try to login from frontend

**Expected Behavior:**
- ✅ Error message displayed
- ✅ No app crash
- ✅ User-friendly error message

---

### Test 21: Invalid Credentials

**Steps:**
1. Try to login with wrong password

**Expected Behavior:**
- ✅ Error message: "Invalid credentials"
- ✅ No token stored
- ✅ User not logged in

---

### Test 22: Validation Errors

**Steps:**
1. Try to register with invalid email
2. Try to register with short password

**Expected Behavior:**
- ✅ Validation error displayed
- ✅ Form not submitted
- ✅ User-friendly error messages

---

## Performance Testing

### Test 23: Initial Load Time

**Metrics:**
- App load: < 2 seconds
- API response: < 500ms
- Token verification: < 300ms

---

### Test 24: Concurrent Requests

**Steps:**
1. Login as user
2. Navigate quickly through multiple pages
3. Verify all API requests complete

**Expected:**
- ✅ All requests succeed
- ✅ No race conditions
- ✅ Token sent with all requests

---

## Security Testing

### Test 25: XSS Protection

**Steps:**
1. Try to inject script in form fields
2. Submit form

**Expected:**
- ✅ Script not executed
- ✅ Data sanitized
- ✅ No XSS vulnerability

---

### Test 26: Token Security

**Verify:**
- ✅ Token stored in localStorage (not cookies for this app)
- ✅ Token sent only to same origin
- ✅ HTTPS in production (not tested in dev)
- ✅ Token has expiration

---

## Checklist

### Authentication
- [x] Register new user
- [x] Login existing user
- [x] Logout user
- [x] Token stored in localStorage
- [x] Token sent with API requests
- [x] Token verification on app load
- [x] Invalid token handling
- [x] Token expiration handling

### Authorization
- [x] Protected routes redirect to login
- [x] Role-based access control
- [x] Admin routes restricted
- [x] API endpoints check authorization

### Integration
- [x] Frontend connects to backend
- [x] CORS configured correctly
- [x] Environment variables set
- [x] Axios interceptors working
- [x] Socket.io authentication

### Error Handling
- [x] Network errors handled
- [x] Invalid credentials handled
- [x] Validation errors displayed
- [x] 401 errors trigger logout
- [x] User-friendly error messages

### User Experience
- [x] Loading states shown
- [x] Success messages displayed
- [x] Smooth navigation
- [x] No page flicker on refresh
- [x] Responsive design

---

## Troubleshooting

### Issue: CORS Error
**Solution:** Verify `CLIENT_URL` in backend `.env` matches frontend URL

### Issue: Token Not Sent
**Solution:** Check axios interceptor and localStorage

### Issue: 401 on Every Request
**Solution:** Verify JWT_SECRET matches between requests

### Issue: Cannot Access Protected Routes
**Solution:** Check ProtectedRoute component and user state

### Issue: Socket.io Connection Failed
**Solution:** Verify backend Socket.io CORS configuration

---

## Production Checklist

Before deploying:
- [ ] Change JWT_SECRET to strong random string
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS for all requests
- [ ] Update CORS to production domain
- [ ] Set secure token storage (httpOnly cookies in production)
- [ ] Enable rate limiting
- [ ] Add request logging
- [ ] Set up monitoring

---

**Integration Status**: ✅ FULLY CONNECTED AND WORKING

**Last Updated**: March 21, 2026
