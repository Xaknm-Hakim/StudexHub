# BaruasHub Auth API (Invite-only)

> Last Updated: 2026-05-10
> Status: Archived / Legacy
> Do not treat this document as the current API contract.

This document describes the backend auth endpoints for the frontend to integrate.

## Base URL
- Local dev: `http://localhost:3000`
- All endpoints are under `/api/auth/*`

## Cookie Session
- Login sets an HttpOnly cookie: `bh_session`
- Frontend does **not** need to read this cookie.
- Browser will send it automatically on same-origin requests.

---

## Invite Code Format (IMPORTANT)

Invite code is a single string in the format:

`CODEID-OTP`

Example:
`FPE3FL-K7M3Q9X2P4H1`

Notes:
- `CODEID` = 6 chars (public identifier)
- `OTP` = 12 chars (secret)
- Invite is:
  - single-use
  - expires (default 24h)
  - locks after 5 wrong OTP attempts for the same CODEID

---

## 1) Signup

### `POST /api/auth/signup`

Create a new user account using an invite code.

#### Request JSON
```json
{
  "name": "Din (optional)",
  "email": "din@example.com",
  "password": "StrongPassword123!",
  "inviteCode": "FPE3FL-K7M3Q9X2P4H1"
}
