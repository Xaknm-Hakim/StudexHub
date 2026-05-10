# Assignments API

> Generated: 2026-05-10
> Last Updated: 2026-05-10
> Source: `app/app/api/assignments`, `app/app/api/assignments/[id]`

---

## Base Path

`/api/assignments`

---

## GET /api/assignments

### Description

Returns a list of assignments owned by the authenticated user. Supports filtering by status, course, search keyword, and sorting.

### Auth

Required

Authentication is enforced through `requireUserId()`. If the session is missing or invalid, the endpoint returns `401 Unauthorized`.

### Query Params

| Name       | Type     | Required | Description                                                                                |
| ---------- | -------- | -------- | ------------------------------------------------------------------------------------------ |
| `status`   | `string` | No       | Filters assignments by status. Intended values are `PENDING` or `DONE`.                    |
| `courseId` | `string` | No       | Filters assignments by course ID.                                                          |
| `q`        | `string` | No       | Case-insensitive keyword search on assignment title.                                       |
| `sort`     | `string` | No       | Field name used for sorting. Defaults to `dueDate`.                                        |
| `order`    | `string` | No       | Sort direction. `desc` for descending, anything else resolves to `asc`. Defaults to `asc`. |

### Request Body

```json
{}
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "assign_001",
      "title": "Database Proposal",
      "dueDate": "2026-04-25T00:00:00.000Z",
      "status": "PENDING",
      "priority": "HIGH",
      "notes": "Prepare draft and references",
      "completedAt": null,
      "createdAt": "2026-04-18T09:00:00.000Z",
      "updatedAt": "2026-04-18T09:00:00.000Z",
      "courseId": "course_001",
      "course": {
        "id": "course_001",
        "name": "Database",
        "code": "DAT20103",
        "credit": 3
      },
      "daysLeft": 7,
      "dueStatus": "DUE_IN_X_DAYS"
    }
  ]
}
```

### Response Fields

| Field                  | Type             | Description                                                 |
| ---------------------- | ---------------- | ----------------------------------------------------------- |
| `success`              | `boolean`        | Indicates successful request handling.                      |
| `data`                 | `array`          | List of assignment records owned by the authenticated user. |
| `data[].id`            | `string`         | Assignment ID.                                              |
| `data[].title`         | `string`         | Assignment title.                                           |
| `data[].dueDate`       | `string`         | Assignment due date in ISO datetime format.                 |
| `data[].status`        | `string`         | Assignment status.                                          |
| `data[].priority`      | `string`         | Assignment priority.                                        |
| `data[].notes`         | `string \| null` | Optional notes.                                             |
| `data[].completedAt`   | `string \| null` | Completion timestamp when marked as done.                   |
| `data[].createdAt`     | `string`         | Creation timestamp.                                         |
| `data[].updatedAt`     | `string`         | Last update timestamp.                                      |
| `data[].courseId`      | `string \| null` | Linked course ID, if present.                               |
| `data[].course`        | `object \| null` | Linked course summary.                                      |
| `data[].course.id`     | `string`         | Course ID.                                                  |
| `data[].course.name`   | `string`         | Course name.                                                |
| `data[].course.code`   | `string \| null` | Course code.                                                |
| `data[].course.credit` | `number`         | Course credit value.                                        |
| `data[].daysLeft`      | `number`         | Whole-day difference between today and due date.            |
| `data[].dueStatus`     | `string`         | One of `OVERDUE`, `DUE_TODAY`, or `DUE_IN_X_DAYS`.          |

### Notes

* Results are always scoped to the authenticated user.
* Search only checks the assignment `title` field.
* `daysLeft` and `dueStatus` are computed at response time and are not stored values.
* `status` must be `PENDING` or `DONE` when provided.
* `sort` is limited to `dueDate`, `createdAt`, `updatedAt`, `title`, `priority`, or `status`. Unknown sort fields fall back to `dueDate`.

### Common Error Responses

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

```json
{
  "success": false,
  "error": "Invalid status"
}
```

```json
{
  "success": false,
  "error": "Failed to fetch assignments"
}
```

---

## POST /api/assignments

### Description

Creates a new assignment for the authenticated user.

### Auth

Required

Authentication is enforced through `requireUserId()`. If the session is missing or invalid, the endpoint returns `401 Unauthorized`.

### Query Params

| Name | Type | Required | Description                                     |
| ---- | ---- | -------- | ----------------------------------------------- |
| None | -    | No       | This endpoint does not accept query parameters. |

### Request Body

```json
{
  "title": "Database Proposal",
  "dueDate": "2026-04-25T00:00:00.000Z",
  "notes": "Prepare draft and references",
  "courseId": "course_001",
  "priority": "HIGH"
}
```

### Request Body Fields

| Field      | Type             | Required | Description                                                         |
| ---------- | ---------------- | -------- | ------------------------------------------------------------------- |
| `title`    | `string`         | Yes      | Assignment title. Trimmed before save.                              |
| `dueDate`  | `string`         | Yes      | Due date in a format accepted by JavaScript `Date`.                 |
| `notes`    | `string`         | No       | Optional notes. Empty value becomes `null`.                         |
| `courseId` | `string \| null` | No       | Optional related course ID. Must belong to the authenticated user.  |
| `priority` | `string`         | No       | Assignment priority. Invalid or missing values default to `MEDIUM`. |

### Response

