# Backend Integration Guide

This document describes how the frontend is integrated with the backend API according to the official contract.

## Architecture

### Service Layer

All API calls are centralized in the `/services` directory:

- `auth.service.ts` - Authentication operations
- `projects.service.ts` - Project CRUD operations
- `tasks.service.ts` - Task management
- `notifications.service.ts` - User notifications
- `websocket.service.ts` - Real-time WebSocket communication

### API Client

The `lib/api-client.ts` provides:

- Automatic token refresh on 401 errors
- Centralized error handling
- Request/response interceptors
- Token management

### Configuration

API configuration is centralized in `lib/api-config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  WEBSOCKET_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000',
}
```

## Environment Setup

Create a `.env.local` file (use `.env.local.example` as template):

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

## Authentication Flow

### Login Process

1. User submits credentials via `/sign-in` page
2. `authService.login()` calls `POST /auth/login`
3. Backend returns `accessToken` and user data
4. Token stored in localStorage
5. User redirected to dashboard
6. WebSocket connection established

### Token Management

- **Access Token**: Stored in localStorage, expires in 15 minutes
- **Refresh Token**: Stored in httpOnly cookie (managed by backend), expires in 7 days
- **Auto Refresh**: API client automatically refreshes tokens on 401 errors

### Protected Routes

Use the `ProtectedRoute` component to guard authenticated pages:

```typescript
import { ProtectedRoute } from '@/components/protected-route'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}
```

## Context Providers

### AuthContext

Manages authentication state:

```typescript
const { user, isAuthenticated, login, logout, register, isLoading, error } = useAuth()
```

### ProjectsContext

Manages project data with API integration:

```typescript
const { 
  projects, 
  isLoading, 
  error,
  addProject, 
  updateProject, 
  deleteProject, 
  refreshProjects 
} = useProjects()
```

### TasksContext

Manages tasks with real-time updates:

```typescript
const { 
  tasksByProject,
  isLoading,
  error,
  getTasks,
  loadProjectTasks,
  addTask,
  updateTask,
  deleteTask,
  moveTask,
  completeTask
} = useTasks()
```

## Real-Time Features (WebSocket)

### Connection

WebSocket automatically connects when user authenticates:

```typescript
websocketService.connect(accessToken)
```

### Project Rooms

Join a project room to receive real-time updates:

```typescript
websocketService.joinProject(projectId)
```

### Event Listeners

The TasksContext automatically subscribes to:

- `task:created` - New task added
- `task:updated` - Task modified
- `task:deleted` - Task removed
- `task:moved` - Task moved between columns

### Custom Event Handling

```typescript
websocketService.onTaskCreated((data) => {
  console.log('New task:', data.task)
})
```

## Error Handling

### API Errors

All API errors are instances of `ApiError`:

```typescript
try {
  await projectsService.createProject(data)
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.code)      // Error code from backend
    console.log(error.message)   // Human-readable message
    console.log(error.details)   // Additional error details
    console.log(error.statusCode) // HTTP status code
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` (401) - Invalid or expired token
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource doesn't exist
- `VALIDATION_ERROR` (422) - Input validation failed
- `CONFLICT` (409) - Duplicate resource
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests

### Context Error Handling

All contexts expose error state:

```typescript
const { error, clearError } = useProjects()

// Display error
{error && <Alert variant="destructive">{error}</Alert>}

// Clear error
useEffect(() => {
  clearError()
}, [])
```

## Data Types

All type definitions match the backend contract (see `lib/types.ts`):

### Enums

- `ProjectStatus`: `'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'PLANNING'`
- `TaskPriority`: `'HIGH' | 'MEDIUM' | 'LOW'`
- `ProjectRole`: `'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'`
- `UserStatus`: `'ONLINE' | 'AWAY' | 'OFFLINE'`

### Key Interfaces

- `User` - User profile data
- `Project` - Project details
- `Task` - Task information
- `Notification` - User notifications
- `ProjectMember` - Project membership info

## API Usage Examples

### Create Project

```typescript
const project = await projectsService.createProject({
  name: 'New Project',
  description: 'Project description',
  color: '#3B82F6',
  status: 'IN_PROGRESS'
})
```

### Create Task

```typescript
const task = await tasksService.createTask(projectId, {
  title: 'Task title',
  description: 'Task description',
  columnId: columnId,
  priority: 'HIGH',
  tags: ['frontend', 'urgent'],
  assigneeId: userId,
  dueDate: '2024-01-31T23:59:59.000Z'
})
```

### Move Task

```typescript
await tasksService.moveTask(taskId, {
  columnId: newColumnId,
  position: 0
})
```

### Get Notifications

```typescript
const { notifications, total, unreadCount } = await notificationsService.getNotifications({
  page: 1,
  limit: 20,
  unreadOnly: true
})
```

## Loading States

All contexts provide `isLoading` state:

```typescript
const { projects, isLoading } = useProjects()

if (isLoading) {
  return <LoadingSpinner />
}

return <ProjectsList projects={projects} />
```

## Optimistic Updates

The TasksContext implements optimistic updates:

1. Update local state immediately
2. Make API call
3. If API call fails, revert local state
4. WebSocket confirms change from server

This provides instant feedback while maintaining consistency.

## Rate Limiting

The backend implements rate limits:

- **General endpoints**: 100 requests / 15 minutes
- **Auth endpoints**: 5 requests / 15 minutes
- **File uploads**: 50 uploads / hour

Monitor rate limit headers:

```typescript
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Security Best Practices

1. **Never log tokens** - Tokens are sensitive and should not be logged
2. **HTTPS in production** - Always use HTTPS for API calls
3. **Token storage** - Access token in localStorage, refresh token in httpOnly cookie
4. **Auto logout** - Clear auth data when token refresh fails
5. **CORS** - Backend CORS is configured for frontend origin

## Troubleshooting

### Connection Issues

```typescript
// Check API health
const response = await fetch(`${API_CONFIG.BASE_URL}/health`)
```

### WebSocket Not Connecting

1. Verify token is valid
2. Check WebSocket URL configuration
3. Ensure backend WebSocket server is running
4. Check browser console for connection errors

### Authentication Loops

1. Clear localStorage: `localStorage.clear()`
2. Clear cookies
3. Restart browser
4. Check token expiration

### Stale Data

```typescript
// Force refresh from API
await refreshProjects()
await loadProjectTasks(projectId)
```

## Migration from Mock Data

The integration is complete - all mock data and localStorage usage has been replaced with real API calls:

- ✅ Authentication (login, register, logout)
- ✅ Projects (CRUD operations)
- ✅ Tasks (CRUD + real-time updates)
- ✅ WebSocket (real-time collaboration)
- ✅ Error handling
- ✅ Loading states
- ✅ Token management

## Testing

When testing against the backend:

1. Start backend server on `http://localhost:5000`
2. Start frontend: `npm run dev`
3. Navigate to `http://localhost:3000`
4. Register a new account or login
5. Test CRUD operations
6. Open multiple browser windows to test real-time updates

## Production Deployment

Update environment variables for production:

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_WS_URL=https://api.yourdomain.com
```

Ensure backend CORS is configured for production frontend URL.
