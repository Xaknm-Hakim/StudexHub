
# Academics API

> Generated: 2026-04-18
> Last Updated: 2026-04-18
> Source: app/app/api/academics/summary

---

## Base Path

`/api/academics`

---

## GET /api/academics/summary

### Description

Returns the authenticated user's academic summary, including overall CGPA, total earned credits counted toward CGPA, and per-semester GPA statistics.

### Auth

Required

Authentication is enforced through `requireUserId()`, which reads the session cookie and throws `UNAUTHORIZED` when no valid session exists.

### Query Params

| Name | Type | Required | Description                                     |
| ---- | ---- | -------- | ----------------------------------------------- |
| None | -    | No       | This endpoint does not accept query parameters. |
Small audit note: this endpoint is actually more of a summary/reporting endpoint than a basic CRUD resource. That is fine, but it means academics.md should probably stay very small unless you add more reporting routes later.
### Request Body

```json
{}
```

### Response

```json
{
  "cgpa": 3.67,
  "totalCredits": 42,
  "semesterStats": [
    {
      "semesterId": "sem_001",
      "name": "Semester 1",
      "year": 2025,
      "gpa": 3.54,
      "credits": 18
    },
    {
      "semesterId": "sem_002",
      "name": "Semester 2",
      "year": 2026,
      "gpa": 3.79,
      "credits": 24
    }
  ]
}
```

### Response Fields

| Field                        | Type             | Description                                                                                      |
| ---------------------------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| `cgpa`                       | `number \| null` | Overall cumulative GPA across all semesters using only courses with non-null `gradePoint`.       |
| `totalCredits`               | `number`         | Total credits counted toward CGPA. Only courses with non-null `gradePoint` are included.         |
| `semesterStats`              | `array`          | Per-semester GPA summary.                                                                        |
| `semesterStats[].semesterId` | `string`         | Semester ID.                                                                                     |
| `semesterStats[].name`       | `string`         | Semester name.                                                                                   |
| `semesterStats[].year`       | `number`         | Semester year.                                                                                   |
| `semesterStats[].gpa`        | `number \| null` | Semester GPA. Returns `null` when no valid graded courses exist in that semester.                |
| `semesterStats[].credits`    | `number`         | Total semester credits counted toward GPA. Only courses with non-null `gradePoint` are included. |

### Notes

* GPA and CGPA calculations ignore courses where `gradePoint === null`.
* Semesters are returned in ascending order by `createdAt`.
* If the user has no graded courses at all, `cgpa` returns `null` and `totalCredits` returns `0`.
* If a semester has no graded courses, that semester still appears in `semesterStats`, but `gpa` is `null` and `credits` is `0`.
* ⚠️ Error handling is not explicitly implemented in this route. `requireUserId()` throws `UNAUTHORIZED`, but the route does not catch it here, so final HTTP error behavior depends on the surrounding application error handling.
* ⚠️ Response field types for IDs depend on the Prisma schema, but from usage they are treated as string-like identifiers.
