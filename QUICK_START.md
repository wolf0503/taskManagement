# Quick Start Guide

## Backend Integration - Ready to Use

This frontend is now fully integrated with the backend API. Follow these steps to get started:

## 🚀 Setup (One-Time)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

## 🎯 Running the Application

### Option A: With Backend Running

1. **Start Backend** (in separate terminal)
   ```bash
   # Navigate to your backend directory
   cd ../backend
   # Start backend server
   npm start
   # Backend should be running on http://localhost:5000
   ```

2. **Start Frontend**
   ```bash
   npm run dev
   ```

3. **Access Application**
   - Open browser: http://localhost:3000
   - You'll see the sign-in page
   - Register a new account or login

### Option B: Development Mode (No Backend)

If backend is not running, the frontend will show connection errors, which is expected. You can still view the UI but won't be able to interact with data.

## 📝 First Time Usage

1. **Register an Account**
   - Go to http://localhost:3000/sign-up
   - Fill in your details:
     - First Name
     - Last Name
     - Email
     - Password (min 8 chars, uppercase, lowercase, number)
   - Click "Create account"

2. **Login**
   - After registration, you'll be auto-logged in
   - Or go to http://localhost:3000/sign-in
   - Enter email and password
   - Click "Sign in"

3. **Create Your First Project**
   - You'll land on the projects page
   - Click "New Project"
   - Fill in project details
   - Click "Create Project"

4. **Create Tasks**
   - Click on your project
   - Click "Add Task" or the + button in a column
   - Fill in task details
   - Click "Create Task"

## 🧪 Testing Real-Time Features

1. Open two browser windows side-by-side
2. Login to the same account in both
3. Open the same project in both windows
4. Create/move/delete a task in one window
5. Watch it update instantly in the other window

## 🛠️ Available Scripts

```bash
# Development
npm run dev         # Start dev server on port 3000

# Production
npm run build       # Build for production
npm start           # Start production server

# Linting
npm run lint        # Check for code issues
```

## 📂 Project Structure

```
/app                  # Next.js pages
  /sign-in           # Login page
  /sign-up           # Registration page
  /dashboard         # Dashboard
  /projects          # Projects list & detail
  /settings          # Settings page

/components          # React components
  /ui                # UI components library
  protected-route.tsx # Route protection

/contexts            # React contexts
  auth-context.tsx   # Authentication state
  projects-context.tsx # Projects state
  tasks-context.tsx  # Tasks state

/services            # API services
  auth.service.ts    # Auth operations
  projects.service.ts # Project operations
  tasks.service.ts   # Task operations
  websocket.service.ts # WebSocket

/lib                 # Core utilities
  api-client.ts      # HTTP client
  api-config.ts      # API configuration
  types.ts           # TypeScript types
  utils.ts           # Utilities
```

## 🔐 Authentication Flow

```
1. User visits any protected page
   ↓
2. ProtectedRoute checks authentication
   ↓
3. If not authenticated → redirect to /sign-in
   ↓
4. User logs in → token stored
   ↓
5. Redirect to requested page
   ↓
6. WebSocket connects automatically
   ↓
7. Real-time updates enabled
```

## 🌐 API Endpoints Used

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh-token` - Refresh access token
- `GET /auth/me` - Get current user

### Projects
- `GET /projects` - List all projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project details
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Tasks
- `GET /tasks/projects/:projectId/tasks` - List project tasks
- `POST /tasks/projects/:projectId/tasks` - Create task
- `PATCH /tasks/:taskId` - Update task
- `DELETE /tasks/:taskId` - Delete task
- `PATCH /tasks/:taskId/move` - Move task
- `PATCH /tasks/:taskId/complete` - Complete task

### WebSocket Events
- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `task:moved` - Task moved

## ⚠️ Common Issues

### "Network Error" on Login
- **Cause**: Backend not running or wrong API URL
- **Fix**: Check backend is running on port 5000, verify `.env.local`

### "Unauthorized" Error
- **Cause**: Token expired or invalid
- **Fix**: Logout and login again, or clear localStorage

### WebSocket Not Connecting
- **Cause**: Wrong WebSocket URL or backend WS not running
- **Fix**: Verify `NEXT_PUBLIC_WS_URL` in `.env.local`

### Page Keeps Redirecting to Login
- **Cause**: Authentication check failing
- **Fix**: Check browser console for errors, verify token in localStorage

### Tasks Not Updating in Real-Time
- **Cause**: WebSocket disconnected
- **Fix**: Check browser console, verify WS connection status

## 🎨 Features

### ✅ Implemented
- User registration and login
- JWT authentication with auto-refresh
- Protected routes
- Project CRUD
- Task CRUD
- Real-time task updates
- Drag & drop (UI ready)
- Task assignment
- Task priorities
- Task tags
- Due dates
- Loading states
- Error handling

### 🚧 Prepared (Backend Ready)
- Project members
- Notifications
- Task comments
- 2FA authentication
- Password reset
- User profile editing

## 📊 Data Types

All data types match the backend contract:

### Enums
- `ProjectStatus`: `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`, `PLANNING`
- `TaskPriority`: `HIGH`, `MEDIUM`, `LOW`
- `UserStatus`: `ONLINE`, `AWAY`, `OFFLINE`

### Key Fields
- IDs are UUIDs (e.g., `550e8400-e29b-41d4-a716-446655440000`)
- Dates are ISO 8601 strings (e.g., `2024-01-15T10:30:00.000Z`)
- Colors are hex codes (e.g., `#3B82F6`)

## 💡 Tips

1. **Token Refresh**: Happens automatically every 15 minutes
2. **WebSocket Reconnect**: Automatic with exponential backoff
3. **Optimistic Updates**: Changes appear instantly, confirmed by server
4. **Error Messages**: User-friendly messages for all errors
5. **Loading States**: All operations show loading indicators

## 📚 Documentation

- `BACKEND_INTEGRATION.md` - Complete integration guide
- `INTEGRATION_SUMMARY.md` - What was implemented
- Backend Contract - Full API specification
- Type definitions in `lib/types.ts`

## 🎉 You're Ready!

The frontend is fully integrated and ready to use. Start the backend, run the frontend, and you're good to go!

## 🆘 Need Help?

1. Check browser console for errors
2. Check backend logs
3. Review `BACKEND_INTEGRATION.md` for details
4. Verify environment variables
5. Clear browser cache and localStorage

---

**Happy Coding! 🚀**
