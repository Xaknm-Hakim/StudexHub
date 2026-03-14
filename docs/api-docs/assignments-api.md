# BaruasHub – Assignments API Documentation

All endpoints require the user to be logged in.  
Authentication is handled via HTTP-only cookie: `bh_session`.

Base path:
```
/api/assignments
```

---

# 1) List Assignments

## GET /api/assignments

### Optional Query Parameters

- `status`: `PENDING` | `DONE`
- `courseId`: string
- `q`: search title (contains, case-insensitive)
- `sort`: `dueDate` | `createdAt` | `updatedAt` (default: `dueDate`)
- `order`: `asc` | `desc` (default: `asc`)

### Example

```js
const res = await fetch("/api/assignments?status=PENDING&sort=dueDate&order=asc");
const json = await res.json();
console.log(json.data);
```

---

# 2) Create Assignment

## POST /api/assignments

### Request Body

```json
{
  "title": "DAT20103 Assignment 2",
  "dueDate": "2026-03-06T00:00:00.000Z",
  "priority": "HIGH",
  "notes": "optional",
  "courseId": "optional"
}
```

### Fields

- `title` (required)
- `dueDate` (required, ISO string recommended)
- `priority` (optional: `LOW` | `MEDIUM` | `HIGH`, default: `MEDIUM`)
- `notes` (optional)
- `courseId` (optional; must belong to current user)

### Example

```js
await fetch("/api/assignments", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Test Assignment",
    dueDate: new Date().toISOString(),
    priority: "MEDIUM"
  }),
});
```

Success: `201`

---

# 3) Update Assignment

## PATCH /api/assignments/:id

`:id` = assignment ID (NOT user ID)

### Request Body (any subset allowed)

```json
{
  "title": "Updated title",
  "dueDate": "2026-03-10T00:00:00.000Z",
  "status": "DONE",
  "priority": "LOW",
  "notes": null,
  "courseId": null
}
```

### Notes

- `status: DONE` → automatically sets `completedAt`
- `status: PENDING` → clears `completedAt`
- User ownership is enforced

### Example

```js
await fetch(`/api/assignments/${id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ status: "DONE" }),
});
```

Success: `200`

---

# 4) Delete Assignment

## DELETE /api/assignments/:id

### Example

```js
await fetch(`/api/assignments/${id}`, {
  method: "DELETE"
});
```

Success: `200`

---

# Response Object Structure

Each assignment object includes:

```json
{
  "id": "string",
  "title": "string",
  "dueDate": "ISO string",
  "status": "PENDING | DONE",
  "priority": "LOW | MEDIUM | HIGH",
  "notes": "string | null",
  "completedAt": "ISO string | null",
  "createdAt": "ISO string",
  "updatedAt": "ISO string",
  "courseId": "string | null",
  "course": {
    "id": "string",
    "name": "string",
    "code": "string | null",
    "credit": "number"
  } | null,
  "daysLeft": "number",
  "dueStatus": "OVERDUE | DUE_TODAY | DUE_IN_X_DAYS"
}
```

---

# Error Codes

- `401` → Not authenticated
- `400` → Invalid input
- `404` → Not found or not owned by user
- `500` → Server error

---

# Important

- Always call `/api/assignments`
- Never call `/app/api/...`
- `:id` refers to the assignment ID
- Must be logged in before using these endpoints
