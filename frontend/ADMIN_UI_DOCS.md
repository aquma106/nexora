# Admin Dashboard UI Documentation

## Overview
Comprehensive admin panel for managing users, approving alumni, and monitoring platform activity. Features a clean Tailwind CSS design with three main tabs: Overview, All Users, and Pending Alumni.

---

## Features

### 1. Overview Tab
- **User Statistics**: Total users, students, alumni, pending alumni
- **Platform Activity**: Opportunities, applications, mentorships, messages
- **Recent Activity**: Last 7 days statistics (new users, opportunities, applications)
- **Visual Cards**: Color-coded stat cards with icons

### 2. All Users Tab
- **Search**: Search users by name or email
- **Filters**: Filter by role (student, senior, alumni, faculty, admin) and status (pending, approved, rejected)
- **User Table**: Comprehensive table with user details
- **Actions**: Approve, reject, activate/deactivate, delete users
- **Refresh**: Manual refresh button to reload data

### 3. Pending Alumni Tab
- **FIFO Queue**: Alumni listed in order of registration (oldest first)
- **Detailed Cards**: Large cards with all alumni information
- **LinkedIn Links**: Direct links to LinkedIn profiles
- **Quick Actions**: Approve or reject with one click
- **Empty State**: Friendly message when no pending alumni

---

## Component Structure

```jsx
Admin Component
├── Header (Gradient banner)
├── Tabs Navigation
│   ├── Overview (with stats)
│   ├── All Users (with filters)
│   └── Pending Alumni (with badge count)
├── Tab Content
│   ├── Overview Tab
│   │   ├── User Statistics Grid
│   │   ├── Platform Activity Grid
│   │   └── Recent Activity Cards
│   ├── All Users Tab
│   │   ├── Search & Filter Bar
│   │   └── Users Table
│   │       ├── User Info (avatar, name, email)
│   │       ├── Role Badge
│   │       ├── Status Badge
│   │       ├── College Info
│   │       ├── Join Date
│   │       └── Action Buttons
│   └── Pending Alumni Tab
│       └── Alumni Cards
│           ├── Avatar
│           ├── User Details
│           ├── LinkedIn Link
│           └── Approve/Reject Buttons
├── Delete Confirmation Modal
└── Reject Reason Modal
```

---

## State Management

```javascript
const [activeTab, setActiveTab] = useState('overview');        // Current tab
const [stats, setStats] = useState(null);                      // Dashboard statistics
const [users, setUsers] = useState([]);                        // All users list
const [pendingAlumni, setPendingAlumni] = useState([]);        // Pending alumni queue
const [loading, setLoading] = useState(false);                 // Loading state
const [searchQuery, setSearchQuery] = useState('');            // Search input
const [filters, setFilters] = useState({ role: '', status: '' }); // Filter values
const [selectedUser, setSelectedUser] = useState(null);        // User for modal actions
const [showDeleteModal, setShowDeleteModal] = useState(false); // Delete modal visibility
const [showRejectModal, setShowRejectModal] = useState(false); // Reject modal visibility
const [rejectReason, setRejectReason] = useState('');          // Rejection reason
```

---

## API Integration

### Fetch Dashboard Statistics
```javascript
GET /api/admin/stats

Response: {
  users: { total, students, alumni, pendingAlumni, ... },
  content: { opportunities, applications, mentorships, messages },
  recentActivity: { newUsersThisWeek, ... }
}
```

### Fetch All Users
```javascript
GET /api/admin/users?role=alumni&status=approved&search=john

Response: {
  data: [{ _id, name, email, role, status, collegeName, ... }]
}
```

### Fetch Pending Alumni
```javascript
GET /api/admin/alumni/pending

Response: {
  data: [{ _id, name, email, linkedinUrl, graduationYear, ... }]
}
```

### Approve User
```javascript
PUT /api/admin/users/:id/approve

Response: { message: "alumni John Doe has been approved" }
```

### Reject User
```javascript
PUT /api/admin/users/:id/reject
Body: { reason: "Optional rejection reason" }

Response: { message: "alumni John Doe has been rejected" }
```

### Delete User
```javascript
DELETE /api/admin/users/:id

Response: { message: "User and all related data deleted successfully" }
```

