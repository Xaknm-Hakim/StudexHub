# Auth API

> Generated: 2026-05-10
> Last Updated: 2026-05-10
> Source: `app/app/api/auth`

---

## Base Path

`/api/auth`

---

## POST /api/auth/login

### Description

Authenticates a user using email and password, then creates a signed session token and stores it in the `bh_session` cookie.

### Auth

Not Required

This is the login endpoint used to create authentication.

### Query Params

| Name | Type | Required | Description                                     |
| ---- | ---- | -------- | ----------------------------------------------- |
| None | -    | No       | This endpoint does not accept query parameters. |

### Request Body

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

### Request Body Fields

| Field      | Type     | Required | Description                                                     |
| ---------- | -------- | -------- | --------------------------------------------------------------- |
| `email`    | `string` | Yes      | User email. Trimmed, then converted to lowercase before lookup. |
| `password` | `string` | Yes      | Plaintext password used for bcrypt verification.                |

### Response

```json
{
  "ok": true
}
```

### Notes

* On success, the route sets the session cookie `bh_session`.
* Session duration is set to 7 days using `maxAge`.
* Cookie settings:

  * `httpOnly: true`
  * `sameSite: "lax"`
  * `path: "/"`
  * `secure` depends on `COOKIE_SECURE === "true"`
* Invalid email and invalid password both return the same message: `Invalid credentials`.
* This helps reduce credential enumeration through response wording.

### Common Error Responses

```json
{
  "error": "email and password are required"
}
```

```json
{
  "error": "Invalid credentials"
}
```

```json
{
  "error": "Login failed"
}
```

---

## POST /api/auth/logout

### Description

Clears the current session cookie and logs the user out.

### Auth

Not Required

This endpoint clears the cookie regardless of whether the caller is currently authenticated.

### Query Params

| Name | Type | Required | Description                                     |
| ---- | ---- | -------- | ----------------------------------------------- |
| None | -    | No       | This endpoint does not accept query parameters. |

### Request Body

```json
{}
```

### Response

```json
{
  "ok": true
}
```

### Notes

* The route clears the `bh_session` cookie by setting an empty value and `maxAge: 0`.
* Cookie clearing uses the same cookie option base as login.

---

## GET /api/auth/me

### Description

Returns the currently authenticated user's basic profile information based on the session cookie.

### Auth

Required

Authentication is enforced by reading the `bh_session` cookie and verifying the JWT session token.

### Query Params

| Name | Type | Required | Description                                     |
| ---- | ---- | -------- | ----------------------------------------------- |
| None | -    | No       | This endpoint does not accept query parameters. |

### Request Body

```json
{}
```

### Response

```json
{
  "user": {
    "id": "user_001",
    "email": "user@example.com",
    "name": "Hakim",
    "createdAt": "2026-04-18T09:00:00.000Z"
  }
}
```

### Response Fields

| Field            | Type             | Description                 |
| ---------------- | ---------------- | --------------------------- |
| `user`           | `object`         | Authenticated user profile. |
| `user.id`        | `string`         | User ID.                    |
| `user.email`     | `string`         | User email.                 |
| `user.name`      | `string \| null` | User display name.          |
| `user.createdAt` | `string`         | User creation timestamp.    |

### Notes

* If the session cookie is missing, invalid, expired, or points to a missing user, the endpoint returns `401`.
* The route returns only a basic profile projection, not the full user record.

### Common Error Responses

```json
{
  "error": "Not authenticated"
}
```

---

## POST /api/auth/signup

### Description

Creates a new user account using email, password, and a valid invite code.

### Auth

Not Required

This is the registration endpoint used before login.

### Query Params

| Name | Type | Required | Description                                     |
| ---- | ---- | -------- | ----------------------------------------------- |
| None | -    | No       | This endpoint does not accept query parameters. |

### Request Body

```json
{
  "name": "Hakim",
  "email": "user@example.com",
  "password": "your-password",
  "inviteCode": "ABC123-OTP999"
}
```

### Request Body Fields

| Field        | Type             | Required | Description                                                             |
| ------------ | ---------------- | -------- | ----------------------------------------------------------------------- |
| `name`       | `string \| null` | No       | Optional display name. Trimmed before save. Empty value becomes `null`. |
| `email`      | `string`         | Yes      | User email. Trimmed, then converted to lowercase before save.           |
| `password`   | `string`         | Yes      | Plaintext password, hashed with bcrypt cost 12 before storage.          |
| `inviteCode` | `string`         | Yes      | Invite code in `CODEID-OTP` format.                                     |

### Response

```json
{
  "ok": true
}
```

### Notes

* Invite code format must be `CODEID-OTP`.
* The code ID is used to look up the invite record.
* The OTP portion is hashed using SHA-256 with optional `INVITE_PEPPER` before comparison.
* Invite code validation checks:

  * invite exists
  * invite not already used
  * invite not locked
  * invite not expired
  * OTP matches stored hash
* Wrong OTP increments `attemptCount`.
* Invite code is locked when failed attempts reach 5.
* User creation and invite usage marking are done in a single Prisma transaction.
* This endpoint does **not** automatically log the user in after successful signup.

### Common Error Responses

```json
{
  "error": "email, password, inviteCode are required"
}
```

```json
{
  "error": "Invite code format must be CODEID-OTP"
}
```

```json
{
  "error": "Invalid invite code"
}
```

```json
{
  "error": "Invite code already used"
}
```

```json
{
  "error": "Invite code locked"
}
```

```json
{
  "error": "Invite code expired"
}
```

```json
{
  "error": "Email already registered"
}
```

```json
{
  "error": "Signup failed"
}
```
