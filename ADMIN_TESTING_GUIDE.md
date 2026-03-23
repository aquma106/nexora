# Admin Dashboard - Testing Guide

## Prerequisites

1. Backend server running on `http://localhost:5000`
2. Frontend server running on `http://localhost:3000`
3. MongoDB running with test data
4. At least one admin user account

---

## Setup Test Data

### 1. Create Admin Account

```bash
# Register as admin
POST http://localhost:5000/api/auth/register
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin",
  "collegeName": "Test College"
}
```

### 2. Create Test Users

```bash
# Student
POST http://localhost:5000/api/auth/register
{
  "name": "John Student",
  "email": "john@college.edu",
  "password": "password123",
  "role": "student",
  "collegeName": "MIT"
}

# Pending Alumni
POST http://localhost:5000/api/auth/register
{
  "name": "Jane Alumni",
  "email": "jane@example.com",
  "password": "password123",
  "role": "alumni",
  "collegeName": "MIT",
  "graduationYear": 2020,
  "linkedinUrl": "https://linkedin.com/in/janealumni"
}

# Senior
POST http://localhost:5000/api/auth/register
{
  "name": "Bob Senior",
  "email": "bob@college.edu",
  "password": "password123",
  "role": "senior",
  "collegeName": "MIT"
}
```

---

## Test Cases

### Test 1: Access Control

**Objective**: Verify only admins can access the dashboard

**Steps**:
1. Login as student user
2. Try to navigate to `/admin`
3. Should be redirected or see "Unauthorized"
4. Logout
5. Login as admin user
6. Navigate to `/admin`
7. Should see admin dashboard

**Expected Result**: ✅ Only admin can access

---

### Test 2: Overview Tab - Statistics

**Objective**: Verify dashboard statistics display correctly

**Steps**:
1. Login as admin
2. Navigate to `/admin`
3. Verify "Overview" tab is active by default
4. Check "User Statistics" section
5. Verify counts for: Total Users, Students, Alumni, Pending Alumni
6. Check "Platform Activity" section
7. Verify counts for: Opportunities, Applications, Mentorships, Messages
8. Check "Recent Activity" section
9. Verify counts for last 7 days

**Expected Result**: ✅ All statistics display with correct numbers

---

### Test 3: All Users Tab - Display

**Objective**: Verify user list displays correctly

**Steps**:
1. Click "All Users" tab
2. Verify user table appears
3. Check table columns: User, Role, Status, College, Joined, Actions
4. Verify each user row shows:
   - Avatar with initial
   - Name and email
   - Role badge
   - Status badge
   - College name
   - Join date
   - Action buttons

**Expected Result**: ✅ All users displayed in table format

---

### Test 4: Search Functionality

**Objective**: Verify search filters users correctly

**Steps**:
1. Go to "All Users" tab
2. Type "john" in search box
3. Verify only users with "john" in name/email appear
4. Clear search
5. Type "student@" in search box
6. Verify only users with that email pattern appear
7. Clear search
8. Verify all users return

**Expected Result**: ✅ Search filters users by name and email

---

### Test 5: Role Filter

**Objective**: Verify role filter works correctly

**Steps**:
1. Go to "All Users" tab
2. Select "Student" from role dropdown
3. Verify only students appear
4. Select "Alumni" from role dropdown
5. Verify only alumni appear
6. Select "All Roles"
7. Verify all users return

**Expected Result**: ✅ Role filter works correctly

---

### Test 6: Status Filter

**Objective**: Verify status filter works correctly

**Steps**:
1. Go to "All Users" tab
2. Select "Pending" from status dropdown
3. Verify only pending users appear
4. Select "Approved" from status dropdown
5. Verify only approved users appear
6. Select "All Status"
7. Verify all users return

**Expected Result**: ✅ Status filter works correctly

---

### Test 7: Combined Filters

**Objective**: Verify multiple filters work together

