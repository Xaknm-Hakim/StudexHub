# BaruasHub Semester & Course API Update

*For Din — Updated backend usage guide for semester dropdown integration*

This document explains the **new semester-based course flow** for BaruasHub.

The frontend should now treat **semester as a fixed dropdown from 0 to 5**, instead of manually working with `semesterId`.

The backend will automatically:

* validate the selected semester slot
* find the matching semester for the logged-in user
* create the semester if it does not exist yet
* attach the course to that semester

---

# Base URL

When running locally:

```text
http://localhost:3000
```

All endpoints start with:

```text
/api
```

---

# Authentication

All endpoints require the user to be logged in.

The browser will automatically send the session cookie when using `fetch()` from the frontend.

If the session is missing or invalid, the API returns:

```text
401 Unauthorized
```

---

# Semester Dropdown Mapping

Din should use this fixed semester mapping in the frontend:

| Slot | Label             |
| ---- | ----------------- |
| 0    | Special Semester  |
| 1    | Year 1 Semester 1 |
| 2    | Year 1 Semester 2 |
| 3    | Year 2 Semester 1 |
| 4    | Year 2 Semester 2 |
| 5    | Year 3 Semester 1 |

Recommended frontend options:

```ts
export const semesterOptions = [
  { value: 0, label: "Special Semester" },
  { value: 1, label: "Year 1 Semester 1" },
  { value: 2, label: "Year 1 Semester 2" },
  { value: 3, label: "Year 2 Semester 1" },
  { value: 4, label: "Year 2 Semester 2" },
  { value: 5, label: "Year 3 Semester 1" },
];
```

The frontend should send `semesterSlot`, **not** `semesterId`.

---

# Recommended Form Fields

For course creation, the frontend should send:

* `name`
* `code` *(optional)*
* `credit`
* `mark` *(optional)*
* `semesterSlot`

Example payload:

```json
{
  "name": "Operating Systems",
  "code": "DAT10903",
  "credit": 3,
  "mark": 81,
  "semesterSlot": 1
}
```

---

# 1. Get Semester Options

Use this endpoint to load the dropdown values.

### Endpoint

```text
GET /api/semesters
```

### Example

```javascript
fetch("/api/semesters")
  .then(r => r.json())
  .then(console.log);
```

### Example Response

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

### Frontend Note

This endpoint is mainly for UI convenience. Din can also hardcode the dropdown options if preferred, since the semester slots are fixed.

---

# 2. Create Course

This is now the **main course creation endpoint**.

### Endpoint

```text
POST /api/courses
```

### Request Body

```json
{
  "name": "Operating Systems",
  "code": "DAT10903",
  "credit": 3,
  "mark": 81,
  "semesterSlot": 1
}
```

### Fields

| Field          | Required | Description         |
| -------------- | -------- | ------------------- |
| `name`         | Yes      | Course name         |
| `code`         | No       | Course code         |
| `credit`       | Yes      | Credit hours        |
| `mark`         | No       | Final mark (0–100)  |
| `semesterSlot` | Yes      | Integer from 0 to 5 |

### What the backend does

When this request is sent, the backend will:

1. validate the input
2. validate `semesterSlot`
3. find the semester record for the user and slot
4. create the semester automatically if it does not exist yet
5. create the course under that semester
6. compute `gradePoint` automatically from `mark`

### Example

```javascript
fetch("/api/courses", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "Operating Systems",
    code: "DAT10903",
    credit: 3,
    mark: 81,
    semesterSlot: 1
  })
})
.then(r => r.json())
.then(console.log);
```

### Example Response

```json
{
  "course": {
    "id": "clx9xxxxx",
    "name": "Operating Systems",
    "code": "DAT10903",
    "credit": 3,
    "mark": 81,
    "gradePoint": 4,
    "semester": {
      "id": "clx8xxxxx",
      "slot": 1,
      "name": "Year 1 Semester 1"
    }
  }
}
```

---

# 3. Update Course

Use this endpoint to update course information.

### Endpoint

```text
PATCH /api/courses/:courseId
```

### Updatable Fields

* `name`
* `code`
* `credit`
* `mark`
* `semesterSlot`

### Example Request Body

```json
{
  "mark": 77,
  "semesterSlot": 2
}
```

