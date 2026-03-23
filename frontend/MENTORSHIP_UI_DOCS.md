# Mentorship UI Documentation

## Overview

The Mentorship page provides a complete interface for students to find mentors and for mentors to manage mentorship requests.

## Features

### ✅ Three Main Tabs:
1. **Browse Mentors** - Find and connect with mentors
2. **Sent Requests** - Track your outgoing requests
3. **Received Requests** - Manage incoming requests (mentors only)

### ✅ Core Functionality:
- Browse available mentors (seniors, alumni, faculty)
- Send mentorship requests with custom messages
- View request status (pending, accepted, rejected)
- Accept/reject incoming requests
- Filter by mentorship type and duration

---

## Tab Details

### 1. Browse Mentors Tab

**Features:**
- Grid layout of available mentors
- Mentor cards showing:
  - Name and role
  - College name
  - Graduation year
  - LinkedIn profile link
- "Send Request" button on each card

**Layout:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

**Mentor Card:**
```
┌─────────────────────────┐
│  [A]  Alice Johnson     │
│       Alumni            │
│                         │
│  📍 MIT                 │
│  📅 Class of 2020       │
│  🔗 LinkedIn Profile    │
│                         │
│  [  Send Request  ]     │
└─────────────────────────┘
```

---

### 2. Sent Requests Tab

**Features:**
- List of all sent requests
- Status badges (pending, accepted, rejected, cancelled)
- Request details:
  - Receiver name and role
  - Mentorship type
  - Duration
  - Your message
  - Response message (if any)
  - Date sent

**Status Badges:**
- 🕐 **Pending** - Yellow badge
- ✓ **Accepted** - Green badge
- ✗ **Rejected** - Red badge
- ✗ **Cancelled** - Gray badge

**Request Card:**
```
┌─────────────────────────────────────┐
│  [M]  Mentor Name        [Pending]  │
│       Alumni                        │
│                                     │
│  Type: Career                       │
│  Duration: Short-term               │
│  Message: I would like to...       │
│                                     │
│  Sent Jan 15, 2024                 │
└─────────────────────────────────────┘
```

---

### 3. Received Requests Tab

**Features:**
- List of incoming mentorship requests
- Notification badge showing pending count
- Request details:
  - Sender name and info
  - College and graduation year
  - Mentorship type and duration
  - Message from sender
  - Date received
- Accept/Reject buttons for pending requests

**Only visible to:** Seniors, Alumni, Faculty, Admin

**Request Card with Actions:**
```
┌─────────────────────────────────────┐
│  [S]  Student Name       [Pending]  │
│       MIT • Class of 2024           │
│                                     │
│  Type: Technical                    │
│  Duration: Long-term                │
│  Message: I need help with...      │
│                                     │
│  [  ✓ Accept  ]  [  ✗ Reject  ]   │
│                                     │
│  Received Jan 15, 2024             │
└─────────────────────────────────────┘
```

---

## Send Request Modal

**Triggered by:** Clicking "Send Request" on a mentor card

**Fields:**
1. **Mentorship Type** (dropdown)
   - General
   - Career
   - Technical
   - Academic

2. **Duration** (dropdown)
   - One-time
   - Short-term
   - Long-term

3. **Message** (textarea)
   - Required field
   - Placeholder: "Introduce yourself and explain why you'd like mentorship..."

**Buttons:**
- Cancel - Close modal
- Send Request - Submit (disabled if message is empty)

**Modal Layout:**
```
┌─────────────────────────────────────┐
│  Send Mentorship Request        [X] │
│                                     │
│  [M]  Mentor Name                   │
│       Alumni                        │
│                                     │
│  Mentorship Type                    │
│  [General ▼]                        │
│                                     │
│  Duration                           │
│  [Short-term ▼]                     │
│                                     │
│  Message                            │
│  [                              ]   │
│  [                              ]   │
│  [                              ]   │
│                                     │
│  [ Cancel ]  [ Send Request ]      │
└─────────────────────────────────────┘
```

---

## User Roles & Permissions

### Students:
- ✅ Browse mentors
- ✅ Send requests
- ✅ View sent requests
- ❌ Cannot see "Received Requests" tab

### Seniors/Alumni/Faculty:
- ✅ Browse mentors
- ✅ Send requests
- ✅ View sent requests
- ✅ View received requests
- ✅ Accept/reject requests

---

## Status Flow

### Request Lifecycle:

1. **Student sends request** → Status: `pending`
2. **Mentor receives request** → Appears in "Received Requests"
3. **Mentor responds:**
   - Accept → Status: `accepted` (green badge)
   - Reject → Status: `rejected` (red badge)
4. **Student sees response** → Updated status in "Sent Requests"

---

## API Integration

### Endpoints Used:

1. **Get Available Mentors**
   ```javascript
   GET /api/mentorship/mentors
   ```

2. **Send Request**
   ```javascript
   POST /api/mentorship
   Body: {
     receiver: mentorId,
     message: string,
     mentorshipType: string,
     duration: string
   }
   ```

