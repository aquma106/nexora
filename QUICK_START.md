# Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn

---

## Setup Instructions

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

#### Backend `.env`
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern-stack
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h
CLIENT_URL=http://localhost:3000
```

#### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB

```bash
# Make sure MongoDB is running
mongod
```

### 4. Start Backend Server

```bash
cd backend
npm run dev
```

Server will run on `http://localhost:5000`

### 5. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## First Time Setup

### Create Admin Account

1. Register a new user at `http://localhost:3000/register`
2. Use any email and select "Admin" role
3. Login with the credentials

### Test the Application

1. **Register Users**
   - Student (must use college email like `student@college.edu`)
   - Alumni (provide LinkedIn URL, status will be "pending")
   - Senior (any email)

2. **Approve Alumni** (as admin)
   - Go to Admin panel
   - View pending alumni queue
   - Approve alumni accounts

3. **Test Mentorship**
   - Login as student
   - Browse mentors
   - Send mentorship request
   - Login as mentor
   - Accept/reject request

4. **Test Opportunities**
   - Login as senior/alumni/faculty
   - Post a job/internship
   - Login as student
   - Apply for opportunity

5. **Test Messaging**
   - Login as any user
   - Go to Messages page
   - Start a conversation
   - Test real-time features (typing, online status)

---

## Default Ports

- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`

---

## API Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
```bash
mongod
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Kill the process using the port
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Tailwind CSS Not Working
```
Error: [postcss] It looks like you're trying to use `tailwindcss` directly
```
**Solution**: Already fixed! Using `@tailwindcss/postcss` plugin

### Socket.io Connection Failed
```
Error: WebSocket connection failed
```
**Solution**: 
1. Check backend is running
2. Verify `CLIENT_URL` in backend `.env`
3. Check browser console for CORS errors

---

## User Roles & Permissions

| Feature | Student | Senior | Alumni | Faculty | Admin |
|---------|---------|--------|--------|---------|-------|
| Browse Opportunities | ✅ | ✅ | ✅ | ✅ | ✅ |
| Apply for Jobs | ✅ | ✅ | ❌ | ❌ | ✅ |
| Post Opportunities | ❌ | ✅ | ✅* | ✅ | ✅ |
| Send Mentorship Request | ✅ | ❌ | ❌ | ❌ | ❌ |
| Accept Mentorship Request | ❌ | ✅ | ✅* | ✅ | ✅ |
| Messaging | ✅ | ✅ | ✅* | ✅ | ✅ |
| Admin Panel | ❌ | ❌ | ❌ | ❌ | ✅ |

*Alumni must be approved by admin first

---

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Vite automatically reloads on file changes
- Backend: Nodemon restarts server on file changes

### API Testing
Use tools like:
- Postman
- Thunder Client (VS Code extension)
- curl commands

### Database GUI
Use MongoDB Compass to view database:
```
mongodb://localhost:27017/mern-stack
```

---

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production MongoDB URI
4. Enable HTTPS
5. Set proper CORS origins

### Frontend
1. Build production bundle:
   ```bash
   npm run build
   ```
2. Serve `dist` folder with nginx/Apache
3. Update `VITE_API_URL` to production API

---

## Support

For issues or questions:
1. Check documentation files in project root
2. Review API documentation in `backend/` folder
3. Check UI documentation in `frontend/` folder

---

## Next Steps

1. ✅ Complete basic setup
2. ✅ Test all features
3. 🔄 Customize for your needs
4. 🔄 Add additional features
5. 🔄 Deploy to production

---

**Happy Coding! 🚀**
