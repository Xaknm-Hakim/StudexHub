# Semesters API

> Generated: 2026-05-10
> Last Updated: 2026-05-10
> Source: `app/app/api/semesters`, `app/app/api/semesters/[semesterId]`

---

## Base Path

`/api/semesters`

---

## GET /api/semesters

### Description

Returns the available semester slot options used by the application.

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
  "semesters": [
    { "slot": 0, "name": "Special Semester" },
    { "slot": 1, "name": "Year 1 Semester 1" },
    { "slot": 2, "name": "Year 1 Semester 2" },
    { "slot": 3, "name": "Year 2 Semester 1" },
    { "slot": 4, "name": "Year 2 Semester 2" },
    { "slot": 5, "name": "Year 3 Semester 1" }
  ]
}
```

### Response Fields

| Field              | Type     | Description                              |
| ------------------ | -------- | ---------------------------------------- |
| `semesters`        | `array`  | List of supported semester slot options. |
| `semesters[].slot` | `number` | Semester slot number.                    |
| `semesters[].name` | `string` | Human-readable semester label.           |

### Notes

* This route returns static semester options, not the authenticated user's created semester records.
* Supported slots are `0` through `5`.
* Unauthorized and unexpected error response behavior is Needs verification because the route does not include local `try/catch`.

---

## POST /api/semesters/{semesterId}/courses

### Description

Creates a new course inside a specific semester owned by the authenticated user.

### Auth

Required

Authentication is enforced through `requireUserId()`.

### Params

| Name         | Type     | Description  |
| ------------ | -------- | ------------ |
| `semesterId` | `string` | Semester ID. |

### Request Body

```json
{
  "name": "Database",
  "code": "DAT20103",
  "credit": 3,
  "mark": 78
}
```

### Request Body Fields

| Field    | Type             | Required | Description                                            |
| -------- | ---------------- | -------- | ------------------------------------------------------ |
| `name`   | `string`         | Yes      | Course name. Trimmed before save.                      |
| `code`   | `string \| null` | No       | Optional course code. Empty-like values become `null`. |
| `credit` | `number`         | Yes      | Positive integer credit value.                         |
| `mark`   | `number \| null` | No       | Optional numeric mark. Used to derive grade point.     |

### Response

```json
{
  "success": true,
  "data": {
    "id": "course_001",
    "semesterId": "sem_001",
    "name": "Database",
    "code": "DAT20103",
    "credit": 3,
    "mark": 78,
    "gradePoint": 3.88,
    "createdAt": "2026-04-18T09:00:00.000Z",
    "updatedAt": "2026-04-18T09:00:00.000Z"
  }
}
```

### Notes

* Invalid or malformed JSON returns `400`.
* `name` is required.
* `credit` must be a positive integer.
* The route first verifies that the semester exists and belongs to the authenticated user.
* If `mark` is provided, it is converted to:

  * `mark = Math.floor(mark)`
  * `gradePoint = markToGradePoint(mark).point`
* Returns `404` if the semester does not exist or is not owned by the authenticated user.
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
  "error": "Semester not found"
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
  "error": "Unauthorized"
}
```

```json
{
  "success": false,
  "error": "Failed to create course"
}
```

---

## GET /api/semesters/{semesterId}/gpa

### Description

Returns GPA summary data for a specific semester owned by the authenticated user.

### Auth

Required

Authentication is enforced through `requireUserId()`.

### Params

| Name         | Type     | Description  |
| ------------ | -------- | ------------ |
| `semesterId` | `string` | Semester ID. |

### Request Body

```json
{}
```

### Response

```json
{
  "semesterId": "sem_001",
  "semesterName": "Semester 2",
  "gpa": 3.67,
  "totalCredits": 18,
  "countedCourses": 6,
  "totalCourses": 7
}
```

### Response Fields

| Field            | Type             | Description                                                          |
| ---------------- | ---------------- | -------------------------------------------------------------------- |
| `semesterId`     | `string`         | Semester ID.                                                         |
| `semesterName`   | `string`         | Semester name.                                                       |
| `gpa`            | `number \| null` | Semester GPA calculated from courses with non-null `gradePoint`.     |
| `totalCredits`   | `number`         | Total credits counted toward GPA.                                    |
| `countedCourses` | `number`         | Number of courses included in GPA calculation.                       |
| `totalCourses`   | `number`         | Total number of courses in the semester, including ungraded courses. |

### Notes

* The route first verifies that the semester exists and belongs to the authenticated user.
* GPA calculation only includes courses where `gradePoint !== null`.
* If no valid graded courses exist, `gpa` returns `null` and `totalCredits` returns `0`.
* Returns `404` if the semester does not exist or is not owned by the authenticated user.
* Unauthorized and unexpected error response behavior is Needs verification because the route does not include local `try/catch`.

### Common Error Responses

```json
{
  "error": "Semester not found"
}
```
