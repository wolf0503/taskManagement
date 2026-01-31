# Testing Checklist

Use this checklist to verify the backend integration is working correctly.

## Prerequisites

- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] `.env.local` configured correctly
- [ ] `npm install` completed

## 1. Authentication Tests

### Registration
- [ ] Go to http://localhost:3000/sign-up
- [ ] Try registering with invalid email → See validation error
- [ ] Try weak password → See validation error
- [ ] Try password mismatch → See validation error
- [ ] Register with valid data → Success + auto-login + redirect to dashboard

### Login
- [ ] Go to http://localhost:3000/sign-in
- [ ] Try login with wrong email → See error
- [ ] Try login with wrong password → See error
- [ ] Login with valid credentials → Success + redirect to dashboard
- [ ] Verify accessToken in localStorage

### Protected Routes
- [ ] Logout
- [ ] Try accessing /projects → Redirected to /sign-in
- [ ] Try accessing /dashboard → Redirected to /sign-in
- [ ] Login again → Can access protected routes

### Token Refresh
- [ ] Login and note the time
- [ ] Wait 15+ minutes (or modify token expiry in backend)
- [ ] Make an API call (create project, etc.)
- [ ] Should work without re-login (auto token refresh)

### Logout
- [ ] Click logout button
- [ ] Verify redirected to /sign-in
- [ ] Verify accessToken removed from localStorage
- [ ] Verify cannot access protected routes

## 2. Projects Tests

### List Projects
- [ ] Login and go to /projects
- [ ] See list of projects (or empty state if none)
- [ ] Projects display correctly with colors, status, stats
- [ ] Loading indicator shows during fetch

