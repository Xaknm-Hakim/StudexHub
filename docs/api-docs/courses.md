
# Courses API

> Generated: 2026-04-18
> Last Updated: 2026-04-18
> Source: app/app/api/courses

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
  "courses": [
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
| `courses`                 | `array`          | List of courses owned by the authenticated user. |
| `courses[].id`            | `string`         | Course ID.                                       |
| `courses[].name`          | `string`         | Course name.                                     |
| `courses[].code`          | `string \| null` | Optional course code.                            |
| `courses[].credit`        | `number`         | Course credit value.                             |
| `courses[].mark`          | `number \| null` | Numeric mark if available.                       |
| `courses[].gradePoint`    | `number \| null` | Grade point derived from mark if available.      |
| `courses[].semesterId`    | `string`         | Related semester ID.                             |
| `courses[].createdAt`     | `string`         | Creation timestamp.                              |
| `courses[].updatedAt`     | `string`         | Last update timestamp.                           |
| `courses[].semester`      | `object`         | Related semester summary.                        |
| `courses[].semester.id`   | `string`         | Semester ID.                                     |
| `courses[].semester.slot` | `number`         | Semester slot number.                            |
| `courses[].semester.name` | `string`         | Semester name.                                   |

### Notes

* Results are filtered through the course’s semester ownership, so only the authenticated user’s courses are returned.
* Results are sorted by `createdAt` descending.
* ⚠️ This route does not include local `try/catch`, so unauthorized or unexpected errors rely on the surrounding application error handling.

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
  "course": {
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

### Common Error Responses

```json
{
  "error": "Invalid JSON"
}
```

```json
{
  "error": "name is required"
}
```

```json
{
  "error": "credit must be a positive integer"
}
```

```json
{
  "error": "semesterSlot must be an integer from 0 to 5"
}
```

```json
{
  "error": "mark must be an integer between 0 and 100"
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
  "semesterSlot": 3
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

### Response

```json
{
  "course": {
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
* Returns `404` if the course does not exist or is not owned by the authenticated user.

### Common Error Responses

```json
{
  "error": "Invalid JSON"
}
```

```json
{
  "error": "Course not found"
}
```

```json
{
  "error": "name cannot be empty"
}
```

```json
{
  "error": "credit must be a positive integer"
}
```

```json
{
  "error": "semesterSlot must be an integer from 0 to 5"
}
```

```json
{
  "error": "mark must be an integer between 0 and 100"
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
  "success": true
}
```

### Notes

* The route first verifies that the course exists and belongs to the authenticated user through semester ownership.
* Returns `404` if the course does not exist or is not owned by the authenticated user.
* The success response uses `{ "success": true }`, not `{ "ok": true }`.

### Common Error Responses

```json
{
  "error": "Course not found"
}
```
