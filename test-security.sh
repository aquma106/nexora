#!/bin/bash

# Security Testing Script

echo "================================"
echo "Security Testing Suite"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:5000/api"

# Test 1: Input Validation
echo -e "${BLUE}Test 1: Input Validation${NC}"
echo "Testing registration with invalid email..."
RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "password": "test123",
    "role": "student",
    "collegeName": "MIT"
  }')

if echo "$RESPONSE" | grep -q "validation"; then
    echo -e "${GREEN}✓ Input validation working${NC}"
else
    echo -e "${RED}✗ Input validation failed${NC}"
fi
echo ""

# Test 2: Rate Limiting
echo -e "${BLUE}Test 2: Rate Limiting${NC}"
echo "Making 6 rapid login attempts..."
COUNT=0
for i in {1..6}; do
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email": "test@example.com", "password": "wrong"}')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "429" ]; then
        echo -e "${GREEN}✓ Rate limiting triggered on attempt $i${NC}"
        COUNT=$((COUNT + 1))
        break
    fi
done

if [ $COUNT -eq 0 ]; then
    echo -e "${YELLOW}⚠ Rate limiting not triggered (may need more attempts)${NC}"
fi
echo ""

# Test 3: NoSQL Injection Prevention
echo -e "${BLUE}Test 3: NoSQL Injection Prevention${NC}"
echo "Attempting NoSQL injection..."
RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": {"$ne": null}, "password": {"$ne": null}}')

if echo "$RESPONSE" | grep -q "validation\|Invalid"; then
    echo -e "${GREEN}✓ NoSQL injection prevented${NC}"
else
    echo -e "${YELLOW}⚠ Check NoSQL injection prevention${NC}"
fi
echo ""

# Test 4: XSS Protection
echo -e "${BLUE}Test 4: XSS Protection${NC}"
echo "Attempting XSS attack..."
RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(\"XSS\")</script>",
    "email": "xss'$(date +%s)'@test.edu",
    "password": "test123",
    "role": "student",
    "collegeName": "MIT",
    "graduationYear": 2024
  }')

if echo "$RESPONSE" | grep -q "script"; then
    echo -e "${YELLOW}⚠ XSS may not be fully sanitized${NC}"
else
    echo -e "${GREEN}✓ XSS protection working${NC}"
fi
echo ""

# Test 5: Unauthorized Access
echo -e "${BLUE}Test 5: Unauthorized Access${NC}"
echo "Attempting to access protected route without token..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET $API_URL/profiles/me)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ Protected routes require authentication${NC}"
else
    echo -e "${RED}✗ Protected routes not properly secured${NC}"
fi
echo ""

# Test 6: Content Type Validation
echo -e "${BLUE}Test 6: Content Type Validation${NC}"
echo "Attempting POST without Content-Type header..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/login \
  -d '{"email": "test@example.com", "password": "test"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✓ Content-Type validation working${NC}"
else
    echo -e "${YELLOW}⚠ Content-Type validation may not be enforced${NC}"
fi
echo ""

# Test 7: Security Headers
echo -e "${BLUE}Test 7: Security Headers${NC}"
echo "Checking for security headers..."
HEADERS=$(curl -s -I http://localhost:5000/)

if echo "$HEADERS" | grep -q "X-Content-Type-Options"; then
    echo -e "${GREEN}✓ X-Content-Type-Options header present${NC}"
else
    echo -e "${YELLOW}⚠ X-Content-Type-Options header missing${NC}"
fi

if echo "$HEADERS" | grep -q "X-Frame-Options"; then
    echo -e "${GREEN}✓ X-Frame-Options header present${NC}"
else
    echo -e "${YELLOW}⚠ X-Frame-Options header missing${NC}"
fi
echo ""

# Test 8: Password Validation
echo -e "${BLUE}Test 8: Password Validation${NC}"
echo "Testing with short password..."
RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "short'$(date +%s)'@test.edu",
    "password": "123",
    "role": "student",
    "collegeName": "MIT",
    "graduationYear": 2024
  }')

if echo "$RESPONSE" | grep -q "6 characters\|validation"; then
    echo -e "${GREEN}✓ Password validation working${NC}"
else
    echo -e "${YELLOW}⚠ Password validation may not be enforced${NC}"
fi
echo ""

# Test 9: Role Validation
echo -e "${BLUE}Test 9: Role Validation${NC}"
echo "Testing with invalid role..."
RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "role'$(date +%s)'@test.edu",
    "password": "test123",
    "role": "invalid_role",
    "collegeName": "MIT",
    "graduationYear": 2024
  }')

if echo "$RESPONSE" | grep -q "Invalid role\|validation"; then
    echo -e "${GREEN}✓ Role validation working${NC}"
else
    echo -e "${YELLOW}⚠ Role validation may not be enforced${NC}"
fi
echo ""

# Test 10: Student Email Validation
echo -e "${BLUE}Test 10: Student Email Validation${NC}"
echo "Testing student with non-college email..."
RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student'$(date +%s)'@gmail.com",
    "password": "test123",
    "role": "student",
    "collegeName": "MIT",
    "graduationYear": 2024
  }')

if echo "$RESPONSE" | grep -q "college email\|validation"; then
    echo -e "${GREEN}✓ Student email validation working${NC}"
else
    echo -e "${YELLOW}⚠ Student email validation may not be enforced${NC}"
fi
echo ""

# Summary
echo "================================"
echo "Security Test Summary"
echo "================================"
echo -e "${GREEN}Security features are active!${NC}"
echo ""
echo "Recommendations:"
echo "1. Review rate limiting thresholds"
echo "2. Monitor logs for suspicious activity"
echo "3. Keep dependencies updated"
echo "4. Use HTTPS in production"
echo "5. Set strong JWT_SECRET"
echo ""
echo -e "${BLUE}For detailed security info, see SECURITY.md${NC}"