**Steps**:
1. Go to "All Users" tab
2. Select "Alumni" from role dropdown
3. Select "Pending" from status dropdown
4. Verify only pending alumni appear
5. Type a name in search
6. Verify results match all three filters

**Expected Result**: ✅ All filters work together

---

### Test 8: Pending Alumni Tab

**Objective**: Verify pending alumni queue displays correctly

**Steps**:
1. Click "Pending Alumni" tab
2. Verify badge shows correct count (e.g., "3")
3. Check alumni cards display:
   - Large avatar
   - Name and email
   - College and graduation year
   - LinkedIn link
   - Registration date
   - Approve and Reject buttons
4. Click LinkedIn link
5. Verify it opens in new tab

**Expected Result**: ✅ Pending alumni displayed in FIFO order

---

### Test 9: Approve Alumni

**Objective**: Verify alumni approval works

**Steps**:
1. Go to "Pending Alumni" tab
2. Note the pending count badge
3. Click "Approve" button on first alumni
4. Verify success alert appears
5. Verify alumni card disappears
6. Verify badge count decreases by 1
7. Go to "All Users" tab
8. Find the approved alumni
9. Verify status badge shows "approved"
10. Logout and login as approved alumni
11. Verify login succeeds

**Expected Result**: ✅ Alumni approved and can login

---

### Test 10: Reject Alumni (with reason)

**Objective**: Verify alumni rejection with reason

**Steps**:
1. Go to "Pending Alumni" tab
2. Click "Reject" button on an alumni
3. Verify modal opens
4. Type rejection reason: "Unable to verify LinkedIn profile"
5. Click "Reject" in modal
6. Verify success alert appears
7. Verify alumni card disappears
8. Verify badge count decreases
9. Go to "All Users" tab
10. Find rejected alumni
11. Verify status badge shows "rejected"
12. Logout and try to login as rejected alumni
13. Verify login fails

**Expected Result**: ✅ Alumni rejected with reason, cannot login

---

### Test 11: Reject Alumni (without reason)

**Objective**: Verify rejection works without reason

**Steps**:
1. Go to "Pending Alumni" tab
2. Click "Reject" button
3. Leave reason field empty
4. Click "Reject" in modal
5. Verify success alert appears
6. Verify alumni removed from queue

**Expected Result**: ✅ Rejection works without reason

---

### Test 12: Approve from All Users Tab

**Objective**: Verify approve button works in user table

**Steps**:
1. Go to "All Users" tab
2. Filter by status "Pending"
3. Click green checkmark icon on a pending user
4. Verify success alert appears
5. Verify status badge changes to "approved"
6. Verify row updates without page refresh

**Expected Result**: ✅ Approve works from user table

---

### Test 13: Reject from All Users Tab

**Objective**: Verify reject button works in user table

**Steps**:
1. Go to "All Users" tab
2. Filter by status "Pending"
3. Click red X icon on a pending user
4. Verify reject modal opens
5. Enter reason (optional)
6. Click "Reject"
7. Verify success alert appears
8. Verify status badge changes to "rejected"

**Expected Result**: ✅ Reject works from user table

---

### Test 14: Deactivate User

**Objective**: Verify user deactivation works

**Steps**:
1. Go to "All Users" tab
2. Find an active user
3. Click power icon (orange)
4. Verify success alert appears
5. Verify "Inactive" badge appears next to status
6. Logout and try to login as deactivated user
7. Verify login fails with appropriate message

**Expected Result**: ✅ User deactivated, cannot login

---

### Test 15: Activate User

**Objective**: Verify user activation works

**Steps**:
1. Go to "All Users" tab
2. Find an inactive user
3. Click power icon (green)
4. Verify success alert appears
5. Verify "Inactive" badge disappears
6. Logout and login as activated user
7. Verify login succeeds

**Expected Result**: ✅ User activated, can login

---

### Test 16: Delete User

**Objective**: Verify user deletion works