### Activate/Deactivate User
```javascript
PUT /api/admin/users/:id/activate
PUT /api/admin/users/:id/deactivate

Response: { message: "User account activated/deactivated successfully" }
```

---

## User Actions

### 1. Approve Alumni
- Click green checkmark icon or "Approve" button
- User status changes to "approved"
- User can now login and access all features
- Pending alumni count decreases
- Alert confirmation shown

### 2. Reject Alumni
- Click red X icon or "Reject" button
- Modal opens for optional rejection reason
- User status changes to "rejected"
- User cannot login
- Alert confirmation shown

### 3. Delete User
- Click trash icon in user table
- Confirmation modal appears with warning
- Deletes user and ALL related data:
  - Profile
  - Opportunities posted
  - Applications submitted
  - Mentorship requests
  - Messages
- Cannot be undone
- Alert confirmation shown

### 4. Activate/Deactivate User
- Click power icon in user table
- Toggles user's active status
- Deactivated users cannot login
- Can be reactivated later
- Alert confirmation shown

---

## UI Components

### Stat Card
```jsx
<StatCard
  title="Total Users"
  value={150}
  icon={FiUsers}
  color="bg-blue-500"
  subtext="Optional subtext"
/>
```

**Props:**
- `title`: Card title
- `value`: Main statistic number
- `icon`: React icon component
- `color`: Tailwind background color class
- `subtext`: Optional additional info

---

## Color Scheme

### Status Badges
- **Approved**: Green (`bg-green-100 text-green-800`)
- **Pending**: Yellow (`bg-yellow-100 text-yellow-800`)
- **Rejected**: Red (`bg-red-100 text-red-800`)
- **Inactive**: Gray (`bg-gray-100 text-gray-800`)

### Role Badges
- All roles: Blue (`bg-blue-100 text-blue-800`)

### Stat Cards
- Total Users: Blue (`bg-blue-500`)
- Students: Green (`bg-green-500`)
- Alumni: Purple (`bg-purple-500`)
- Pending Alumni: Orange (`bg-orange-500`)
- Opportunities: Indigo (`bg-indigo-500`)
- Applications: Teal (`bg-teal-500`)
- Mentorships: Pink (`bg-pink-500`)
- Messages: Cyan (`bg-cyan-500`)

### Action Buttons
- Approve: Green (`bg-green-600 hover:bg-green-700`)
- Reject: Red (`bg-red-600 hover:bg-red-700`)
- Delete: Red text (`text-red-600 hover:text-red-900`)
- Activate/Deactivate: Orange/Green text
- Refresh: Blue (`bg-blue-600 hover:bg-blue-700`)

---

## Responsive Design

### Mobile (< 768px)
- Filters stack vertically
- Table scrolls horizontally
- Action buttons remain accessible
- Modals are full-width with padding

### Tablet (768px - 1024px)
- 2-column stat grid
- Filters in row layout
- Table visible with scroll

### Desktop (≥ 1024px)
- 4-column stat grid
- All filters in single row
- Full table visible
- Optimal spacing

---

## Modals

### Delete Confirmation Modal
- Red alert icon
- User name highlighted
- Warning about permanent deletion
- Lists what will be deleted
- Cancel and Delete buttons

### Reject Reason Modal
- Text input for rejection reason
- Optional field
- User name highlighted
- Cancel and Reject buttons

---

## Loading States

### Initial Load
- Fetches stats and pending alumni on mount
- Shows loading spinner in users table

### Refresh
- Manual refresh button in users tab
- Shows loading spinner during fetch

### Actions
- Alert messages for success/error
- Automatic data refresh after actions

---

## Error Handling

### API Errors
- Caught in try-catch blocks
- Alert shown with error message
- Fallback to generic error message

### Empty States
- "No users found matching your criteria" (users tab)
- "No pending alumni to review" (pending tab)
- Friendly icons and messages

---

## Access Control

### Route Protection
```jsx
<ProtectedRoute roles={['admin']}>
  <Admin />
</ProtectedRoute>
```

### Sidebar Visibility
- Admin Panel link only visible to admin role
- Filtered in Sidebar component

### Backend Validation
- All API endpoints require admin role
- JWT token verification
- 403 error if not admin

---

## User Table Columns

