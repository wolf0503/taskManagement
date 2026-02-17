# 429 Too Many Requests on Login

If you see:

```text
POST http://localhost:4000/api/v1/auth/login 429 (Too Many Requests)
Login failed: ApiError: Too many requests. Please wait a few minutes and try again.
```

the **backend** is rate-limiting the `/auth/login` endpoint. The frontend cannot fix this.

## What to do

### 1. Wait and try again

- Stop submitting the form for **a few minutes** (often 1–5, depending on the server).
- Try logging in **once** after that. Avoid multiple rapid clicks.

### 2. Relax the rate limit on the backend (if you control it)

If you run the API at `localhost:4000` yourself:

- Find where rate limiting is configured (e.g. `express-rate-limit`, `@nestjs/throttler`, or similar).
- For **local development** only, either:
  - **Increase** the allowed number of requests per window for `POST /auth/login`, or
  - **Disable** rate limiting for that route (or for all routes) when `NODE_ENV=development` or when the request is from `localhost`.

Example (Express with `express-rate-limit`):

```js
// Only apply strict limit in production
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
})
app.use('/api/v1/auth/login', authLimiter)
```

After changing the backend, restart it and try logging in again.

### 3. Avoid triggering the limit

- Use **one** sign-in click per attempt; the sign-in button is disabled while the request is in progress.
- Don’t refresh and retry repeatedly; that increases the request count and keeps the limit in effect longer.
