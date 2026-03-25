# Backend API

Clean and scalable Express.js backend with MongoDB.

## Project Structure

```
backend/
├── config/
│   ├── db.js           # MongoDB connection
│   └── config.js       # Configuration variables
├── controllers/
│   └── userController.js   # User business logic
├── middleware/
│   ├── errorHandler.js     # Error handling
│   ├── asyncHandler.js     # Async wrapper
│   └── logger.js           # Request logger
├── models/
│   └── User.js             # User schema
├── routes/
│   ├── index.js            # Main router
│   └── userRoutes.js       # User routes
├── .env                    # Environment variables
├── .env.example            # Example env file
├── server.js               # Entry point
└── package.json
```

## Setup

1. Install dependencies:
```bash
npm install express mongoose dotenv cors
npm install -D nodemon
```




3. Start the server:
```bash
npm run dev
```

## API Endpoints



### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Features


- Centralized error handling
- Async error wrapper
- MongoDB with Mongoose
- Environment-based configuration
- RESTful API design
- Request logging
- Validation and error messages

## Response Format

Success:
```json
{
  "success": true,
  "data": {},
  "count": 0
}
```

Error:
```json
{
  "success": false,
  "message": "Error message",
  "stack": "Stack trace (dev only)"
}
```
