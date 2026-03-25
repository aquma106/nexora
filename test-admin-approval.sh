#!/bin/bash

# Test script for admin approval functionality
# Make sure to replace TOKEN and USER_ID with actual values

echo "=== Testing Admin Approval Functionality ==="
echo ""

# Set your backend URL
API_URL="http://localhost:5000/api"

# You need to:
# 1. Login as admin and get the token
# 2. Register an alumni user and get their ID
# 3. Replace TOKEN and USER_ID below

echo "Step 1: Login as admin"
echo "POST $API_URL/auth/login"
echo ""

# Example login (replace with your admin credentials)
# ADMIN_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
#   -H "Content-Type: application/json" \
#   -d '{"email":"admin@example.com","password":"admin123"}')
# 
# TOKEN=$(echo $ADMIN_LOGIN | jq -r '.data.token')
# echo "Admin token: $TOKEN"
# echo ""

# For now, manually set these:
TOKEN="YOUR_ADMIN_TOKEN_HERE"
USER_ID="YOUR_PENDING_USER_ID_HERE"

echo "Step 2: Get pending alumni"
echo "GET $API_URL/admin/alumni/pending"
curl -s -X GET "$API_URL/admin/alumni/pending" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

echo "Step 3: Approve user"
echo "PUT $API_URL/admin/users/$USER_ID/approve"
curl -s -X PUT "$API_URL/admin/users/$USER_ID/approve" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

echo "Step 4: Verify user is approved"
echo "GET $API_URL/admin/users/$USER_ID"
curl -s -X GET "$API_URL/admin/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

echo "=== Test Complete ==="
