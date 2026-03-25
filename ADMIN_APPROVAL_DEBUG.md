# Admin Alumni Approval - Debugging Guide

## Issue
Alumni approval by admin is not working properly.

## Changes Made

### 1. Enhanced Error Handling in Frontend (`frontend/src/pages/Admin.jsx`)
- Added console logging to `handleApprove` and `handleReject` functions
- Now logs the request and response for debugging
- Shows detailed error messages from the backend

### 2. Enhanced Logging in Backend (`backend/controllers/adminController.js`)
- Added console logging to `approveUser` and `rejectUser` functions
- Logs user ID, name, and status changes
- Helps track the approval flow

## How to Debug

### Step 1: Check Browser Console
1. Open the Admin page in your browser
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Try to approve an alumni
5. Look for these logs:
   - `Approving user: <userId>`
   - `Approve response: <response data>`
   - Any error messages

### Step 2: Check Backend Logs
1. Look at your backend terminal/console
2. You should see:
   - `Approve user request received for ID: <userId>`
   - `User found: <userName> Current status: <status>`
   - `User approved successfully: <userName>`

### Step 3: Check Network Tab
1. In Developer Tools, go to Network tab
2. Try to approve an alumni
3. Look for the PUT request to `/api/admin/users/<id>/approve`
4. Check:
   - Request Headers (Authorization token present?)
   - Response Status (200 OK? 401 Unauthorized? 403 Forbidden?)
   - Response Body (success message or error?)

## Common Issues and Solutions

### Issue 1: 401 Unauthorized
**Cause**: Admin token is missing or invalid
**Solution**:
- Check if admin is logged in
- Verify token is stored in localStorage
- Check axios interceptor is adding the token to requests

### Issue 2: 403 Forbidden
**Cause**: User doesn't have admin role
**Solution**:
- Verify the logged-in user has `role: 'admin'`
- Check the database: `db.users.findOne({email: 'admin@example.com'})`
- Ensure admin user has `status: 'approved'`

### Issue 3: 404 Not Found
**Cause**: User ID is incorrect or user doesn't exist
**Solution**:
- Verify the user ID in the pending alumni list
- Check database: `db.users.findById('<userId>')`

### Issue 4: 400 Bad Request - "User status is already approved"
**Cause**: User is already approved
**Solution**:
- Refresh the pending alumni list
- The user might have been approved already

### Issue 5: CORS Error
**Cause**: Frontend and backend CORS mismatch
**Solution**:
- Check `backend/.env` has correct `CLIENT_URL`
- Verify frontend is running on the correct port
- Check backend CORS configuration in `server.js`

## Testing Manually with cURL

### 1. Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword"}'
```

Save the token from the response.

### 2. Get Pending Alumni
```bash
curl -X GET http://localhost:5000/api/admin/alumni/pending \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Approve a User
```bash
curl -X PUT http://localhost:5000/api/admin/users/USER_ID_HERE/approve \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 4. Reject a User
```bash
curl -X PUT http://localhost:5000/api/admin/users/USER_ID_HERE/reject \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Invalid LinkedIn profile"}'
```

## Database Verification

### Check Admin User
```javascript
db.users.findOne({role: 'admin'})
```

Should show:
- `role: 'admin'`
- `status: 'approved'`
- `isActive: true`

### Check Pending Alumni
```javascript
db.users.find({role: 'alumni', status: 'pending'})
```

### Manually Approve a User (if needed)
```javascript
db.users.updateOne(
  {_id: ObjectId('USER_ID_HERE')},
  {$set: {status: 'approved'}}
)
```

## Quick Fix Checklist

- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] Admin user exists with `role: 'admin'` and `status: 'approved'`
- [ ] Admin is logged in (token in localStorage)
- [ ] Pending alumni exist in the database
- [ ] CORS is properly configured
- [ ] No console errors in browser
- [ ] No errors in backend logs

## If Still Not Working

1. **Clear browser cache and localStorage**
   ```javascript
   localStorage.clear()
   ```
   Then login again as admin

2. **Restart both servers**
   ```bash
   # Backend
   cd backend
   npm start
   
   # Frontend
   cd frontend
   npm run dev
   ```

3. **Check environment variables**
   - `backend/.env` has correct `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`
   - `frontend/.env` has correct `VITE_API_URL`

4. **Verify database connection**
   - Check MongoDB is running
   - Verify connection string in `backend/.env`

## Contact
If the issue persists after following this guide, provide:
1. Browser console logs
2. Backend terminal logs
3. Network tab screenshot showing the failed request
4. Database query results for admin user
