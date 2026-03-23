# Profile UI Documentation

## Overview

The Profile page is a comprehensive, responsive UI for viewing and editing user profiles with skills, projects, experience, and education sections.

## Features

### ✅ View Mode
- Display user information
- Show skills as badges
- List projects with technologies
- Display work experience timeline
- Show education history
- Social links (GitHub, Portfolio, LinkedIn)

### ✅ Edit Mode
- Toggle between view and edit
- Edit bio (textarea)
- Add/remove skills
- Update social links
- Save changes to backend

### ✅ Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size
- Stacked layout on mobile
- Side-by-side on desktop

---

## Sections

### 1. Header Card
**Features:**
- Gradient banner (blue to purple)
- Large avatar with user initial
- User name and role
- Contact information (email, college, graduation year)
- LinkedIn link (if available)
- Edit/Save button

**Responsive:**
- Mobile: Stacked layout
- Desktop: Horizontal layout with avatar and info side-by-side

---

### 2. About/Bio Section
**View Mode:**
- Display bio text
- Placeholder if no bio

**Edit Mode:**
- Textarea for bio editing
- 4 rows height
- Placeholder text

---

### 3. Skills Section
**View Mode:**
- Skills displayed as blue badges
- Rounded pill design
- Flex wrap for multiple rows

**Edit Mode:**
- Input field to add new skills
- Plus button to add
- Enter key support
- X button on each skill to remove
- Prevents duplicate skills

**Styling:**
- Blue background (`bg-blue-100`)
- Blue text (`text-blue-700`)
- Rounded full (`rounded-full`)

---

### 4. Social Links Section
**Fields:**
- GitHub
- Portfolio website
- Twitter (optional)

**View Mode:**
- Clickable links
- "Not provided" if empty

**Edit Mode:**
- URL input fields
- Icons for each platform
- Validation for URL format

---

### 5. Projects Section
**Display:**
- Project title (bold)
- Description
- Technologies (gray badges)
- Link to project (if available)
- Blue left border accent

**Layout:**
- Vertical list
- Border-left accent
- Padding left for content

---

### 6. Experience Section
**Display:**
- Company icon (blue background)
- Position title
- Company name
- Date range (start - end or "Present")
- Description
- Location (if available)

**Layout:**
- Timeline style
- Icon on left
- Content on right
- Vertical spacing between items

---

### 7. Education Section
**Display:**
- Education icon (purple background)
- Degree name
- Institution
- Field of study
- Date range (years)
- Grade/GPA (if available)

**Layout:**
- Similar to experience section
- Purple accent color
- Icon + content layout

---

## Component Structure

```jsx
<Profile>
  ├── Header Card
  │   ├── Gradient Banner
  │   ├── Avatar
  │   ├── User Info
  │   └── Edit Button
  │
  ├── Bio Section
  │   └── Textarea (edit) / Text (view)
  │
  ├── Skills Section
  │   ├── Add Skill Input (edit mode)
  │   └── Skill Badges
  │
  ├── Social Links Section
  │   └── URL Inputs (edit) / Links (view)
  │
  ├── Projects Section
  │   └── Project Cards
  │
  ├── Experience Section
  │   └── Experience Timeline
  │
  └── Education Section
      └── Education Timeline
</Profile>
```

---

## Responsive Breakpoints

### Mobile (< 640px)
- Single column layout
- Stacked header elements
- Full-width cards
- Vertical spacing

### Tablet (640px - 1024px)
- 2-column grid for info items
- Side-by-side for some sections
- Optimized spacing

### Desktop (> 1024px)
- 4-column grid for header info
- Maximum width container (6xl)
- Horizontal layouts
- Optimal spacing

---

## Color Scheme

### Primary Colors:
- **Blue**: Skills, primary actions
  - `bg-blue-100` - Light background
  - `bg-blue-600` - Buttons
  - `text-blue-700` - Text

- **Purple**: Education section
  - `bg-purple-100` - Icon background
  - `text-purple-600` - Icon color

- **Gray**: Secondary elements
  - `bg-gray-100` - Tech badges
  - `text-gray-600` - Secondary text
  - `text-gray-500` - Tertiary text

### Gradients:
- Header banner: `from-blue-500 to-purple-600`

---

## Icons Used

