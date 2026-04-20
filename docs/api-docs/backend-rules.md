
# backend-rules.md — StudexHub Backend Rules

> Last Updated: 2026-04-19
> Scope: Backend API, Type Safety, Validation, Route Discipline
> Status: Active Standard

---

## Purpose

This document defines the backend rules for StudexHub.

The goal is to make the backend:

* consistent
* predictable
* safe
* maintainable
* easy to extend without creating drift

This is not a theory document.

This is the operating standard for writing and reviewing backend code.

---

## Core Principle

> Every backend route must follow one shared structure, one shared response contract, and one shared safety mindset.

---

## Main Rules

## 1. One API response format only

All backend routes must return the same response shape.

### Success

```json
{
  "ok": true,
  "data": {}
}
```

Optional message:

```json
{
  "ok": true,
  "data": {},
  "message": "Created successfully"
}
```

### Error

```json
{
  "ok": false,
  "error": "Message"
}
```

Optional details:

```json
{
  "ok": false,
  "error": "Validation failed",
  "details": {}
}
```

### Rule

Do not return:

* raw arrays
* raw objects
* `{ success: true }`
* `{ success: false }`
* mixed shapes like `{ courses }`, `{ semester }`, or `{ deleted: true }`

Everything must follow:

```ts
ApiResponse<T>
```

---

## 2. `ok` is the only success flag

StudexHub backend uses:

```ts
ok: true
ok: false
```

Do not use:

* `success`
* `status: "success"`
* `result: true`

### Reason

The project standard has already chosen `ok` as the single response flag.
No dual-standard is allowed.

---

## 3. Every route must return typed responses

All routes must align with:

