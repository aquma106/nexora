# Rate Limit Fix - 429 Too Many Requests

## Issue
Getting "429 Too Many Requests" error when accessing the Messages page and other API endpoints during development.

## Root Cause
The rate limiting middleware was too strict for development, allowing only:
- 100 API requests per 15 minutes (general)
- 5 login attempts per 15 minutes
- 3 registrations per hour

This is appropriate for production but too restrictive for development/testing.

## Solution Applied

### 1. Environment-Based Rate Limits
Updated all rate limiters to have different limits based on `NODE_ENV`:

**General API Limiter:**
- Production: 100 requests per 15 minutes
- Development: 1000 requests per 15 minutes

**Auth Limiter (Login):**
- Production: 5 attempts per 15 minutes
- Development: 50 attempts per 15 minutes

**Register Limiter:**
- Production: 3 registrations per hour
- Development: 20 registrations per hour

**Admin Limiter:**
- Production: 50 requests per 15 minutes
- Development: 500 requests per 15 minutes

### 2. New Message-Specific Limiter
Added a dedicated rate limiter for messaging endpoints:
- Production: 30 messages per minute
- Development: 200 messages per minute

This allows for real-time messaging without hitting rate limits.

## Files Modified

1. `backend/middleware/security.js`
   - Updated all rate limiters to check `NODE_ENV`
   - Added new `messageLimiter`

2. `backend/routes/messageRoutes.js`
   - Applied `messageLimiter` to POST /messages endpoint

## How to Use

### Set Environment Variable

**Development (default):**
```bash
# In backend/.env
NODE_ENV=development
```

**Production:**
```bash
# In backend/.env
NODE_ENV=production
```

### Restart Server
After making changes, restart your backend server:
```bash
cd backend
npm start
```

## Testing

### Check Current Rate Limits
The rate limit headers are included in API responses:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - Time when limit resets

### Test in Browser Console
```javascript
// Check response headers
fetch('http://localhost:5000/api/messages/conversations', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
}).then(res => {
  console.log('Rate Limit:', res.headers.get('X-RateLimit-Limit'));
  console.log('Remaining:', res.headers.get('X-RateLimit-Remaining'));
  console.log('Reset:', new Date(res.headers.get('X-RateLimit-Reset') * 1000));
});
```

## Rate Limit Summary

| Endpoint Type | Production Limit | Development Limit | Window |
|--------------|------------------|-------------------|--------|
| General API | 100 requests | 1000 requests | 15 min |
| Login | 5 attempts | 50 attempts | 15 min |
| Registration | 3 accounts | 20 accounts | 1 hour |
| Password Reset | 3 attempts | 3 attempts | 1 hour |
| Admin | 50 requests | 500 requests | 15 min |
| Messaging | 30 messages | 200 messages | 1 min |

## If You Still Hit Rate Limits

### Option 1: Clear Rate Limit (Restart Server)
Rate limits are stored in memory, so restarting the server clears them:
```bash
# Stop server (Ctrl+C)
# Start again
npm start
```

### Option 2: Increase Development Limits
Edit `backend/middleware/security.js` and increase the development limits:
```javascript
max: process.env.NODE_ENV === 'production' ? 100 : 5000, // Even higher
```

### Option 3: Disable Rate Limiting in Development (Not Recommended)
You can temporarily disable rate limiting by commenting out the middleware in `backend/server.js`:
```javascript
// app.use('/api', apiLimiter, routes); // Disabled
app.use('/api', routes); // No rate limiting
```

**Warning:** Only do this in development. Always enable rate limiting in production!

## Production Considerations

The production limits are set conservatively for security:
- Prevents brute force attacks
- Prevents API abuse
- Protects server resources

If you need higher limits in production:
1. Monitor your actual usage patterns
2. Adjust limits based on legitimate user behavior
3. Consider implementing user-based rate limiting (not just IP-based)
4. Use Redis for distributed rate limiting if you have multiple servers

## Additional Security

Rate limiting is just one layer of security. This project also includes:
- JWT authentication
- Input validation
- NoSQL injection prevention
- XSS protection
- CORS configuration
- Security headers (Helmet)
- Content-Type validation

All these work together to keep the API secure.