```json
{
  "success": true,
  "data": {
    "id": "assign_001",
    "title": "Database Proposal",
    "dueDate": "2026-04-25T00:00:00.000Z",
    "status": "PENDING",
    "priority": "HIGH",
    "notes": "Prepare draft and references",
    "completedAt": null,
    "createdAt": "2026-04-18T09:00:00.000Z",
    "updatedAt": "2026-04-18T09:00:00.000Z",
    "courseId": "course_001",
    "course": {
      "id": "course_001",
      "name": "Database",
      "code": "DAT20103",
      "credit": 3
    },
    "daysLeft": 7,
    "dueStatus": "DUE_IN_X_DAYS"
  }
}
```

### Notes

* New assignments are always created with `status: PENDING`.
* `priority` defaults to `MEDIUM` when omitted or invalid.
* `courseId` is optional, but when provided it must reference a course owned by the authenticated user through their semester relationship.
* `notes` is normalized to `null` when empty.
* `dueDate` must be a valid date string or the endpoint returns `400`.
* `title` and `dueDate` are required or the endpoint returns `400`.

### Common Error Responses

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

```json
{
  "success": false,
  "error": "title and dueDate are required"
}
```

```json
{
  "success": false,
  "error": "Invalid dueDate"
}
```

```json
{
  "success": false,
  "error": "Invalid courseId"
}
```

```json
{
  "success": false,
  "error": "Failed to create assignment"
}
```

---

## PATCH /api/assignments/{id}

### Description

Partially updates an existing assignment owned by the authenticated user.

### Auth

Required

Authentication is enforced through `requireUserId()`. If the session is missing or invalid, the endpoint returns `401 Unauthorized`.

### Params

| Name | Type     | Description    |
| ---- | -------- | -------------- |
| `id` | `string` | Assignment ID. |

### Request Body

```json
{
  "title": "Database Proposal Revised",
  "notes": "Updated after lecturer feedback",
  "priority": "MEDIUM",
  "dueDate": "2026-04-27T00:00:00.000Z",
  "status": "DONE",
  "courseId": "course_001"
}
```

### Request Body Fields

| Field      | Type             | Required | Description                                                                 |
| ---------- | ---------------- | -------- | --------------------------------------------------------------------------- |
| `title`    | `string`         | No       | New title. Trimmed before save.                                             |
| `notes`    | `string \| null` | No       | New notes value. Empty value becomes `null`.                                |
| `priority` | `string`         | No       | New priority value.                                                         |
| `dueDate`  | `string`         | No       | New due date. Must be a valid date string.                                  |
| `status`   | `string`         | No       | Must be `PENDING` or `DONE`. Also updates `completedAt`.                    |
| `courseId` | `string \| null` | No       | New related course ID. Must belong to the authenticated user when non-null. |

### Response

```json
{
  "success": true,
  "data": {
    "id": "assign_001",
    "title": "Database Proposal Revised",
    "dueDate": "2026-04-27T00:00:00.000Z",
    "status": "DONE",
    "priority": "MEDIUM",
    "notes": "Updated after lecturer feedback",
    "completedAt": "2026-04-18T10:00:00.000Z",
    "createdAt": "2026-04-18T09:00:00.000Z",
    "updatedAt": "2026-04-18T10:00:00.000Z",
    "courseId": "course_001",
    "course": {
      "id": "course_001",
      "name": "Database",
      "code": "DAT20103",
      "credit": 3
    },
    "daysLeft": 9,
    "dueStatus": "DUE_IN_X_DAYS"
  }
}
```

### Notes

* Updates are restricted to records matching both assignment ID and authenticated user ID.
* When `status` is set to `DONE`, `completedAt` is set to the current timestamp.
* When `status` is set back to `PENDING`, `completedAt` becomes `null`.
* `courseId` can be explicitly set to `null` to unlink the assignment from a course.
* `dueDate` must be a valid date string or the endpoint returns `400`.
* `priority`, when provided, must be `LOW`, `MEDIUM`, or `HIGH`.
* Returns `404` when no owned assignment matches the given ID.

### Common Error Responses

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

```json
{
  "success": false,
  "error": "title cannot be empty"
}
```

```json
{
  "success": false,
  "error": "Invalid priority"
}
```

```json
{
  "success": false,
  "error": "Invalid dueDate"
}
```

```json
{
  "success": false,
  "error": "Invalid status"
}
```

```json
{
  "success": false,
  "error": "Invalid courseId"
}
```

```json
{
  "success": false,
  "error": "Not found"
}
```

```json
{
  "success": false,
  "error": "Failed to update assignment"
}
```

---

## DELETE /api/assignments/{id}

### Description

Deletes an assignment owned by the authenticated user.

### Auth

Required

Authentication is enforced through `requireUserId()`. If the session is missing or invalid, the endpoint returns `401 Unauthorized`.

### Params

| Name | Type     | Description    |
| ---- | -------- | -------------- |
| `id` | `string` | Assignment ID. |

### Request Body

```json
{}
```

### Response

```json
{
  "success": true,
  "data": null,
  "message": "Assignment deleted successfully"
}
```

### Notes

* Deletion is restricted to records matching both assignment ID and authenticated user ID.
* Returns `404` when no owned assignment matches the given ID.

### Common Error Responses

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

```json
{
  "success": false,
  "error": "Not found"
}
```

```json
{
  "success": false,
  "error": "Failed to delete assignment"
}
```
