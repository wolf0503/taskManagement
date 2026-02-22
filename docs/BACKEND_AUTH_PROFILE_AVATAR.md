# Backend: Auth Profile & Avatar API Contract

Contract for updating the current user profile and uploading an avatar. The frontend **Account settings** page uses these endpoints.

---

## Base URL & Auth

- **Base path:** `{API_BASE}/api/v1` (e.g. `http://localhost:4000/api/v1`)
- **Auth:** All requests send `Authorization: Bearer <accessToken>`.
- **Content-Type:** `application/json` for PATCH; `multipart/form-data` for avatar upload (browser sets boundary).

---

## Response envelope

Success:

```json
{
  "success": true,
  "data": { ... }
}
```

`data` is the updated **User** object (same shape as `GET /auth/me`).

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

## User object (relevant fields)

| Field     | Type   | Description |
|-----------|--------|--------------|
| id        | string | User ID |
| email     | string | |
| firstName | string | |
| lastName  | string | |
| avatar    | string \| null | URL of profile image (null = no avatar) |
| phone     | string \| null | |
| bio       | string \| null | |
| location  | string \| null | |
| status    | string | e.g. ONLINE, AWAY, OFFLINE |
| ...       | ...    | Other fields as in existing User model |

---

## Endpoints

### 1. Update profile (PATCH)

**PATCH** `/auth/me`

Updates the authenticated user's profile. Only sent fields are updated.

**Headers**

- `Authorization: Bearer <accessToken>`
- `Content-Type: application/json`

**Request body (all fields optional)**

| Field     | Type   | Description |
|-----------|--------|-------------|
| firstName | string | |
| lastName  | string | |
| email     | string | If changing email, backend may require verification |
| phone     | string | |
| bio       | string | |
| location  | string | |
| avatar    | null   | Set to `null` to remove the current avatar |

**Example**

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1 555 123 4567",
  "bio": "Developer",
  "location": "San Francisco, CA"
}
```

To remove avatar only:

```json
{
  "avatar": null
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "avatar": "https://...",
    "phone": "+1 555 123 4567",
    "bio": "Developer",
    "location": "San Francisco, CA",
    "status": "ONLINE",
    ...
  }
}
```

**Errors**

- `401 Unauthorized` – invalid or missing token
- `400 Bad Request` – validation (e.g. invalid email)
- `409 Conflict` – e.g. email already taken (if backend supports)

---

### 2. Upload avatar (POST)

**POST** `/auth/me/avatar`

Upload a new profile image. Replaces existing avatar.

**Headers**

- `Authorization: Bearer <accessToken>`
- **Do not set** `Content-Type` – client sends `multipart/form-data` and browser sets the boundary.

**Request body**

- **Content-Type:** `multipart/form-data`
- **Field name:** `avatar`
- **Value:** file (image)
- **Accepted types:** image/jpeg, image/png, image/gif, image/webp
- **Max size:** 5 MB (backend may enforce and return 413 if exceeded)

**Example (conceptual)**

```
POST /api/v1/auth/me/avatar
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...

------WebKitFormBoundary...
Content-Disposition: form-data; name="avatar"; filename="photo.jpg"
Content-Type: image/jpeg

<binary>
------WebKitFormBoundary...--
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "...",
    "firstName": "...",
    "lastName": "...",
    "avatar": "https://your-cdn.com/avatars/user-xxx.jpg",
    "phone": null,
    "bio": null,
    "location": null,
    "status": "ONLINE",
    ...
  }
}
```

The `avatar` field in `data` must be the full URL of the stored image (or `null` if upload failed and backend clears it).

**Errors**

- `401 Unauthorized` – invalid or missing token
- `400 Bad Request` – missing file, wrong field name, or invalid file type
- `413 Payload Too Large` – file over 5 MB (or your limit)

---

## Summary

| Method | Path            | Description        | Body |
|--------|-----------------|--------------------|------|
| PATCH  | `/auth/me`      | Update profile     | JSON: firstName, lastName, email?, phone?, bio?, location?, avatar? (null to remove) |
| POST   | `/auth/me/avatar` | Upload new avatar | multipart/form-data, field `avatar` (file) |

After implementing these two routes, the frontend **Account settings → Profile** tab will be able to save profile changes, upload a new photo, and remove the avatar.
