# Backend: Project Members API

Instructions for implementing project members logic so it works with the frontend.

---

## Base URL & Auth

- **Base path:** `{API_BASE}/api/v1` (e.g. `http://localhost:5001/api/v1`)
- **Auth:** All requests send `Authorization: Bearer <accessToken>`.
- **Content-Type:** `application/json`

---

## Response envelope

All responses must use this shape:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Errors:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

---

## Types

### ProjectRole (enum)

- `OWNER` – Full control, can delete project and manage owners
- `ADMIN` – Manage members and settings
- `MEMBER` – Can create/edit tasks and comment
- `VIEWER` – Read-only

### ProjectMember (object)

| Field     | Type   | Description                    |
|----------|--------|--------------------------------|
| id       | string | Unique member record ID       |
| userId   | string | User ID                        |
| projectId| string | Project ID                     |
| role     | string | One of ProjectRole             |
| joinedAt | string | ISO 8601 date                  |
| user     | object | (Optional) Populated User      |

### User (object, when populating `member.user`)

| Field      | Type   | Required |
|-----------|--------|----------|
| id        | string | yes      |
| email     | string | yes      |
| firstName | string | yes      |
| lastName  | string | yes      |
| avatar    | string | no       |
| status    | string | no (e.g. ONLINE, AWAY, OFFLINE) |

---

## Endpoints

### 1. List project members

**GET** `/projects/:projectId/members`

**Auth:** Required. Caller must have access to the project (e.g. be a member or admin).

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "mem_abc123",
      "userId": "user_xyz",
      "projectId": "proj_123",
      "role": "MEMBER",
      "joinedAt": "2025-01-15T10:00:00.000Z",
      "user": {
        "id": "user_xyz",
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

**Backend logic:**

- Resolve `projectId` and ensure project exists.
- Ensure the authenticated user is a member (or has permission to list members).
- Query `project_members` (or equivalent) for the project.
- Join with `users` so each member has a `user` object (id, email, firstName, lastName, avatar, status).
- Return the array as `data`. Return `[]` if no members.

**Errors:**

- `404` – Project not found or no access.
- `401` – Missing or invalid token.

---

### 2. Add member to project

**POST** `/projects/:projectId/members`

**Auth:** Required. Caller must be OWNER or ADMIN for the project.

**Request body:**

```json
{
  "userId": "user_uuid_or_id",
  "role": "MEMBER"
}
```

| Field  | Type   | Required | Description        |
|--------|--------|----------|--------------------|
| userId | string | yes      | User to add        |
| role   | string | yes      | One of: OWNER, ADMIN, MEMBER, VIEWER |

**Response:** `201 Created` (or `200 OK`)

```json
{
  "success": true,
  "data": {
    "id": "mem_new123",
    "userId": "user_uuid_or_id",
    "projectId": "proj_123",
    "role": "MEMBER",
    "joinedAt": "2025-01-20T14:00:00.000Z",
    "user": {
      "id": "user_uuid_or_id",
      "email": "newuser@example.com",
      "firstName": "New",
      "lastName": "User",
      "avatar": null,
      "status": "OFFLINE"
    }
  }
}
```

**Backend logic:**

1. Resolve `projectId` and ensure project exists.
2. Ensure the authenticated user is OWNER or ADMIN for that project.
3. Validate `userId` exists in `users`.
4. Validate `role` is one of OWNER, ADMIN, MEMBER, VIEWER.
5. Check the user is not already a member (avoid duplicate rows).
6. (Optional) If adding OWNER, enforce your policy (e.g. max one owner, or allow multiple).
7. Insert a row into `project_members` (projectId, userId, role, joinedAt).
8. Load the new member with `user` populated and return it as `data`.

**Errors:**

- `400` – Invalid body (e.g. missing userId/role, invalid role, user already member).
- `403` – Caller not allowed to add members.
- `404` – Project or user not found.

**Suggested DB shape (e.g. PostgreSQL):**

```sql
CREATE TABLE project_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
```

---

### 3. Remove member from project

**DELETE** `/projects/:projectId/members/:userId`

**Auth:** Required.

**Behavior:**

- The authenticated user may remove **themselves** (leave project), or
- The authenticated user may remove **another user** only if they are OWNER or ADMIN (and optionally cannot remove the last OWNER).

**Response:** `200 OK` or `204 No Content` with empty body or:

```json
{
  "success": true,
  "message": "Member removed"
}
```

**Backend logic:**

1. Resolve `projectId` and `userId` (path params).
2. Ensure the project exists and the target user is actually a member.
3. If caller is removing **themselves**: allow (member can leave).
4. If caller is removing **someone else**: ensure caller is OWNER or ADMIN; optionally prevent removing the last OWNER.
5. Delete the `project_members` row for (projectId, userId).
6. Return success.

**Errors:**

- `403` – Not allowed to remove this member (e.g. not admin, or trying to remove last owner).
- `404` – Project or member not found.

---

### 4. Update member role (optional, used by frontend)

**PATCH** `/projects/:projectId/members/:userId/role`

**Auth:** Required. Caller must be OWNER or ADMIN (and usually cannot demote the last OWNER).

**Request body:**

```json
{
  "role": "ADMIN"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "mem_abc123",
    "userId": "user_xyz",
    "projectId": "proj_123",
    "role": "ADMIN",
    "joinedAt": "2025-01-15T10:00:00.000Z",
    "user": { ... }
  }
}
```

**Backend logic:**

1. Ensure project exists and authenticated user is OWNER or ADMIN.
2. Find the member by (projectId, userId).
3. Update `role` (validate: one of OWNER, ADMIN, MEMBER, VIEWER).
4. Optionally: prevent demoting the last OWNER.
5. Return the updated member with `user` populated.

---

## Summary

| Method | Endpoint                                  | Purpose           |
|--------|-------------------------------------------|-------------------|
| GET    | `/projects/:projectId/members`            | List members      |
| POST   | `/projects/:projectId/members`            | Add member        |
| DELETE | `/projects/:projectId/members/:userId`   | Remove member     |
| PATCH  | `/projects/:projectId/members/:userId/role` | Update role (optional) |

- Use the same response envelope and types above so the frontend’s `projectsService` and types stay in sync.
- Always populate `user` on each member in list/add/update responses so the UI can show name, email, and avatar without extra calls.

---

## List users (for Add Member picker)

The “Add member” dialog loads a list of all users so the user can select who to add instead of typing an ID.

**GET** `/users`

**Auth:** Required (e.g. any authenticated user, or restrict to admins).

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "user_xyz",
      "email": "jane@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "avatar": "https://...",
      "status": "ONLINE"
    }
  ]
}
```

- Return all users (or a paginated/search list) so the frontend can show them in a dropdown and exclude those already in the project.
- If this endpoint is not implemented yet, the frontend will show “No users found” and the add-member list will be empty until the backend exposes `GET /users`.
