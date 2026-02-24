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

## Database persistence (required)

The backend **must** persist avatar in the database so that the photo is saved and removed correctly.

### Upload new photo (POST `/auth/me/avatar`)

1. Accept the uploaded file (multipart field `avatar`).
2. Validate type (e.g. image/jpeg, image/png, image/gif, image/webp) and size (e.g. max 5 MB).
3. **Save the file** to your storage (e.g. disk under `uploads/`, or cloud storage).
4. **Save the avatar URL/path in the database**: update the current user’s `avatar` field with the new URL (e.g. `/uploads/avatars/{userId}-{timestamp}.jpg` or a full URL). Persist this in the user record so it survives restarts.
5. If the user had a previous avatar, optionally delete the old file from storage.
6. Return `200 OK` with the updated User object (including the new `avatar` value).

### Remove photo (PATCH `/auth/me` with `{ "avatar": null }`)

1. **Update the database**: set the current user’s `avatar` field to `null` in the user table.
2. Optionally **delete the avatar file** from storage (so it is removed from disk/blob storage as well).
3. Return `200 OK` with the updated User object (`avatar: null`).

The frontend already calls these endpoints and updates the UI from the response; the backend is responsible for persisting and deleting avatar data in the database (and storage) as above.

---

## Summary

| Method | Path            | Description        | Body |
|--------|-----------------|--------------------|------|
| PATCH  | `/auth/me`      | Update profile     | JSON: firstName, lastName, email?, phone?, bio?, location?, avatar? (null to remove) |
| POST   | `/auth/me/avatar` | Upload new avatar | multipart/form-data, field `avatar` (file) |

After implementing these two routes **with database persistence** as above, the frontend **Account settings → Profile** tab will save the new photo in the database on upload and remove it from the database on Remove.
