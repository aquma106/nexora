# Frontend Setup Guide

## Installation

```bash
cd frontend
npm install react-router-dom axios react-icons
npm run dev
```

The frontend will run on `http://localhost:3000`

---

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.jsx           # Main layout wrapper
│   │   ├── Navbar.jsx           # Top navigation bar
│   │   ├── Sidebar.jsx          # Side navigation menu
│   │   └── ProtectedRoute.jsx   # Route protection wrapper
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication context
│   ├── pages/
│   │   ├── Login.jsx            # Login page
│   │   ├── Register.jsx         # Registration page
│   │   └── Dashboard.jsx        # Dashboard page
│   ├── utils/
│   │   └── axios.js             # Axios configuration
│   ├── App.jsx                  # Main app component
│   └── main.jsx                 # Entry point
├── .env                         # Environment variables
└── package.json
```

---

## Features Implemented

### Authentication
- Login page with email/password
- Registration page with role selection
- Alumni require LinkedIn URL
- JWT token storage in localStorage
- Auto-redirect on authentication
- Protected routes

### Layout
- Responsive navbar with user menu
- Collapsible sidebar (mobile-friendly)
- Role-based menu items
- Notification bell
- User avatar with dropdown

### Dashboard
- Welcome section
- Statistics cards (Opportunities, Connections, Messages, Profile Views)
- Recent opportunities list
- Recent messages list
- Quick action buttons

### Routing
- React Router v6
- Protected routes
- Role-based access control
- Auto-redirect to dashboard after login

### API Integration
- Axios instance with interceptors
- Automatic token injection
- 401 error handling (auto-logout)
- Base URL configuration

---

## Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Available Routes

### Public Routes
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (Require Authentication)
- `/dashboard` - Dashboard (all roles)
- `/opportunities` - Opportunities page (all roles)
- `/mentorship` - Mentorship page (all roles)
- `/messages` - Messages page (all roles)
- `/profile` - Profile page (all roles)
- `/settings` - Settings page (all roles)
- `/admin` - Admin panel (admin only)

---

## Components

### Layout.jsx
Main layout wrapper with navbar and sidebar. Uses `<Outlet />` for nested routes.

### Navbar.jsx
Top navigation bar with:
- Logo
- Hamburger menu (mobile)
- Notifications bell
- User menu with dropdown

### Sidebar.jsx
Side navigation menu with:
- Role-based menu items
- Active route highlighting
- Mobile responsive (slide-in)
- User info at bottom

### ProtectedRoute.jsx
Route protection wrapper:
- Checks authentication
- Checks user roles
- Shows loading spinner
- Redirects to login if not authenticated

---

## Context

### AuthContext
Provides authentication state and methods:
- `user` - Current user object
- `loading` - Loading state
- `isAuthenticated` - Boolean
- `login(email, password)` - Login method
- `register(userData)` - Register method
- `logout()` - Logout method

Usage:
```javascript
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { user, login, logout } = useAuth();
  // ...
};
```

---

## Axios Configuration

### Features:
- Base URL from environment variable
- Automatic token injection in headers
- 401 error interceptor (auto-logout)
- JSON content type

Usage:
```javascript
import axios from '../utils/axios';

// GET request
const { data } = await axios.get('/opportunities');

// POST request
const { data } = await axios.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});
```

---

## Styling

Using Tailwind CSS with custom configuration:
- Responsive design (mobile-first)
- Custom color palette
- Gradient backgrounds
- Hover effects
- Transitions and animations

---

## User Roles

The app supports 5 user roles:
1. `student` - Students
2. `senior` - Senior students
3. `alumni` - Alumni (require approval)
4. `faculty` - Faculty members
5. `admin` - Administrators

Role-based features:
- Different menu items
- Different permissions
- Admin-only routes

---

## Registration Flow

### Student Registration:
1. Fill form with college email
2. Auto-approved
3. Redirect to dashboard

### Alumni Registration:
1. Fill form with LinkedIn URL
2. Status = "pending"
3. Show success message
4. Redirect to login
5. Cannot login until admin approves

---

## Testing

### Test Login:
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Register a new user
4. Login with credentials
5. Access dashboard

### Test Protected Routes:
1. Try accessing `/dashboard` without login
2. Should redirect to `/login`
3. Login and try again
4. Should access dashboard

### Test Role-Based Access:
1. Login as student
2. Try accessing `/admin`
3. Should redirect to `/dashboard`
4. Login as admin
5. Should access admin panel

---

## Next Steps

To complete the frontend:

1. **Opportunities Page**
   - List opportunities
   - Filter and search
   - Apply to opportunities
   - View application status

2. **Mentorship Page**
   - Browse mentors
   - Send mentorship requests
   - View requests (sent/received)
   - Accept/reject requests

3. **Messages Page**
   - Real-time chat with Socket.io
   - Conversation list
   - Message history
   - Typing indicators

4. **Profile Page**
   - View/edit profile
   - Add projects, experience, education
   - Upload resume
   - Social links

5. **Admin Panel**
   - Dashboard statistics
   - User management
   - Alumni verification queue
   - Approve/reject users

---

## Common Issues

### CORS Error:
Make sure backend has CORS enabled:
```javascript
app.use(cors());
```

### 401 Unauthorized:
Check if token is being sent:
```javascript
// In axios.js
config.headers.Authorization = `Bearer ${token}`;
```

### Routes Not Working:
Make sure BrowserRouter wraps the app:
```javascript
<BrowserRouter>
  <Routes>...</Routes>
</BrowserRouter>
```

---

## Development Tips

1. Use React DevTools for debugging
2. Check Network tab for API calls
3. Use console.log for debugging
4. Test on mobile viewport
5. Clear localStorage if auth issues

---

## Production Build

```bash
npm run build
```

Output will be in `dist/` folder.

Deploy to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service
