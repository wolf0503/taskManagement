# Backend API Request: Columns Endpoints

## Issue

When creating tasks, the frontend receives a 422 validation error:
```json
{
  "field": "columnId",
  "message": "Valid column ID is required",
  "value": "todo"
}
```

The backend requires a valid column ID (UUID from the database), but the frontend has no way to fetch the available columns for a project.

## Required API Endpoints

Please implement the following endpoints for managing project columns:

### 1. Get Project Columns
**Endpoint:** `GET /api/v1/projects/:projectId/columns`

**Description:** Returns all columns (statuses) for a specific project.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-column-1",
      "title": "To Do",
      "color": "#6366f1",
      "projectId": "uuid-project-1",
      "position": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid-column-2",
      "title": "In Progress",
      "color": "#f59e0b",
      "projectId": "uuid-project-1",
      "position": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Create Column (Optional)
**Endpoint:** `POST /api/v1/projects/:projectId/columns`

**Request Body:**
```json
{
  "title": "In Review",
  "color": "#8b5cf6",
  "position": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-column-3",
    "title": "In Review",
    "color": "#8b5cf6",
    "projectId": "uuid-project-1",
    "position": 2,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Update Column (Optional)
**Endpoint:** `PATCH /api/v1/projects/:projectId/columns/:columnId`

**Request Body:**
```json
{
  "title": "Done",
  "color": "#10b981"
}
```

### 4. Delete Column (Optional)
**Endpoint:** `DELETE /api/v1/projects/:projectId/columns/:columnId`

**Response:**
```json
{
  "success": true,
  "message": "Column deleted successfully"
}
```

## Default Columns

When a project is created, please create these default columns automatically:

1. **To Do** - `#6366f1` (indigo)
2. **In Progress** - `#f59e0b` (amber)
3. **In Review** - `#8b5cf6` (purple)
4. **Done** - `#10b981` (green)

## Column Schema

```typescript
interface Column {
  id: string              // UUID
  title: string           // Column name
  color: string           // Hex color code
  projectId: string       // Reference to project
  position: number        // Order in the board (0-indexed)
  createdAt: string       // ISO timestamp
  updatedAt: string       // ISO timestamp
}
```

## Priority

**HIGH** - This is blocking task creation. The frontend cannot create tasks without valid column IDs.

## Temporary Workaround

Until these endpoints are implemented, please provide:
1. The column IDs that were created for existing projects
2. OR make `columnId` optional in task creation and auto-assign to the first column
3. OR return column IDs in the project details response

## Frontend Implementation Ready

The frontend already has:
- Column type definitions (`lib/types.ts`)
- Column service stub (`services/columns.service.ts`)
- Column context for state management

Once the backend endpoints are available, we can immediately integrate them.

## Questions?

Please let me know if you need any clarification on the required endpoints or data structures.
