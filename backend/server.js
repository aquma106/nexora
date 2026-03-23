const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const {
  securityHeaders,
  preventNoSQLInjection,
  preventXSS,
  preventHPP,
  apiLimiter,
  logSuspiciousActivity,
  validateContentType,
} = require('./middleware/security');
const routes = require('./routes');
const socketHandler = require('./socket/socketHandler');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize socket handler
socketHandler(io);

// Make io accessible to routes
app.set('io', io);

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security Middleware
app.use(securityHeaders); // Set security headers
app.use(preventNoSQLInjection); // Prevent NoSQL injection
app.use(preventXSS); // Prevent XSS attacks
app.use(preventHPP); // Prevent HTTP parameter pollution

// Body parser middleware
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Log suspicious activity
app.use(logSuspiciousActivity);

// Validate content type for POST/PUT requests
app.use(validateContentType);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to MERN Stack API',
    version: '1.0.0',
  });
});

// API routes with rate limiting
app.use('/api', apiLimiter, routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Socket.io server ready for connections`);
  console.log('Security features enabled:');
  console.log('  ✓ Rate limiting');
  console.log('  ✓ Security headers (Helmet)');
  console.log('  ✓ NoSQL injection prevention');
  console.log('  ✓ XSS protection');
  console.log('  ✓ HTTP parameter pollution prevention');
});