```ts
export interface ApiSuccess<T> {
  ok: true;
  data: T;
  message?: string;
}

export interface ApiError {
  ok: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

### Rule

Every route should return a typed success or error response.

Examples:

```ts
ApiResponse<Course>
ApiResponse<Course[]>
ApiResponse<Semester>
ApiResponse<{ id: string }>
```

---

## 4. Never trust external input

All external input is unsafe until validated.

This includes:

* `req.json()`
* query params
* headers
* cookies
* route params
* internal secret headers

### Rule

Never directly trust input from the request.

Bad:

```ts
const body = await req.json();
const name = body.name.trim();
```

Better:

```ts
const body = await req.json();
const name = String(body.name ?? "").trim();
```

Best:

```ts
const parsed = schema.safeParse(body);
if (!parsed.success) {
  return fail(400, "Invalid request body", parsed.error.flatten());
}
```

---

## 5. Validation must happen before business logic

Validation is not optional.

A route must not:

* write to database
* call Prisma
* compute logic
* mutate state

before input validation is complete.

### Required order

1. authenticate
2. parse input
3. validate input
4. execute logic
5. return typed response

---

## 6. No `any`

`any` is forbidden in backend code.

Do not use:

* `any`
* `as any`

Use:

* `unknown`
* explicit interfaces
* shared request types
* validation schemas
* narrowing

### Bad

```ts
catch (error: any)
```

### Good

```ts
catch (error: unknown)
```

---

## 7. Use shared request types

Request body contracts belong in:

```text
app/src/lib/types/requests.ts
```

### Rule

Do not redefine request body structures inside each route unless absolutely necessary.

Use shared request interfaces for:

* create bodies
* update bodies
* mutation payloads

### Goal

Prevent duplicated shape definitions and contract drift.

---

## 8. Keep API types and DB types separate

StudexHub already has separate layers for a reason.

### API layer

Use API types for:

* route responses
* frontend/backend transport
* serialized fields like ISO date strings

### DB layer

Use DB types for:

* persistence-facing logic
* Prisma-like record shapes
* native `Date` values before serialization

### Rule

Do not leak DB-native shapes directly into API responses.

Example:

* DB uses `Date`
* API returns `string`

That separation must remain clean.

---

## 9. Shared enums must remain the single source of truth

Enums belong in:

```text
app/src/lib/types/enums.ts
```

### Rule

Do not redefine enum-like string unions in random route files.

Use shared enums for:

* status
* priority
* notification type
* notification channel

This prevents mismatched values between backend, frontend, and DB logic.

---

## 10. One auth failure message only

Protected routes must return:

```json
{
  "ok": false,
  "error": "Unauthorized"
}
```

with HTTP status:

```ts
401
```

### Rule

Do not mix:

* `"Not authenticated"`
* `"Unauthenticated"`
* `"Login required"`

StudexHub standard is:

```ts
401 + "Unauthorized"
```

---

## 11. Status codes must be consistent

Use standard HTTP meanings.

### Required usage

* `400` — invalid request body, invalid params, invalid query
* `401` — unauthorized
* `403` — forbidden
* `404` — resource not found
* `409` — conflict
* `500` — unexpected server error

### Rule

Do not return `200` for failed operations just because JSON says `ok: false`.

Failure status must match real HTTP semantics.

---

## 12. Dynamic query inputs must be locked down

Any query input used for filtering, sorting, or lookup must be validated.

### Dangerous examples

* passing `sort` directly into Prisma
* trusting `status` from query params without checking allowed values
* building `orderBy` from raw user input

### Rule

Use allowlists for:

* sortable fields
* filterable enums
* accepted query options

Reject invalid values early.

---

## 13. Route handlers must be boring and predictable

A good backend route should look similar to other routes.

That is a feature, not a weakness.

### Standard route flow

1. auth guard
2. parse request
3. validate request
4. execute service / Prisma logic
5. return `ok(...)`
6. catch unknown error
7. return `fail(...)`

### Rule

Do not invent a new structure per route.

Consistency is more valuable than cleverness.

---

## 14. Use shared helpers for responses

Response creation should be centralized.

Preferred helper style:

```ts
ok(data, message?)
fail(status, error, details?)
```

### Goal

Reduce manual JSON shaping in every route and eliminate response drift.

---

## 15. Use shared helpers for error extraction

Error handling should use shared helpers such as:

```ts
getErrorMessage(error: unknown): string
```

### Rule

Do not manually guess error shape everywhere.

Centralize unknown error handling.

---

## 16. Internal route security must be centralized

Internal routes must not manually repeat secret-checking logic in every file.

### Rule

Use a shared helper such as:

```ts
requireInternalSecret()
```

for:

* internal jobs
* cron routes
* protected internal automation endpoints

### Goal

Prevent copy-paste mistakes and inconsistent secret validation.

---

## 17. Delete responses must follow one rule

Delete endpoints must not return random shapes.

Allowed standard:

```json
{
  "ok": true,
  "data": {
    "id": "..."
  }
}
```

Optional message allowed.

### Rule

Do not mix:

* `{ ok: true }`
* `{ success: true }`
* `{ deletedId: "..." }`
* raw deleted object unless intentionally required

Pick one rule and keep it everywhere.

---

## 18. Duplicate types are not allowed without reason

If a type exists in one shared place, do not duplicate it elsewhere.

### Rule

There must be one clear source of truth for each shared transport type.

### Current reminder

If a type like `Notification` exists in multiple files, it should be reviewed and consolidated.

---

## 19. Backend code must optimize for maintainability, not short-term speed

A route is not “done” just because it works.

A route is done when it is:

* correct
* typed
* validated
* consistent
* reviewable

### Rule

Avoid:

* rushed shortcuts
* silent casting
* inconsistent naming
* route-specific mini conventions

---

## 20. New backend contributors must follow the system, not invent the system

This project is growing.

That means backend contributors should not decide:

* response format
* error style
* auth message
* validation style
* route flow

Those are already decided by this document.

### Rule

When writing a new route:

* follow the standard
* reuse shared helpers
* reuse shared types
* do not create a new pattern unless the existing one is clearly insufficient

---

## Route Writing Standard

Every route should roughly follow this pattern:

```ts
export async function POST(req: Request) {
  try {
    const userId = await requireUserId();

    const body: unknown = await req.json();

    const parsed = createSomethingSchema.safeParse(body);
    if (!parsed.success) {
      return fail(400, "Invalid request body", parsed.error.flatten());
    }

    const result = await prisma.something.create({
      data: {
        userId,
        ...parsed.data,
      },
    });

    return ok(result, "Created successfully");
  } catch (error: unknown) {
    return fail(500, getErrorMessage(error));
  }
}
```

This exact helper naming may change later, but the structure must stay the same.

---

## Review Checklist

Before merging backend code, verify:

* [ ] Response shape uses `ok`
* [ ] Route returns `ApiResponse<T>`
* [ ] No raw response shape
* [ ] No `any`
* [ ] Request input validated before use
* [ ] Query params validated
* [ ] Status codes correct
* [ ] Auth failure returns `401 Unauthorized`
* [ ] Shared types reused
* [ ] No duplicated transport types
* [ ] No unsafe Prisma query construction
* [ ] Route structure matches project standard

---

## Non-Negotiables

These are hard rules:

* no `any`
* no mixed response formats
* no trusting raw input
* no direct unsafe dynamic query construction
* no duplicated shared types without reason
* no custom auth failure wording
* no route-specific response conventions

---

## Final Reminder

StudexHub backend is not in rebuild phase.

It is in refinement phase.

That means the focus is:

* discipline
* consistency
* alignment
* safety
* maintainable growth

Not:

* clever abstractions
* fancy patterns
* overengineering

---

## Final Rule

> If a backend route works but breaks the standard, it is not finished.