### Create Project
- [ ] Click "New Project" button
- [ ] Try submitting empty form → See validation errors
- [ ] Fill in project details:
  - Name: "Test Project"
  - Description: "Test Description"
  - Status: "IN_PROGRESS"
  - Color: Blue (#3B82F6)
- [ ] Click "Create Project"
- [ ] See success toast
- [ ] New project appears in list immediately

### View Project Details
- [ ] Click on a project
- [ ] Should navigate to project detail page
- [ ] See project tasks/board

### Update Project
- [ ] (If you have edit UI) Update project name
- [ ] Changes saved and reflected immediately

### Delete Project
- [ ] (If you have delete UI) Delete a project
- [ ] Project removed from list

## 3. Tasks Tests

### View Tasks
- [ ] Open a project
- [ ] See task board with columns
- [ ] Tasks grouped by columns
- [ ] Loading indicator during fetch

### Create Task
- [ ] Click "Add Task" or + button
- [ ] Fill in task details:
  - Title: "Test Task"
  - Description: "Test Description"
  - Priority: HIGH
  - Tags: ["test", "urgent"]
  - Due Date: Future date
- [ ] Click "Create Task"
- [ ] Task appears in list immediately
- [ ] Task shows correct priority, tags, due date

### Update Task
- [ ] Click on a task to edit
- [ ] Change title or priority
- [ ] Save changes
- [ ] Changes reflected immediately

### Move Task
- [ ] Drag a task to different column (if drag-drop implemented)
- [ ] Or use move task functionality
- [ ] Task moves immediately
- [ ] Backend persists the move

### Complete Task
- [ ] Mark a task as complete
- [ ] Task status updates
- [ ] Completion timestamp set

### Delete Task
- [ ] Delete a task
- [ ] Task removed from list immediately

## 4. Real-Time Tests

### Setup
- [ ] Open browser window 1: Login to account A
- [ ] Open browser window 2 (incognito): Login to same account A
- [ ] Navigate both to same project

### Task Created
- [ ] In window 1: Create a new task
- [ ] In window 2: Task appears automatically (no refresh)

### Task Updated
- [ ] In window 1: Update a task title
- [ ] In window 2: Title updates automatically

### Task Moved
- [ ] In window 1: Move a task to different column
- [ ] In window 2: Task moves automatically

### Task Deleted
- [ ] In window 1: Delete a task
- [ ] In window 2: Task disappears automatically

### WebSocket Reconnection
- [ ] Stop backend server
- [ ] See WebSocket disconnect in console
- [ ] Restart backend server
- [ ] WebSocket should reconnect automatically
- [ ] Real-time updates work again

## 5. Error Handling Tests

### Network Errors
- [ ] Stop backend
- [ ] Try creating a project
- [ ] See user-friendly error message
- [ ] Start backend
- [ ] Try again → Should work

### Validation Errors
- [ ] Try creating project with name > 255 chars
- [ ] See validation error
- [ ] Try creating task without title
- [ ] See validation error

### Unauthorized (401)
- [ ] Manually corrupt token in localStorage
- [ ] Try making API call
- [ ] Should attempt token refresh
- [ ] If refresh fails → Redirect to login

### Forbidden (403)
- [ ] (If you have permissions) Try deleting someone else's project
- [ ] Should see "Forbidden" error

### Not Found (404)
- [ ] Try accessing non-existent project
- [ ] See "Not found" error

## 6. Loading States Tests

### Projects Loading
- [ ] Refresh /projects page
- [ ] See loading indicator while fetching
- [ ] Loading disappears when data loaded

### Tasks Loading
- [ ] Open a project
- [ ] See loading indicator while fetching tasks
- [ ] Loading disappears when tasks loaded

### Button Loading
- [ ] Click "Create Project"
- [ ] Button shows loading state
- [ ] Button disabled during creation
- [ ] Button returns to normal after completion

### Protected Route Loading
- [ ] Logout and try accessing /projects
- [ ] Should see loading screen briefly
- [ ] Then redirect to login

## 7. UI/UX Tests

### Responsive Design
- [ ] Resize browser window
- [ ] Check mobile view
- [ ] Check tablet view
- [ ] Check desktop view
- [ ] All layouts work correctly

### Toast Notifications
- [ ] Create project → Success toast
- [ ] Error occurs → Error toast
- [ ] Toasts disappear after timeout

### Form Validation
- [ ] Real-time validation on forms
- [ ] Error messages display correctly
- [ ] Error messages clear when fixed

### Empty States
- [ ] Logout and register new account
- [ ] See "No projects" empty state
- [ ] Create project → Empty state disappears
- [ ] Delete all projects → Empty state appears

## 8. Browser Tests

### Chrome
- [ ] All features work in Chrome
- [ ] No console errors
- [ ] WebSocket connects

### Firefox
- [ ] All features work in Firefox
- [ ] No console errors
- [ ] WebSocket connects

### Safari
- [ ] All features work in Safari
- [ ] No console errors
- [ ] WebSocket connects

### Edge
- [ ] All features work in Edge
- [ ] No console errors
- [ ] WebSocket connects

## 9. Performance Tests

### Load Time
- [ ] Page loads in < 2 seconds
- [ ] No unnecessary API calls
- [ ] Images load properly

### WebSocket
- [ ] Real-time updates are instant (< 500ms)
- [ ] No lag between windows

### Optimistic Updates
- [ ] UI updates immediately on action
- [ ] No perceived lag
- [ ] Rollback if API call fails

## 10. Data Integrity Tests

### Data Persistence
- [ ] Create project
- [ ] Refresh page
- [ ] Project still there

### Data Sync
- [ ] Create task in window 1
- [ ] Verify appears in window 2
- [ ] Close window 2
- [ ] Create task in window 1
- [ ] Open window 2 again
- [ ] All tasks present

### Concurrent Updates
- [ ] Window 1: Update task A
- [ ] Window 2: Update task A at same time
- [ ] Both updates should succeed
- [ ] Last update wins

## 11. Security Tests

### Token Security
- [ ] Verify token not in URL
- [ ] Verify token not logged to console
- [ ] Verify token in localStorage only

### Protected Routes
- [ ] Without token → Cannot access /projects
- [ ] Without token → Cannot access /dashboard
- [ ] With token → Can access all routes

### Logout Cleanup
- [ ] Login
- [ ] Logout
- [ ] Verify token removed
- [ ] Verify WebSocket disconnected
- [ ] Verify cannot access protected routes

## 12. Edge Cases

### Empty Data
- [ ] Project with no tasks displays correctly
- [ ] User with no projects displays empty state

### Long Text
- [ ] Project name with 255 characters
- [ ] Task description with long text
- [ ] Text truncates/wraps properly

### Special Characters
- [ ] Project name with emoji: "Project 🚀"
- [ ] Task with special chars: "Test & <script>"
- [ ] No XSS vulnerabilities

### Rapid Actions
- [ ] Create 10 tasks rapidly
- [ ] All created successfully
- [ ] No race conditions

## Results Summary

Fill out after testing:

✅ **Passed**: ___ / ___  
❌ **Failed**: ___ / ___  
⚠️ **Skipped**: ___ / ___

### Critical Issues Found
1. 
2. 
3. 

### Minor Issues Found
1. 
2. 
3. 

### Notes
- 
- 
- 

---

**Testing Date**: __________  
**Tester**: __________  
**Backend Version**: __________  
**Frontend Version**: __________