3. **Get Sent Requests**
   ```javascript
   GET /api/mentorship?type=sent
   ```

4. **Get Received Requests**
   ```javascript
   GET /api/mentorship?type=received
   ```

5. **Respond to Request**
   ```javascript
   PUT /api/mentorship/:id/respond
   Body: {
     status: 'accepted' | 'rejected',
     responseMessage: string
   }
   ```

---

## Responsive Design

### Mobile (< 768px):
- Single column layout
- Stacked tabs
- Full-width cards
- Modal takes full screen

### Tablet (768px - 1024px):
- 2-column grid for mentors
- Horizontal tabs
- Optimized spacing

### Desktop (> 1024px):
- 3-column grid for mentors
- Maximum width container
- Side-by-side layouts
- Hover effects

---

## Color Scheme

### Status Colors:
- **Pending**: Yellow (`bg-yellow-100`, `text-yellow-700`)
- **Accepted**: Green (`bg-green-100`, `text-green-700`)
- **Rejected**: Red (`bg-red-100`, `text-red-700`)
- **Cancelled**: Gray (`bg-gray-100`, `text-gray-700`)

### Avatar Colors:
- **Mentors**: Blue (`bg-blue-500`)
- **Sent Requests**: Purple (`bg-purple-500`)
- **Received Requests**: Green (`bg-green-500`)

### Buttons:
- **Primary**: Blue (`bg-blue-600 hover:bg-blue-700`)
- **Accept**: Green (`bg-green-600 hover:bg-green-700`)
- **Reject**: Red (`bg-red-600 hover:bg-red-700`)

---

## Icons Used

From `react-icons/fi`:
- `FiUsers` - Browse mentors
- `FiSend` - Send request / Sent requests
- `FiMail` - Received requests
- `FiCheck` - Accept / Accepted
- `FiX` - Reject / Rejected / Close
- `FiClock` - Pending status
- `FiLinkedin` - LinkedIn link
- `FiMapPin` - Location
- `FiCalendar` - Graduation year
- `FiAlertCircle` - Alerts/warnings

---

## Loading States

### Initial Load:
- Centered spinner
- Blue color
- Shown while fetching data

### Empty States:
- **No mentors**: "No mentors available at the moment"
- **No sent requests**: "No sent requests yet"
- **No received requests**: "No received requests yet"
- Icon + message centered

---

## Notifications

### Received Requests Badge:
- Red badge on "Received Requests" tab
- Shows count of pending requests
- Only visible when count > 0

**Example:**
```
Received Requests [3]
```

---

## User Experience

### Success Messages:
- "Mentorship request sent successfully!"
- "Request accepted successfully!"
- "Request rejected successfully!"

### Error Handling:
- API error messages displayed in alerts
- Form validation (message required)
- Disabled states during submission

### Interactions:
1. Click "Send Request" → Modal opens
2. Fill form → "Send Request" button enabled
3. Submit → Modal closes → Success message
4. Tab updates automatically

---

## Accessibility

- ✅ Semantic HTML
- ✅ ARIA labels on tabs
- ✅ Keyboard navigation
- ✅ Focus states
- ✅ Screen reader friendly
- ✅ Color contrast compliance
- ✅ Loading indicators

---

## Testing Checklist

### Browse Mentors:
- [ ] Mentors load correctly
- [ ] Cards display all information
- [ ] LinkedIn links work
- [ ] Send request button opens modal
- [ ] Grid is responsive

### Send Request:
- [ ] Modal opens/closes
- [ ] Form fields work
- [ ] Validation works (message required)
- [ ] Submit sends request
- [ ] Success message shows
- [ ] Modal closes after submit

### Sent Requests:
- [ ] Requests load correctly
- [ ] Status badges show correct colors
- [ ] All details display
- [ ] Response messages show (if any)
- [ ] Dates format correctly

### Received Requests:
- [ ] Only visible to mentors
- [ ] Requests load correctly
- [ ] Pending count badge shows
- [ ] Accept button works
- [ ] Reject button works
- [ ] Status updates after response

### Responsive:
- [ ] Works on mobile
- [ ] Works on tablet
- [ ] Works on desktop
- [ ] Modal is responsive
- [ ] Tabs work on all sizes

---

## Future Enhancements

1. **Filters**
   - Filter mentors by role
   - Filter by college
   - Search by name

2. **Sorting**
   - Sort by graduation year
   - Sort by name
   - Sort by availability

3. **Pagination**
   - Load more mentors
   - Infinite scroll
   - Page numbers

4. **Advanced Features**
   - Schedule meetings
   - Video call integration
   - Chat with mentor
   - Rate mentorship experience
   - Mentor availability calendar

5. **Notifications**
   - Email notifications
   - Push notifications
   - In-app notifications
   - Request reminders

---

## Usage

```bash
# Navigate to mentorship page
http://localhost:3000/mentorship

# Or click "Mentorship" in sidebar
```

The mentorship page is fully functional and ready to use! 🎉