From `react-icons/fi`:
- `FiEdit2` - Edit button
- `FiSave` - Save button
- `FiPlus` - Add skill
- `FiX` - Remove skill
- `FiTrash2` - Delete items
- `FiBriefcase` - Experience
- `FiCode` - Projects/Skills
- `FiBook` - Education
- `FiLinkedin` - LinkedIn
- `FiGithub` - GitHub
- `FiGlobe` - Portfolio
- `FiMail` - Email
- `FiMapPin` - Location
- `FiCalendar` - Dates

---

## API Integration

### Endpoints Used:

1. **Get Profile**
   ```javascript
   GET /api/profiles/me/profile
   ```

2. **Create Profile**
   ```javascript
   POST /api/profiles
   ```

3. **Update Profile**
   ```javascript
   PUT /api/profiles/me
   ```

### Data Structure:
```javascript
{
  bio: string,
  skills: string[],
  socialLinks: {
    github: string,
    portfolio: string,
    twitter: string
  },
  projects: [{
    title: string,
    description: string,
    technologies: string[],
    link: string,
    startDate: Date,
    endDate: Date
  }],
  experience: [{
    company: string,
    position: string,
    description: string,
    startDate: Date,
    endDate: Date,
    isCurrent: boolean,
    location: string
  }],
  education: [{
    institution: string,
    degree: string,
    fieldOfStudy: string,
    startDate: Date,
    endDate: Date,
    grade: string
  }]
}
```

---

## User Interactions

### Edit Mode Toggle:
1. Click "Edit Profile" button
2. Form fields become editable
3. Button changes to "Save Profile"
4. Click "Save" to persist changes

### Add Skill:
1. Type skill name in input
2. Press Enter or click Plus button
3. Skill appears as badge
4. Input clears for next skill

### Remove Skill:
1. Click X button on skill badge
2. Skill is removed from list
3. Changes saved on "Save Profile"

### Edit Social Links:
1. Enter edit mode
2. Type URLs in input fields
3. Save to persist changes

---

## Loading States

### Initial Load:
- Centered spinner
- Full screen height
- Blue spinner color

### No Data States:
- "No bio added yet" message
- "No skills added yet" message
- "No projects added yet" message
- "No experience added yet" message
- "No education added yet" message

---

## Styling Classes

### Cards:
```css
bg-white rounded-xl shadow-md p-6
```

### Buttons:
```css
/* Primary */
bg-blue-600 hover:bg-blue-700 text-white rounded-lg

/* Icon Button */
px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
```

### Inputs:
```css
w-full px-4 py-2 border border-gray-300 rounded-lg 
focus:ring-2 focus:ring-blue-500 focus:border-transparent
```

### Badges:
```css
/* Skill Badge */
px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium

/* Tech Badge */
px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs
```

---

## Accessibility

- ✅ Semantic HTML
- ✅ Proper heading hierarchy
- ✅ Alt text for icons
- ✅ Focus states on inputs
- ✅ Keyboard navigation
- ✅ ARIA labels where needed
- ✅ Color contrast compliance

---

## Future Enhancements

### Planned Features:
1. **Add Project Modal**
   - Form to add new projects
   - Technology selector
   - Date pickers

2. **Add Experience Modal**
   - Form to add work experience
   - Company autocomplete
   - Current job checkbox

3. **Add Education Modal**
   - Form to add education
   - Institution autocomplete
   - Grade input

4. **Resume Upload**
   - File upload component
   - PDF preview
   - Download button

5. **Profile Completeness**
   - Progress bar
   - Completion percentage
   - Suggestions for improvement

6. **Profile Visibility**
   - Public/private toggle
   - Share profile link
   - QR code generation

---

## Testing Checklist

- [ ] Profile loads correctly
- [ ] Edit mode toggles properly
- [ ] Bio can be edited and saved
- [ ] Skills can be added
- [ ] Skills can be removed
- [ ] Duplicate skills are prevented
- [ ] Social links can be updated
- [ ] Projects display correctly
- [ ] Experience displays correctly
- [ ] Education displays correctly
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] Loading state shows
- [ ] Error handling works
- [ ] Save button works
- [ ] Cancel preserves original data

---

## Usage

```bash
# Navigate to profile page
http://localhost:3000/profile

# Or click "Profile" in sidebar
```

The profile page is now fully functional and ready to use! 🎉
