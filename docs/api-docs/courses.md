# Courses API

> Generated: 2026-05-10
> Last Updated: 2026-05-10
> Source: `app/app/api/courses`, `app/app/api/courses/[courseId]`

---

## Base Path

`/api/courses`

---

## GET /api/courses

### Description

Returns all courses owned by the authenticated user, including basic semester information for each course.

### Auth

Required

Authentication is enforced through `requireUserId()`.

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
  "success": true,
  "data": [
    {
      "id": "course_001",
      "name": "Database",
      "code": "DAT20103",
      "credit": 3,
      "mark": 78,
      "gradePoint": 3.88,
      "semesterId": "sem_001",
      "createdAt": "2026-04-18T09:00:00.000Z",
      "updatedAt": "2026-04-18T09:00:00.000Z",
      "semester": {
        "id": "sem_001",
        "slot": 2,
        "name": "Semester 2"
      }
    }
  ]
}
```

### Response Fields

| Field                     | Type             | Description                                      |
| ------------------------- | ---------------- | ------------------------------------------------ |
| `success`                | `boolean`        | Indicates successful request handling.           |
| `data`                   | `array`          | List of courses owned by the authenticated user. |
| `data[].id`              | `string`         | Course ID.                                       |
| `data[].name`            | `string`         | Course name.                                     |
| `data[].code`            | `string \| null` | Optional course code.                            |
| `data[].credit`          | `number`         | Course credit value.                             |
| `data[].mark`            | `number \| null` | Numeric mark if available.                       |
| `data[].gradePoint`      | `number \| null` | Grade point derived from mark if available.      |
| `data[].semesterId`      | `string`         | Related semester ID.                             |
| `data[].createdAt`       | `string`         | Creation timestamp.                              |
| `data[].updatedAt`       | `string`         | Last update timestamp.                           |
| `data[].semester`        | `object`         | Related semester summary.                        |
| `data[].semester.id`     | `string`         | Semester ID.                                     |
| `data[].semester.slot`   | `number`         | Semester slot number.                            |
| `data[].semester.name`   | `string`         | Semester name.                                   |

### Notes

* Results are filtered through the course’s semester ownership, so only the authenticated user’s courses are returned.
* Results are sorted by `createdAt` descending.
* Unauthorized requests return `{ "success": false, "error": "Unauthorized" }`.
* Unexpected failures return `{ "success": false, "error": "Failed to fetch courses" }`.

---

## POST /api/courses

### Description

Creates a new course for the authenticated user. If the requested semester slot does not yet exist for the user, a new semester record is created automatically.

### Auth

Required

Authentication is enforced through `requireUserId()`.

### Query Params

| Name | Type | Required | Description                                     |
| ---- | ---- | -------- | ----------------------------------------------- |
| None | -    | No       | This endpoint does not accept query parameters. |

### Request Body

```json
{
  "name": "Database",
  "code": "DAT20103",
  "credit": 3,
  "mark": 78,
  "semesterSlot": 2
}
```

### Request Body Fields

| Field          | Type             | Required | Description                                               |
| -------------- | ---------------- | -------- | --------------------------------------------------------- |
| `name`         | `string`         | Yes      | Course name. Trimmed before save.                         |
| `code`         | `string \| null` | No       | Optional course code. Empty-like values become `null`.    |
| `credit`       | `number`         | Yes      | Positive integer credit value.                            |
| `mark`         | `number \| null` | No       | Optional numeric mark. Used to derive grade point.        |
| `semesterSlot` | `number`         | Yes      | Semester slot number. Must be an integer from `0` to `5`. |

### Response

```json
{
  "success": true,
  "data": {
    "id": "course_001",
    "name": "Database",
    "code": "DAT20103",
    "credit": 3,
    "mark": 78,
    "gradePoint": 3.88,
    "semesterId": "sem_001",
    "createdAt": "2026-04-18T09:00:00.000Z",
    "updatedAt": "2026-04-18T09:00:00.000Z",
    "semester": {
      "id": "sem_001",
      "slot": 2,
      "name": "Semester 2"
    }
  }
}
```

### Notes

* Invalid or malformed JSON returns `400`.
* `name` is required.
* `credit` must be a positive integer.
* `semesterSlot` must be an integer from `0` to `5`.
* If `mark` is provided, it is converted to:

  * `mark = Math.floor(mark)`
  * `gradePoint = markToGradePoint(mark).point`
* If the user does not yet have a semester for the requested slot, one is created automatically using `getSemesterName(semesterSlot)`.
* The response includes related semester data.
* Success returns `201`.

### Common Error Responses

```json
{
  "success": false,
  "error": "Invalid JSON"
}
```

```json
{
  "success": false,
  "error": "name is required"
}
```

```json
{
  "success": false,
  "error": "credit must be a positive integer"
}
```

```json
{
  "success": false,
  "error": "semesterSlot must be an integer from 0 to 5"
}
```

```json
{
  "success": false,
  "error": "mark must be between 0 and 100"
}
```

---

## PATCH /api/courses/{courseId}

### Description

Updates an existing course owned by the authenticated user. The course can also be moved to another semester slot, which may create a new semester record if needed.

### Auth

Required

Authentication is enforced through `requireUserId()`.

### Params

| Name       | Type     | Description |
| ---------- | -------- | ----------- |
| `courseId` | `string` | Course ID.  |

### Request Body

```json
{
  "name": "Advanced Database",
  "code": "DAT20103",
  "credit": 4,
  "mark": 80,
  "semesterSlot": 3,
  "semesterId": "sem_002"
}
```

### Request Body Fields

| Field          | Type             | Required | Description                                                        |
| -------------- | ---------------- | -------- | ------------------------------------------------------------------ |
| `name`         | `string`         | No       | New course name. Must not be empty if provided.                    |
| `code`         | `string \| null` | No       | New course code. Empty-like values become `null`.                  |
| `credit`       | `number`         | No       | New positive integer credit value.                                 |
| `mark`         | `number \| null` | No       | New mark. `null` or empty string clears both mark and grade point. |
| `semesterSlot` | `number`         | No       | New semester slot. Must be an integer from `0` to `5`.             |
| `semesterId`   | `string`         | No       | Existing semester ID. Must belong to the authenticated user.       |

### Response

```json
{
  "success": true,
  "data": {
    "id": "course_001",
    "name": "Advanced Database",
    "code": "DAT20103",
    "credit": 4,
    "mark": 80,
    "gradePoint": 4.0,
    "semesterId": "sem_002",
    "createdAt": "2026-04-18T09:00:00.000Z",
    "updatedAt": "2026-04-18T10:00:00.000Z",
    "semester": {
      "id": "sem_002",
      "slot": 3,
      "name": "Semester 3"
    }
  }
}
```

### Notes

* The route first verifies that the course exists and belongs to the authenticated user through semester ownership.
* Invalid or malformed JSON returns `400`.
* If `mark` is provided:

  * `null` or empty string clears both `mark` and `gradePoint`
  * otherwise it is floored and mapped through the UTHM grading logic
* If `semesterSlot` is provided and does not yet exist for the user, a new semester is created automatically.
* If `semesterId` is provided, the referenced semester must belong to the authenticated user.
* Returns `404` if the course does not exist or is not owned by the authenticated user.

### Common Error Responses

```json
{
  "success": false,
  "error": "Invalid JSON"
}
```

```json
{
  "success": false,
  "error": "Course not found"
}
```

```json
{
  "success": false,
  "error": "name cannot be empty"
}
```

```json
{
  "success": false,
  "error": "credit must be a positive integer"
}
```

```json
{
  "success": false,
  "error": "semesterSlot must be an integer from 0 to 5"
}
```

```json
{
  "success": false,
  "error": "mark must be between 0 and 100"
}
```

```json
{
  "success": false,
  "error": "Invalid semesterId"
}
```

---

## DELETE /api/courses/{courseId}

### Description

Deletes an existing course owned by the authenticated user.

### Auth

Required

Authentication is enforced through `requireUserId()`.

### Params

| Name       | Type     | Description |
| ---------- | -------- | ----------- |
| `courseId` | `string` | Course ID.  |

### Request Body

```json
{}
```

### Response

```json
{
  "success": true,
  "data": null,
  "message": "Course deleted successfully"
}
```

### Notes

* The route first verifies that the course exists and belongs to the authenticated user through semester ownership.
* Returns `404` if the course does not exist or is not owned by the authenticated user.
* The success response follows the generic success wrapper with `data: null`.

### Common Error Responses

```json
{
  "success": false,
  "error": "Course not found"
}
```

```json
{
  "success": false,
  "error": "Failed to delete course"
}
```