1. **User**: Avatar, name, email
2. **Role**: Badge with role name
3. **Status**: Badge with status (approved/pending/rejected) + inactive indicator
4. **College**: College name or "-"
5. **Joined**: Registration date
6. **Actions**: Icon buttons for approve, reject, activate/deactivate, delete

---

## Pending Alumni Card Layout

```
┌─────────────────────────────────────────────────┐
│ [Avatar]  Name                    [Approve Btn] │
│           Email                   [Reject Btn]  │
│           College: MIT                          │
│           Graduation: 2020                      │
│           [LinkedIn Link]                       │
│           Registered: Jan 1, 2024               │
└─────────────────────────────────────────────────┘
```

---

## Search & Filter Behavior

### Search
- Searches by name or email
- Real-time filtering (on change)
- Case-insensitive

### Role Filter
- Options: All Roles, Student, Senior, Alumni, Faculty, Admin
- Filters users by selected role

### Status Filter
- Options: All Status, Pending, Approved, Rejected
- Filters users by selected status

### Combined Filters
- All filters work together
- URL params sent to API
- Results update automatically

---

## Statistics Displayed

### User Statistics
- Total Users
- Students count
- Alumni count
- Pending Alumni count (with alert icon)

### Platform Activity
- Total Opportunities (with active count)
- Total Applications
- Total Mentorships (with accepted count)
- Total Messages

### Recent Activity (Last 7 Days)
- New Users This Week
- New Opportunities This Week
- New Applications This Week

---

## Icons Used

- `FiUsers` - Users, mentorship
- `FiBriefcase` - Opportunities
- `FiMessageSquare` - Messages
- `FiUserCheck` - Approve, applications
- `FiUserX` - Reject
- `FiTrash2` - Delete
- `FiSearch` - Search
- `FiFilter` - Filters
- `FiCheck` - Approve action
- `FiX` - Reject action, close
- `FiAlertCircle` - Pending, warnings
- `FiRefreshCw` - Refresh
- `FiExternalLink` - LinkedIn link
- `FiPower` - Activate/deactivate
- `FiShield` - Admin (sidebar)

---

## Best Practices

1. **Always confirm destructive actions** (delete, reject)
2. **Provide feedback** (alerts after actions)
3. **Refresh data** after state changes
4. **Show loading states** during API calls
5. **Handle errors gracefully** with user-friendly messages
6. **Use semantic colors** (green=success, red=danger, yellow=warning)
7. **Maintain accessibility** (proper labels, keyboard navigation)

---

## Testing Checklist

- [ ] Overview tab loads statistics correctly
- [ ] All users tab displays users with filters
- [ ] Search filters users by name/email
- [ ] Role filter works correctly
- [ ] Status filter works correctly
- [ ] Pending alumni tab shows FIFO queue
- [ ] Approve button changes user status
- [ ] Reject modal opens and submits reason
- [ ] Delete modal confirms and deletes user
- [ ] Activate/deactivate toggles user status
- [ ] Refresh button reloads data
- [ ] LinkedIn links open in new tab
- [ ] Responsive on mobile, tablet, desktop
- [ ] Only admin role can access page
- [ ] Error messages display correctly
- [ ] Empty states show when no data

---

## Future Enhancements

- [ ] Pagination for large user lists
- [ ] Export users to CSV
- [ ] Bulk actions (approve/reject multiple)
- [ ] User activity logs
- [ ] Advanced filters (date range, college)
- [ ] Sort table columns
- [ ] User detail modal (instead of separate page)
- [ ] Email notifications for approvals/rejections
- [ ] Analytics charts and graphs
- [ ] Audit trail for admin actions

---

## Performance Considerations

1. **Lazy Loading**: Only fetch data for active tab
2. **Debounced Search**: Prevent excessive API calls
3. **Optimistic Updates**: Update UI before API response
4. **Memoization**: Cache stats data
5. **Pagination**: Limit results per page (default: 20)

---

## Accessibility

- Semantic HTML elements
- Proper button labels and titles
- Keyboard navigation support
- Focus states on interactive elements
- Color contrast meets WCAG standards
- Screen reader friendly

---

**Admin Dashboard Status**: ✅ COMPLETE

**Last Updated**: March 21, 2026