**Steps**:
1. Go to "All Users" tab
2. Note total user count
3. Click trash icon on a user
4. Verify delete confirmation modal appears
5. Read warning message
6. Click "Cancel"
7. Verify modal closes, user still exists
8. Click trash icon again
9. Click "Delete" in modal
10. Verify success alert appears
11. Verify user removed from table
12. Verify total user count decreased
13. Try to login as deleted user
14. Verify login fails

**Expected Result**: ✅ User and all data deleted

---

### Test 17: Refresh Button

**Objective**: Verify manual refresh works

**Steps**:
1. Go to "All Users" tab
2. Open browser console
3. Click "Refresh" button
4. Verify loading spinner appears briefly
5. Verify API call in network tab
6. Verify user list updates

**Expected Result**: ✅ Refresh reloads data

---

### Test 18: Empty States

**Objective**: Verify empty state messages

**Steps**:
1. Go to "All Users" tab
2. Search for "zzzzzzzzz" (non-existent)
3. Verify "No users found matching your criteria" message
4. Clear search
5. Go to "Pending Alumni" tab
6. Approve all pending alumni
7. Verify "No pending alumni to review" message with icon

**Expected Result**: ✅ Empty states display correctly

---

### Test 19: Modal Cancel Actions

**Objective**: Verify cancel buttons work

**Steps**:
1. Click delete icon on a user
2. Click "Cancel" in modal
3. Verify modal closes, no action taken
4. Click reject icon on a user
5. Type some text in reason field
6. Click "Cancel"
7. Verify modal closes, no action taken
8. Click reject again
9. Verify reason field is empty (state cleared)

**Expected Result**: ✅ Cancel buttons work, state cleared

---

### Test 20: Responsive Design - Mobile

**Objective**: Verify mobile responsiveness

**Steps**:
1. Open browser dev tools
2. Switch to mobile view (375px width)
3. Navigate to admin dashboard
4. Verify header displays correctly
5. Verify tabs are accessible
6. Verify stat cards stack vertically
7. Verify table scrolls horizontally
8. Verify filters stack vertically
9. Verify modals are full-width with padding
10. Verify buttons are touch-friendly

**Expected Result**: ✅ Fully responsive on mobile

---

### Test 21: Responsive Design - Tablet

**Objective**: Verify tablet responsiveness

**Steps**:
1. Switch to tablet view (768px width)
2. Verify stat cards in 2-column grid
3. Verify filters in row layout
4. Verify table visible with scroll
5. Verify all elements accessible

**Expected Result**: ✅ Fully responsive on tablet

---

### Test 22: Responsive Design - Desktop

**Objective**: Verify desktop layout

**Steps**:
1. Switch to desktop view (1920px width)
2. Verify stat cards in 4-column grid
3. Verify all filters in single row
4. Verify full table visible without scroll
5. Verify optimal spacing

**Expected Result**: ✅ Optimal layout on desktop

---

### Test 23: Loading States

**Objective**: Verify loading indicators

**Steps**:
1. Open network tab in dev tools
2. Throttle network to "Slow 3G"
3. Go to "All Users" tab
4. Verify loading spinner appears
5. Verify "Loading users..." text
6. Wait for data to load
7. Verify spinner disappears

**Expected Result**: ✅ Loading states display correctly

---

### Test 24: Error Handling

**Objective**: Verify error messages

**Steps**:
1. Stop backend server
2. Try to approve a user
3. Verify error alert appears
4. Verify user-friendly error message
5. Start backend server
6. Try action again
7. Verify it works

**Expected Result**: ✅ Errors handled gracefully

---

### Test 25: Badge Count Updates

**Objective**: Verify pending alumni badge updates

**Steps**:
1. Note pending alumni badge count
2. Go to "Pending Alumni" tab
3. Approve one alumni
4. Verify badge count decreases by 1
5. Reject one alumni
6. Verify badge count decreases by 1
7. Verify badge shows "0" when no pending alumni

