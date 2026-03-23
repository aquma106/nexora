# Alumni-Student Networking Platform

A full-stack MERN application for connecting students with alumni, seniors, and faculty for mentorship, job opportunities, and networking.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control, stored in localStorage
- **Real-time Messaging**: Socket.io powered chat with typing indicators and read receipts
- **Mentorship System**: Students can request mentorship from seniors/alumni/faculty
- **Job Board**: Post and apply for jobs/internships with application tracking
- **Profile Management**: Comprehensive profiles with skills, projects, and experience
- **Admin Panel**: User management and alumni verification system
- **Protected Routes**: Automatic authentication checks and role-based access
- **Token Management**: Automatic token refresh and expiration handling

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.io (real-time)
- JWT + bcrypt (authentication)

### Frontend
- React 19 + Vite
- React Router v6
- Tailwind CSS v4
- Socket.io-client
- Axios

## 📦 Quick Start

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Configure environment variables (see QUICK_START.md)

# Start MongoDB
mongod

# Start backend (in backend folder)
npm run dev

# Start frontend (in frontend folder)
npm run dev
```

Visit `http://localhost:3000` to see the app!

## 🔒 Security Features

- **Input Validation**: Comprehensive validation with express-validator
- **Rate Limiting**: Protection against brute force and DDoS attacks
- **Security Headers**: Helmet.js for secure HTTP headers
- **NoSQL Injection Prevention**: Sanitization of MongoDB queries
- **XSS Protection**: Input sanitization to prevent script injection
- **Password Security**: Bcrypt hashing with 10 salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permission system
- **CORS Protection**: Restricted cross-origin requests
- **Error Handling**: Secure error messages without sensitive data
- **Payload Limiting**: Protection against large payload attacks
- **Suspicious Activity Logging**: Monitoring and logging of potential threats

## 📚 Documentation

- [Quick Start Guide](QUICK_START.md) - Setup and installation
- [Project Completion Summary](PROJECT_COMPLETION_SUMMARY.md) - Full feature list
- [Connection Verification](CONNECTION_VERIFICATION.md) - Frontend-backend integration details
- [Integration Testing](INTEGRATION_TESTING.md) - Complete testing guide
- [Security Guide](SECURITY.md) - Comprehensive security documentation
- [Backend API Docs](backend/API_DOCUMENTATION.md) - API endpoints
- [Frontend UI Docs](frontend/UI_FEATURES.md) - UI components

## 👥 User Roles

- **Student**: Apply for jobs, request mentorship
- **Senior**: Post opportunities, mentor students
- **Alumni**: Post opportunities, mentor (requires approval)
- **Faculty**: Post opportunities, mentor
- **Admin**: Full access, user management

## 🔐 Security

- Password hashing with bcrypt (10 salt rounds)
- JWT token authentication
- Role-based authorization middleware
- Alumni verification system
- Socket.io authentication

## 📱 Screenshots

### Dashboard
Modern dashboard with stats and quick actions

### Messaging
Real-time chat with typing indicators and online status

### Mentorship
Browse mentors and manage mentorship requests

### Opportunities
Job board with filters and application tracking

## 🤝 Contributing

This is a complete project template. Feel free to fork and customize for your needs!

## 📄 License

MIT License - feel free to use this project for learning or production.

---

**Built with ❤️ using MERN Stack**

Full-stack application using MongoDB, Express, React, and Node.js.

## Project Structure

```
/backend  - Node.js + Express API
/frontend - React + Vite + Tailwind CSS
```

## Setup Instructions

### Backend Setup

```bash
cd backend
npm install express mongoose dotenv cors
npm install -D nodemon
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install react react-dom
npm install -D vite @vitejs/plugin-react
npm install -D tailwindcss postcss autoprefixer
npm run dev
```

The frontend will run on `http://localhost:3000`

## Environment Variables

Create a `.env` file in the backend directory:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern_app
NODE_ENV=development
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB installed and running locally
- npm or yarn

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint

## Features

- Express server with CORS enabled
- MongoDB connection with Mongoose
- React with Vite for fast development
- Tailwind CSS for styling
- Proxy configuration for API calls
- Environment variables support

## Development

1. Start MongoDB service
2. Run backend: `cd backend && npm run dev`
3. Run frontend: `cd frontend && npm run dev`
4. Open browser at `http://localhost:3000`
