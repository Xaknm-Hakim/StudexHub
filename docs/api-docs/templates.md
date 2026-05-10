# <Domain> API Documentation — StudexHub

> Generated: 2026-05-10
> Last Updated: 2026-05-10
> Source: VERIFY

---

## Usage Rules

Use this template when creating or updating StudexHub API documentation under `docs/api-docs`.

* Document actual implemented behavior, not planned behavior.
* Trust current source code when source and legacy docs conflict.
* Use concise technical language.
* Keep route sections consistent across API docs.
* Use `Needs verification` when behavior cannot be confirmed from inspected source.
* Remove sections that do not apply to the documented domain.
* Keep examples realistic but generic.

---

## Purpose

Describe what this API domain provides and which application behavior it supports.

Example:

Document `<Domain>` endpoints, request and response contracts, validation behavior, related shared types, and implementation notes.

---

## Core Principle

State the main rule or invariant for this API domain when applicable.

Example:

Records are scoped to the authenticated user. Routes verify ownership before reading, updating, or deleting user-owned data.

If no domain-specific principle applies, omit this section.

---

## Base Path

`/<Base Path>`

Example:

`/api/<domain>`

---

## <Shared Domain Object>

Use this section when multiple routes return the same object shape.

```json
{
  "id": "<id>",
  "name": "<value>",
  "createdAt": "<ISO datetime>",
  "updatedAt": "<ISO datetime>"
}
```

### <Shared Domain Object> Fields

| Field       | Type     | Description         |
| ----------- | -------- | ------------------- |
| `id`        | `string` | Record ID.          |
| `name`      | `string` | Display name.       |
| `createdAt` | `string` | Creation timestamp. |
| `updatedAt` | `string` | Last update timestamp. |

### Notes

* Document computed fields here if they appear in multiple route responses.
* Document raw Prisma-returned fields only if the route returns records directly.

---

## <METHOD> /api/<route>

### Description

Describe what the route does in one or two concise sentences.

Example:

Returns records owned by the authenticated user, ordered by `<field>`.

### Auth

Required

Authentication is enforced through `<auth helper or mechanism>`.

If the route does not require authentication, use:

Not required

### Params

Use this section for dynamic path params. Omit it when the route has no path params.

| Name | Type     | Description |
| ---- | -------- | ----------- |
| `id` | `string` | Record ID.  |

### Query Params

Use this section for URL query parameters.

| Name     | Type     | Required | Description |
| -------- | -------- | -------- | ----------- |
| `status` | `string` | No       | Optional status filter. |
| None     | -        | No       | This endpoint does not accept query parameters. |

### Required Headers

Use this section only when a route requires specific headers.

| Name       | Type     | Required | Description |
| ---------- | -------- | -------- | ----------- |
| `<header>` | `string` | Yes      | Header purpose. |

### Request Body

Use `{}` when the route does not read a request body.

```json
{}
```

For body-accepting routes:

```json
{
  "name": "<value>",
  "optionalField": null
}
```

### Request Body Fields

Use this section for routes with request bodies. Omit it when the request body is `{}`.

| Field           | Type             | Required | Description |
| --------------- | ---------------- | -------- | ----------- |
| `name`          | `string`         | Yes      | Required name. Trimmed before save. |
| `optionalField` | `string \| null` | No       | Optional value. Empty values become `null`. |

### Response

Document the actual implemented response shape.

```json
{
  "success": true,
  "data": {
    "id": "<id>",
    "name": "<value>"
  }
}
```

For raw array responses:

```json
[
  {
    "id": "<id>",
    "name": "<value>"
  }
]
```

### Response Fields

| Field       | Type      | Description |
| ----------- | --------- | ----------- |
| `success`   | `boolean` | Indicates successful request handling. |
| `data`      | `object`  | Response payload. |
| `data.id`   | `string`  | Record ID. |
| `data.name` | `string`  | Display name. |

### Validation Behavior

Document validation that is implemented in the route.

* `<field>` is required.
* `<field>` is trimmed before save.
* `<field>` must be one of `<allowed values>`.
* Invalid JSON returns `400`.
* Ownership is verified before mutation.
* Needs verification.

### Notes

* Results are scoped to the authenticated user.
* The response is a raw array, not wrapped in `{ success: true, data: ... }`.
* This route intentionally uses a route-specific shape such as `{ ok: true }`.
* This route does not include local `try/catch`, so unauthorized or unexpected errors rely on surrounding application error handling.
* Remove any notes that do not apply.

### Common Error Responses

```json
{
  "error": "Unauthorized"
}
```

```json
{
  "error": "<Validation error message>"
}
```

```json
{
  "error": "<Not found message>"
}
```

```json
{
  "error": "<Generic failure message>"
}
```

---

## Related Types

List shared type files and type names used by the documented API.

| File | Related Types |
| ---- | ------------- |
| `app/src/lib/types/<file>.ts` | `<TypeName>`, `<TypeName>` |

### Notes

* Mention when shared types represent intended contracts but routes do not yet enforce or return that exact shape.
* Mention when request types exist but the current route performs manual parsing.

---

## Related Utilities

List shared utilities used by the documented API.

| File | Responsibility |
| ---- | -------------- |
| `app/src/lib/<path>.ts` | Utility responsibility. |

Omit this section if the route does not use shared utilities beyond framework or Prisma setup.

---

## Prisma Behavior

Use this section only when Prisma behavior matters to the API contract.

* Queries are scoped by `<field>`.
* Records are ordered by `<field>` ascending or descending.
* Mutations verify ownership before update or delete.
* Unique constraints or indexes affect duplicate prevention.
* Related records are included through `<relation>`.

Omit this section when Prisma behavior is not relevant to documentation.

---

## Differences From Legacy Documentation

Use this section when replacing or correcting an existing legacy doc.

* `<Legacy doc>` says `<old behavior>`, but current code implements `<current behavior>`.
* `<Legacy route>` is no longer implemented. Needs verification.
* Current source returns `<shape>`, not `<legacy shape>`.

Omit this section when no legacy comparison is needed.

---

## Verification Items

List behavior that could not be confirmed from the inspected source.

* `<Behavior>` is Needs verification.
* Exact unauthenticated response behavior is Needs verification.
* Runtime environment assumptions are Needs verification.
