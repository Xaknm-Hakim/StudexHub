# Types System Documentation — StudexHub

> Generated: 2026-05-10
> Last Updated: 2026-05-10
> Source: VERIFY

---

## Purpose

Define a strict TypeScript typing system across StudexHub to reduce unsafe patterns, improve consistency, and support maintainable backend and frontend development.

This system is intended to enforce:

* zero `any`
* safer handling of external input
* clearer separation between API types and database types
* shared contracts across backend and frontend
* CI-friendly TypeScript discipline

---

## Core Principle

**Never trust input. Always validate. Never use `any`.**

---

## Why This Exists

Before this typing discipline, the codebase risked:

* unsafe request body handling
* inconsistent API structures
* weak typing around errors and external input
* lint failures from `no-explicit-any`

This typing layer helps reduce runtime mistakes and keeps the codebase easier to audit and scale.

---

## Current Types Directory

```text
app/src/lib/types/
├── api.ts
├── common.ts
├── db.ts
├── enums.ts
├── notification.ts
├── requests.ts
└── summary.ts
```

---

## File Responsibilities

### `common.ts`

Shared low-level utility helpers used across the codebase.

Current responsibility:

* safe error message extraction through `getErrorMessage(error: unknown): string`

Example:

```ts
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}
```

---

### `requests.ts`

Defines request body contracts for API operations.

Current coverage includes:

* assignments
* semesters
* courses
* class schedules
* notifications
* notification delivery logs

Examples:

* `CreateAssignmentBody`
* `UpdateAssignmentBody`
* `CreateCourseBody`
* `UpdateCourseBody`
* `CreateClassScheduleBody`

Use this file for:

* expected request payload structure
* frontend-to-backend body contracts
* route-level payload documentation support

---

### `api.ts`

Defines API-facing entity types and generic response contracts.

Current coverage includes:

* `User`
* `Semester`
* `Course`
* `Assignment`
* `InviteCode`
* `ClassSchedule`
* `Notification`
* `NotificationDeliveryLog`

It also defines generic response wrappers:

```ts
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

And typed aliases such as:

* `AssignmentListResponse`
* `AssignmentSingleResponse`
* `CourseListResponse`
* `NotificationSingleResponse`

### Important Note

⚠️ The current route handlers do **not yet consistently follow** the `ApiResponse<T>` contract.
This means `api.ts` currently represents the **intended response standard**, not the fully enforced real-world route behavior.

---

### `enums.ts`

Defines shared literal union types used across the app.

Current enums include:

* `AssignmentStatus`
* `AssignmentPriority`
* `NotificationType`
* `NotificationChannel`

This file acts as the shared enum source for request types, API types, and DB types.

---

### `notification.ts`

Defines notification-specific type(s).

Current responsibility:

* `Notification`

### Important Note

⚠️ `Notification` is currently also defined in `api.ts`.
That means this type is duplicated across the type system and should be reviewed later to avoid drift.

---

### `summary.ts`

Defines reporting and aggregate summary types.

Current coverage includes:

* `SemesterStat`
* `Summary`

This file is used for computed reporting-style responses such as CGPA and semester statistics.

---

### `db.ts`

Defines database-facing record shapes.

This file mirrors stored data more closely than `api.ts`, especially for timestamps and date fields.

Current pattern:

* database record types use `Date`
* API-facing types use `string`

Examples:

* `UserRecord`
* `CourseRecord`
* `AssignmentRecord`
* `NotificationRecord`

This separation is useful because:

* DB layer reflects actual persisted value shapes
* API layer reflects serialized transport shapes

---

## Type Layer Boundaries

### API Layer (`api.ts`)

Use for:

* response contracts
* frontend/backend shared transport types
* serialized values such as ISO date strings

### DB Layer (`db.ts`)

Use for:

* internal persistence-facing shapes
* Prisma-like record modeling
* native `Date` fields before serialization

### Request Layer (`requests.ts`)

Use for:

* request body contracts
* mutation payload definitions
* create/update input shapes

### Enum Layer (`enums.ts`)

Use for:

* shared literal value sets
* status/priority/channel/type consistency

### Reporting Layer (`summary.ts`)

Use for:

* computed response structures
* aggregate/statistical outputs

---

## Backend Rules

### Rule 1 — No `any`

`any` is forbidden.

#### Wrong

```ts
catch (e: any)
```

#### Correct

```ts
catch (error: unknown)
```

---

### Rule 2 — Treat external input as unsafe

Values from:

* `req.json()`
* query params
* headers
* cookies

must not be blindly trusted.

Preferred approach:

* parse safely
* narrow explicitly
* validate before use

---

### Rule 3 — Narrow before access

Do not access unknown values directly.

#### Wrong

```ts
body.name.trim()
```

#### Better

```ts
const name = String(body.name ?? "").trim();
```

---

### Rule 4 — Use shared error helpers

Safe error handling should go through `getErrorMessage()` when possible.

```ts
catch (error: unknown) {
  const message = getErrorMessage(error);
}
```

---

## Frontend Rules

Frontend code should:

* reuse shared request/API types where possible
* avoid `any` in component state and API calls
* align with backend request body expectations
* not assume all routes already follow `ApiResponse<T>` unless that route has been normalized

### Important Note

⚠️ Because current backend responses are still inconsistent, frontend usage of `api.ts` response wrappers must be done carefully until the route layer is standardized.

---

## Current Strengths of the Type System

* Clear separation between DB and API timestamp shapes
* Shared enum definitions
* Request body contracts already exist for multiple route groups
* Error helper established
* Summary/reporting types separated cleanly

---

## Current Weaknesses / Refinement Targets

### 1. Response contract is not fully enforced

`api.ts` defines a clean generic response model, but actual route handlers still return mixed shapes.

### 2. Duplicate `Notification` type

`Notification` exists in both:

* `api.ts`
* `notification.ts`

This should be reviewed and likely unified later.

### 3. Request types are defined, but route handlers still often do manual parsing

The type system exists, but enforcement is still partially cultural rather than fully structural.

### 4. No dedicated response type modules beyond `api.ts`

You currently have a response model direction, but not every route family has strongly enforced, route-specific response contracts yet.

---

## CI Impact

This system supports:

* ESLint `no-explicit-any`
* TypeScript strictness
* cleaner PR review
* safer refactoring

If developers bypass the system with:

* `any`
* `as any`
* unsafe direct input access

the codebase becomes harder to trust and easier to break.

---

## Ownership

### Backend / Infra

Responsible for:

* `app/src/lib/types/*`
* request and API contract discipline
* maintaining separation between transport and DB types
* preventing unsafe escape hatches

### Frontend

Responsible for:

* consuming request/API contracts correctly
* avoiding `any` in components and fetch handlers
* aligning UI state with backend payload expectations

---

## Common Mistakes to Avoid

* using `any`
* using `as any`
* trusting `req.json()` directly
* duplicating types without a clear reason
* assuming current API responses always match `ApiResponse<T>`
* mixing DB `Date` types into frontend/API layers

---

## Future Improvements

* enforce `ApiResponse<T>` across all route handlers
* add dedicated response contracts if needed
* introduce schema validation layer such as Zod
* reduce duplicated type definitions
* generate docs/contracts from schemas later
* add stronger shared frontend/backend transport typing

---

## Final Rule

> If you feel like using `any`, you are probably skipping a design decision.

Use:

* `unknown`
* shared request types
* shared API types
* explicit narrowing
* proper interfaces
