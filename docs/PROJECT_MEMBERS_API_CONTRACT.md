# Project Members API – Frontend Contract

Contract for the Project Members endpoints. Use this for types, API client, and tests.

---

## Base URL & Auth

- **Base path:** `{API_BASE}/api/v1`  
  Example: `http://localhost:5001/api/v1`
- **Auth:** Send on every request:
  - Header: `Authorization: Bearer <accessToken>`
  - Header: `Content-Type: application/json`
- **IDs:** All `id`, `userId`, `projectId` are UUIDs (e.g. `"550e8400-e29b-41d4-a716-446655440000"`).

---

## Response envelope

**Success:**

```ts
{
  success: true;
  data?: T;           // response payload
  message?: string;   // optional human-readable message
}
```

**Error:**

```ts
{
  success: false;
  message: string;   // human-readable error message
  error?: {
    code?: string;   // e.g. "BAD_REQUEST", "FORBIDDEN", "NOT_FOUND"
    details?: any;  // optional validation/details
  };
}
```

---

## TypeScript types

```ts
/** Project member role */
export type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

/** User when nested inside ProjectMember */
export interface ProjectMemberUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  status?: string; // e.g. "ONLINE" | "AWAY" | "OFFLINE"
}

/** Project member (list item or single member response) */
export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: ProjectRole;
  joinedAt: string; // ISO 8601
  user: ProjectMemberUser;
}

/** Success response for a single member */
export interface ProjectMemberResponse {
  success: true;
  data: ProjectMember;
  message?: string;
}

/** Success response for list of members */
export interface ProjectMemberListResponse {
  success: true;
  data: ProjectMember[];
  message?: string;
}

/** Error response */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: {
    code?: string;
    details?: unknown;
  };
}
```

---

## Endpoints

### 1. List project members

**GET** `{API_BASE}/api/v1/projects/:projectId/members`

**Auth:** Required. Caller must be a project member (or owner).

**Path params:**

| Param       | Type   | Description   |
|------------|--------|---------------|
| `projectId` | string | Project UUID  |

**Success:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "mem-uuid",
      "userId": "user-uuid",
      "projectId": "project-uuid",
      "role": "MEMBER",
      "joinedAt": "2025-01-15T10:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "email": "jane@example.com",
        "firstName": "Jane",
        "lastName": "Doe",
        "avatar": "https://...",
        "status": "ONLINE"
      }
    }
  ]
}
```

- Returns `data: []` when there are no members.
- Every item includes a populated `user` (id, email, firstName, lastName, avatar, status).

**Errors:**

| Status | When |
|--------|------|
| `401`  | Missing or invalid token |
| `404`  | Project not found or no access |

---

### 2. Add member to project

**POST** `{API_BASE}/api/v1/projects/:projectId/members`

**Auth:** Required. Caller must be **OWNER** or **ADMIN** of the project.

**Path params:**

| Param       | Type   | Description   |
|------------|--------|---------------|
| `projectId` | string | Project UUID  |

**Body:**

```ts
{
  userId: string;  // required, UUID of user to add
  role: ProjectRole; // required: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
}
```

**Success:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "mem-new-uuid",
    "userId": "user-uuid",
    "projectId": "project-uuid",
    "role": "MEMBER",
    "joinedAt": "2025-01-20T14:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "email": "newuser@example.com",
      "firstName": "New",
      "lastName": "User",
      "avatar": null,
      "status": "OFFLINE"
    }
  },
  "message": "Member added successfully"
}
```

**Errors:**

| Status | When |
|--------|------|
| `400`  | Missing/invalid `userId` or `role`; or user already a member |
| `401`  | Missing or invalid token |
| `403`  | Caller is not OWNER or ADMIN |
| `404`  | Project or user not found |

---

### 3. Remove member from project

**DELETE** `{API_BASE}/api/v1/projects/:projectId/members/:userId`

**Auth:** Required.

**Behaviour:**

- Caller may remove **themselves** (leave project), or
- Caller may remove **another user** only if they are **OWNER** or **ADMIN**.
- The last OWNER cannot be removed (or leave) until ownership is transferred.

**Path params:**

| Param       | Type   | Description        |
|------------|--------|--------------------|
| `projectId` | string | Project UUID       |
| `userId`    | string | User UUID to remove |

**Success:** `200 OK`

```json
{
  "success": true,
  "message": "Member removed"
}
```

(`data` may be omitted or `null`.)

**Errors:**

| Status | When |
|--------|------|
| `401`  | Missing or invalid token |
| `403`  | Not allowed (e.g. not admin, or removing/leaving as last owner) |
| `404`  | Project or member not found |

---

### 4. Update member role

**PATCH** `{API_BASE}/api/v1/projects/:projectId/members/:userId/role`

**Auth:** Required. Caller must be **OWNER** or **ADMIN**. The last OWNER cannot be demoted.

**Path params:**

| Param       | Type   | Description   |
|------------|--------|---------------|
| `projectId` | string | Project UUID  |
| `userId`    | string | Member's user UUID |

**Body:**

```ts
{
  role: ProjectRole; // "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
}
```

**Success:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "mem-uuid",
    "userId": "user-uuid",
    "projectId": "project-uuid",
    "role": "ADMIN",
    "joinedAt": "2025-01-15T10:00:00.000Z",
    "user": { "..." }
  },
  "message": "Member role updated successfully"
}
```

**Errors:**

| Status | When |
|--------|------|
| `400`  | Invalid `role` |
| `401`  | Missing or invalid token |
| `403`  | Not OWNER/ADMIN, or demoting the last OWNER |
| `404`  | Project or member not found |

---

## Summary table

| Method | Endpoint | Purpose        | Caller permission      |
|--------|----------|----------------|------------------------|
| GET    | `/projects/:projectId/members` | List members   | Any project member     |
| POST   | `/projects/:projectId/members` | Add member     | OWNER or ADMIN         |
| DELETE | `/projects/:projectId/members/:userId` | Remove member | Self, or OWNER/ADMIN for others |
| PATCH  | `/projects/:projectId/members/:userId/role` | Update role | OWNER or ADMIN         |

---

## Example API client (fetch)

```ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1$/, '') ?? 'http://localhost:5001';

function headers(accessToken: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function getProjectMembers(accessToken: string, projectId: string): Promise<ProjectMember[]> {
  const res = await fetch(`${API_BASE}/api/v1/projects/${projectId}/members`, { headers: headers(accessToken) });
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Failed to fetch members');
  return json.data ?? [];
}

export async function addProjectMember(
  accessToken: string,
  projectId: string,
  body: { userId: string; role: ProjectRole }
): Promise<ProjectMember> {
  const res = await fetch(`${API_BASE}/api/v1/projects/${projectId}/members`, {
    method: 'POST',
    headers: headers(accessToken),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Failed to add member');
  return json.data;
}

export async function removeProjectMember(
  accessToken: string,
  projectId: string,
  userId: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/projects/${projectId}/members/${userId}`, {
    method: 'DELETE',
    headers: headers(accessToken),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Failed to remove member');
}

export async function updateProjectMemberRole(
  accessToken: string,
  projectId: string,
  userId: string,
  role: ProjectRole
): Promise<ProjectMember> {
  const res = await fetch(`${API_BASE}/api/v1/projects/${projectId}/members/${userId}/role`, {
    method: 'PATCH',
    headers: headers(accessToken),
    body: JSON.stringify({ role }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Failed to update role');
  return json.data;
}
```

---

*Backend: Task Management API – Project Members. Align frontend types and `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:5001/api/v1`) with this contract.*
