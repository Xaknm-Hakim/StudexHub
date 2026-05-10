# Types System Documentation — StudexHub

> Last Updated: 2026-05-10
> Status: Archived / Legacy
> Do not treat this document as the current API contract.

## 🎯 Purpose

Introduce a strict TypeScript typing system across StudexHub to eliminate unsafe patterns, enforce consistency, and ensure CI reliability.

This system ensures:

* Zero usage of `any`
* Safe handling of external input
* Consistent API contracts between backend and frontend
* Production-grade code discipline

---

## 🧠 Core Principle

**Never trust input. Always validate. Never use `any`.**

---

## 📌 Why This Was Introduced

Before this change, the codebase had:

* `any` used in request bodies and error handling
* Unsafe `req.json()` usage
* Inconsistent API structures

This caused:

* ESLint failures (`no-explicit-any`)
* Runtime risks
* Harder debugging and scaling

---

## 🚫 Rule #1 — No `any`

`any` is strictly forbidden.

### ❌ Wrong

```ts
catch (e: any)
```

### ✅ Correct

```ts
catch (error: unknown)
```

---

## 🔐 Rule #2 — Treat All Input as Unsafe

Everything from:

* `req.json()`
* query params
* headers

must be treated as `unknown`.

### ❌ Wrong

```ts
const body = await req.json();
```

### ✅ Correct

```ts
type RequestBody = {
  name?: unknown;
  credit?: unknown;
};

const body = (await req.json().catch(() => null)) as RequestBody | null;
```

---

## 🔍 Rule #3 — Always Narrow Types

Never directly access unknown values.

### ❌ Wrong

```ts
body.name.trim()
```

### ✅ Correct

```ts
const name = String(body.name ?? "").trim();
const credit = Number(body.credit);
```

---

## ⚠️ Rule #4 — Safe Error Handling

Always use `unknown` and a helper function.

```ts
import { getErrorMessage } from "@/src/lib/types/common";

catch (error: unknown) {
  const message = getErrorMessage(error);
}
```

---

## 📁 Directory Structure

```
app/src/lib/types/
├── common.ts
├── requests.ts
```

---

## 🧩 common.ts

Contains shared helpers.

### getErrorMessage

```ts
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
```

---

## 📦 requests.ts

Defines API request contracts.

### Example

```ts
export interface CreateCourseBody {
  semesterId?: string;
  semesterSlot?: number | string;
  code?: string | null;
  name: string;
  credit: number;
  mark?: number | string | null;
}
```

---

## 🏗 Backend Pattern (Standard)

All API routes must follow this structure:

### 1. Define Local Type

```ts
type RequestBody = {
  name?: unknown;
};
```

### 2. Parse Safely

```ts
const body = (await req.json().catch(() => null)) as RequestBody | null;
```

### 3. Validate

* Required fields
* Data format
* Value range

### 4. Convert

```ts
const name = String(body.name ?? "").trim();
```

### 5. Business Logic

* Prisma queries
* Ownership checks
* Calculations

### 6. Handle Errors

```ts
catch (error: unknown) {
  return NextResponse.json({ error: getErrorMessage(error) });
}
```

---

## 🧠 Key Design Decisions

### Use `unknown` Instead of `any`

* Forces validation
* Prevents unsafe access
* Required by lint

---

### Local Types Per Route

* More flexible
* Avoids over-coupling
* Easier validation

---

### Flexible Input Handling

Supports:

* `number | string`
* nullable values

---

### Centralized Error Handling

All errors go through:

* `getErrorMessage()`

---

## ⚙️ CI Impact

This system is enforced by:

* ESLint (`no-explicit-any`)
* TypeScript strict mode
* GitHub Actions CI

Without it:

* CI fails
* PRs are blocked (if protection enabled)

---

## 👥 Ownership

### Backend / Infra (You)

Responsible for:

* `app/src/lib/types/*`
* API contracts
* Ensuring zero `any`
* Schema alignment

---

### Frontend (Din)

Responsible for:

* Using API contracts
* Avoiding `any` in `.tsx`
* Matching backend expectations

---

## ❌ Common Mistakes

* Using `any` anywhere
* Trusting `req.json()` directly
* Accessing unknown values without conversion
* Using `as any` to bypass typing

---

## 🔮 Future Improvements

* Add response types (`responses.ts`)
* Introduce validation layer (e.g. Zod)
* Share types frontend ↔ backend
* Add OpenAPI/Swagger

---

## 📌 Final Rule

> If you feel like using `any`, you're doing it wrong.

Use:

* `unknown`
* Proper types
* Or define a new interface

---

End of document.
