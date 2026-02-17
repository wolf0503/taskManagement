# Backend: Calendar Events API Contract

Contract for storing and retrieving user-created calendar events so the frontend calendar page works with the backend.

---

## Base URL & Auth

- **Base path:** `{API_BASE}/api/v1` (e.g. `http://localhost:5001/api/v1`)
- **Auth:** All requests send `Authorization: Bearer <accessToken>`.
- **Content-Type:** `application/json`

---

## Response envelope

Success:

```json
{
  "success": true,
  "data": { ... }
}
```

For list endpoints, `data` is an array of events.

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

### CalendarEventType (enum)

- `meeting`
- `deadline`
- `task`

### CalendarEvent (object)

| Field      | Type     | Required | Description |
|-----------|----------|----------|-------------|
| id        | string   | yes      | Unique event ID (e.g. UUID) |
| title     | string   | yes      | Event title |
| type      | string   | yes      | One of `CalendarEventType` |
| date      | string   | yes      | Date in `YYYY-MM-DD` |
| time      | string   | yes      | e.g. `"09:00 AM"` |
| duration  | string   | no       | e.g. `"1 hour"`, `"30 min"` |
| attendees | string[] | no       | Array of display names (or future: user IDs) |
| location  | string   | no       | e.g. `"Zoom"`, `"Conference Room A"` |
| color     | string   | no       | CSS-like class e.g. `"bg-chart-1"` |
| project   | string   | no       | Project or category name |
| userId    | string   | no       | Owner user ID (set by backend from token) |
| createdAt | string   | no       | ISO 8601 |
| updatedAt | string   | no       | ISO 8601 |

### Create body (POST)

| Field     | Type     | Required | Description |
|-----------|----------|----------|-------------|
| title     | string   | yes      | Event title |
| type      | string   | yes      | One of `meeting`, `deadline`, `task` |
| date      | string   | yes      | `YYYY-MM-DD` |
| time      | string   | no       | Default e.g. `"09:00 AM"` |
| duration  | string   | no       | |
| attendees | string[] | no       | |
| location  | string   | no       | |
| color     | string   | no       | |
| project   | string   | no       | |

### Update body (PATCH)

All fields optional. Only sent fields are updated.

| Field     | Type     | Description |
|-----------|----------|-------------|
| title     | string   | |
| type      | string   | `meeting` \| `deadline` \| `task` |
| date      | string   | `YYYY-MM-DD` |
| time      | string   | |
| duration  | string   | |
| attendees | string[] | |
| location  | string   | |
| color     | string   | |
| project   | string   | |

---

## Endpoints

### 1. List calendar events

**GET** `/calendar/events`

Returns events for the authenticated user. Optional query params for filtering by date range:

| Query       | Type   | Description |
|-------------|--------|--------------|
| startDate   | string | `YYYY-MM-DD` – include events on or after this date |
| endDate     | string | `YYYY-MM-DD` – include events on or before this date |
| limit       | number | Max number of events to return (optional) |

**Example:** `GET /calendar/events?startDate=2025-02-01&endDate=2025-02-28`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "evt-uuid-1",
      "title": "Team Standup",
      "type": "meeting",
      "date": "2025-02-15",
      "time": "09:00 AM",
      "duration": "30 min",
      "attendees": [],
      "location": "Zoom",
      "color": "bg-chart-1",
      "project": "Website Redesign",
      "userId": "user-uuid",
      "createdAt": "2025-02-01T12:00:00.000Z",
      "updatedAt": "2025-02-01T12:00:00.000Z"
    }
  ]
}
```

If `startDate`/`endDate` are omitted, backend may return all user events (optionally with a default limit).

---

### 2. Get one event

**GET** `/calendar/events/:id`

**Response:** `200 OK` – `data` is a single `CalendarEvent`.  
**Errors:** `404` if not found or not owned by the user.

---

### 3. Create event

**POST** `/calendar/events`

**Body:**

```json
{
  "title": "Sprint Planning",
  "type": "meeting",
  "date": "2025-02-20",
  "time": "10:00 AM",
  "duration": "2 hours",
  "attendees": [],
  "location": "Conference Room B",
  "color": "bg-chart-4",
  "project": "Mobile App"
}
```

**Response:** `201 Created` (or `200 OK`) – `data` is the created `CalendarEvent` with `id`, `userId` (from token), `createdAt`, `updatedAt`.

**Errors:** `400` if validation fails (e.g. missing `title` or `date`, invalid `type`).

---

### 4. Update event

**PATCH** `/calendar/events/:id`

**Body:** Any subset of create fields (all optional).

**Response:** `200 OK` – `data` is the updated `CalendarEvent`.

**Errors:** `404` if not found or not owned by the user; `400` for validation errors.

---

### 5. Delete event

**DELETE** `/calendar/events/:id`

**Response:** `200 OK` or `204 No Content`. Body may be empty or `{ "success": true }`.

**Errors:** `404` if not found or not owned by the user.

---

## Summary

| Method | Path                    | Description        |
|--------|-------------------------|--------------------|
| GET    | /calendar/events        | List (optional startDate, endDate, limit) |
| GET    | /calendar/events/:id     | Get one            |
| POST   | /calendar/events        | Create             |
| PATCH  | /calendar/events/:id    | Update             |
| DELETE | /calendar/events/:id    | Delete             |

All endpoints are scoped to the authenticated user (only their events). The frontend uses the same base URL and sends the Bearer token via the existing API client.