### Example

```javascript
fetch("/api/courses/COURSE_ID", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    mark: 77,
    semesterSlot: 2
  })
})
.then(r => r.json())
.then(console.log);
```

### Notes

* If `semesterSlot` is changed, the backend will move the course to the matching semester.
* If that semester does not exist yet for the user, the backend will create it automatically.
* If `mark` is updated, the backend will recompute `gradePoint`.
* If `mark` is set to `null` or empty string, both `mark` and `gradePoint` will be cleared.

---

# 4. Delete Course

Deletes a course by ID.

### Endpoint

```text
DELETE /api/courses/:courseId
```

### Example

```javascript
fetch("/api/courses/COURSE_ID", {
  method: "DELETE"
})
.then(r => r.json())
.then(console.log);
```

### Example Response

```json
{
  "success": true
}
```

---

# 5. Existing Legacy Create Route

This older route still exists:

```text
POST /api/semesters/:semesterId/courses
```

But Din should **not** use this for the new UI flow.

Reason:

* the new UI works with `semesterSlot`
* the frontend should not need to manually manage `semesterId`
* `POST /api/courses` is now the cleaner endpoint for the dropdown-based form

So for new frontend work, use:

```text
POST /api/courses
```

---

# 6. Existing Semester GPA Route

This route still works:

```text
GET /api/semesters/:semesterId/gpa
```

It calculates GPA for one specific semester record.

### Example

```javascript
fetch("/api/semesters/SEMESTER_ID/gpa")
  .then(r => r.json())
  .then(console.log);
```

### Example Response

```json
{
  "semesterId": "clx8xxxxx",
  "semesterName": "Year 1 Semester 1",
  "gpa": 3.82,
  "totalCredits": 20,
  "countedCourses": 6,
  "totalCourses": 6
}
```

### Important Note

This route still needs a real `semesterId`, so it is more useful after fetching course or semester data from the backend.

---

# Validation Rules

### `semesterSlot`

Must be an integer from:

```text
0 to 5
```

### `credit`

Must be:

```text
positive integer
```

### `mark`

If provided, it must be:

```text
0 to 100
```

The backend computes `gradePoint` automatically.

The frontend must **never** send `gradePoint` manually.

---

# Common Error Responses

### Invalid JSON

```json
{ "error": "Invalid JSON" }
```

### Invalid Semester Slot

```json
{ "error": "semesterSlot must be an integer from 0 to 5" }
```

### Invalid Credit

```json
{ "error": "credit must be a positive integer" }
```

### Course Not Found

```json
{ "error": "Course not found" }
```

### Semester Not Found

```json
{ "error": "Semester not found" }
```

### Unauthorized

```text
401 Unauthorized
```

---

# Testing from Browser Console

## Get semester options

```javascript
fetch("/api/semesters")
  .then(r => r.json())
  .then(console.log);
```

## Create course

```javascript
fetch("/api/courses", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "Operating Systems",
    code: "DAT10903",
    credit: 3,
    mark: 81,
    semesterSlot: 1
  })
})
.then(r => r.json())
.then(console.log);
```

## Update course

```javascript
fetch("/api/courses/COURSE_ID", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    mark: 77,
    semesterSlot: 2
  })
})
.then(r => r.json())
.then(console.log);
```

## Delete course

```javascript
fetch("/api/courses/COURSE_ID", {
  method: "DELETE"
})
.then(r => r.json())
.then(console.log);
```

---

# Final Frontend Guidance for Din

For the new academic form, the frontend should be built around this flow:

1. user fills in course name
2. user fills in optional course code
3. user fills in credit
4. user fills in optional mark
5. user chooses semester from dropdown `0..5`
6. frontend sends request to:

```text
POST /api/courses
```

with `semesterSlot`

That is the correct new flow.

Do **not** build the form around `semesterId` anymore.

---

# Summary

### Use these endpoints for the new UI

```text
GET    /api/semesters
POST   /api/courses
PATCH  /api/courses/:courseId
DELETE /api/courses/:courseId
```

### Legacy route that still exists

```text
POST /api/semesters/:semesterId/courses
```

### Main rule

Frontend sends:

```text
semesterSlot
```

Backend handles:

* semester lookup
* semester creation
* course linking
* grade point calculation