**Expected Result**: ✅ Badge count updates in real-time

---

## Performance Tests

### Test 26: Large User List

**Objective**: Verify performance with many users

**Steps**:
1. Create 100+ test users
2. Go to "All Users" tab
3. Verify page loads in < 2 seconds
4. Scroll through table
5. Verify smooth scrolling
6. Apply filters
7. Verify quick response

**Expected Result**: ✅ Performs well with large datasets

---

### Test 27: Multiple Quick Actions

**Objective**: Verify rapid action handling

**Steps**:
1. Quickly approve 5 alumni in succession
2. Verify all actions complete
3. Verify no race conditions
4. Verify data consistency

**Expected Result**: ✅ Handles rapid actions correctly

---

## Accessibility Tests

### Test 28: Keyboard Navigation

**Objective**: Verify keyboard accessibility

**Steps**:
1. Use Tab key to navigate
2. Verify all interactive elements focusable
3. Verify focus indicators visible
4. Use Enter/Space to activate buttons
5. Use Escape to close modals

**Expected Result**: ✅ Fully keyboard accessible

---

### Test 29: Screen Reader

**Objective**: Verify screen reader compatibility

**Steps**:
1. Enable screen reader (NVDA/JAWS)
2. Navigate through dashboard
3. Verify all elements announced
4. Verify button labels clear
5. Verify table structure announced

**Expected Result**: ✅ Screen reader friendly

---

## Security Tests

### Test 30: Non-Admin Access

**Objective**: Verify route protection

**Steps**:
1. Login as student
2. Manually navigate to `/admin`
3. Verify access denied
4. Check browser console for errors
5. Verify no data leaked

**Expected Result**: ✅ Non-admins cannot access

---

### Test 31: API Authorization

**Objective**: Verify backend authorization

**Steps**:
1. Get student JWT token
2. Use Postman/curl to call admin endpoints
3. Verify 403 Forbidden response
4. Verify error message clear

**Expected Result**: ✅ Backend blocks non-admin requests

---

## Browser Compatibility

### Test 32: Cross-Browser Testing

**Objective**: Verify works in all browsers

**Browsers to Test**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Steps**:
1. Open admin dashboard in each browser
2. Test all major features
3. Verify styling consistent
4. Verify functionality works

**Expected Result**: ✅ Works in all major browsers

---

## Regression Tests

### Test 33: After Code Changes

**Objective**: Verify no features broken

**Checklist**:
- [ ] Overview tab loads
- [ ] All users tab loads
- [ ] Pending alumni tab loads
- [ ] Search works
- [ ] Filters work
- [ ] Approve works
- [ ] Reject works
- [ ] Delete works
- [ ] Activate/deactivate works
- [ ] Modals work
- [ ] Responsive design intact

---

## Test Results Template

```
Test Date: ___________
Tester: ___________
Environment: Dev / Staging / Production

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Access Control | ✅ / ❌ | |
| 2 | Overview Stats | ✅ / ❌ | |
| 3 | User List | ✅ / ❌ | |
| ... | ... | ... | |

Overall Status: PASS / FAIL
Issues Found: ___________
```

---

## Bug Report Template

```
Bug ID: ___________
Test Case: ___________
Severity: Critical / High / Medium / Low

Description:
___________

Steps to Reproduce:
1. ___________
2. ___________
3. ___________

Expected Result:
___________

Actual Result:
___________

Screenshots:
___________

Environment:
- Browser: ___________
- OS: ___________
- Screen Size: ___________
```

---

## Automated Testing (Future)

### Unit Tests
- [ ] StatCard component
- [ ] Modal components
- [ ] Filter logic
- [ ] Search logic

### Integration Tests
- [ ] API calls
- [ ] State updates
- [ ] User actions

### E2E Tests
- [ ] Complete user flows
- [ ] Multi-step processes

---

**Testing Status**: Ready for QA

**Last Updated**: March 21, 2026
