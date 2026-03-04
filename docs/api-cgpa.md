# BaruasHub Academic API Guide

*For Din — Backend usage reference*

This document explains how to use the **Academic API** endpoints implemented in BaruasHub. These endpoints allow the frontend to create courses, update course marks, and compute GPA/CGPA.

All endpoints require the user to be **authenticated** because they rely on the session cookie handled by the backend (`requireUserId()`).

---

# Base URL

When running locally:

```
http://localhost:3000
```

All endpoints start with:

```
/api
```

Example:

```
http://localhost:3000/api/semesters/:semesterId/courses
```

---

# Authentication

All API routes require the **session cookie**.

The browser automatically sends it when using `fetch()` from the frontend.

If the session is missing or invalid, the API will return:

```
401 Unauthorized
```

---

# Data Model Overview

The academic system works like this:

```
User
 └─ Semester
     └─ Course
         └─ Assignments (optional)
```

Important fields used in GPA calculation:

| Field        | Description                         |
| ------------ | ----------------------------------- |
| `credit`     | Course credit hours                 |
| `mark`       | Final mark (0–100)                  |
| `gradePoint` | Calculated from UTHM grading schema |

`gradePoint` is **computed by the backend**, not provided by the client.

---

# 1. Create Course

Creates a course under a specific semester.

### Endpoint

```
POST /api/semesters/:semesterId/courses
```

### Request Body

```json
{
  "name": "Operating Systems",
  "code": "DAT10903",
  "credit": 3,
  "mark": 81
}
```

### Fields

| Field    | Required | Description        |
| -------- | -------- | ------------------ |
| `name`   | Yes      | Course name        |
| `code`   | No       | Course code        |
| `credit` | Yes      | Credit hours       |
| `mark`   | No       | Final mark (0–100) |

If `mark` is provided, the backend will compute the grade point automatically.

### Example (Frontend)

```javascript
fetch("/api/semesters/SEMESTER_ID/courses", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "Operating Systems",
    code: "DAT10903",
    credit: 3,
    mark: 81
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
    "semesterId": "clx8xxxxx",
    "name": "Operating Systems",
    "code": "DAT10903",
    "credit": 3,
    "mark": 81,
    "gradePoint": 4
  }
}
```

---

# 2. Update Course

Updates a course's details.

### Endpoint

```
PATCH /api/courses/:courseId
```

### Request Body Example

```json
{
  "mark": 77
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
    mark: 77
  })
})
.then(r => r.json())
.then(console.log);
```

The backend will recompute the `gradePoint`.

---

# 3. Get Semester GPA

Calculates the GPA for a specific semester.

### Endpoint

```
GET /api/semesters/:semesterId/gpa
```

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

### GPA Formula

```
GPA = Σ(gradePoint × credit) / Σ(credit)
```

Only courses with a **gradePoint** are counted.

---

# 4. Get CGPA Summary

Returns overall CGPA and per-semester GPA.

### Endpoint

```
GET /api/academics/summary
```

### Example

```javascript
fetch("/api/academics/summary")
.then(r => r.json())
.then(console.log);
```

### Example Response

```json
{
  "cgpa": 3.76,
  "totalCredits": 40,
  "semesterStats": [
    {
      "semesterId": "clx8xxxxx",
      "name": "Year 1 Semester 1",
      "year": 2025,
      "gpa": 3.82,
      "credits": 20
    }
  ]
}
```

---

# Error Responses

### Unauthorized

```
401 Unauthorized
```

User session is missing or invalid.

---

### Semester Not Found

```
404 Semester not found
```

The semester does not belong to the authenticated user.

---

### Invalid Input

Example:

```
400 credit must be a positive integer
```

---

# Testing from Browser Console

Open DevTools → Console.

Example:

```javascript
fetch("/api/semesters/SEMESTER_ID/courses", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "Operating Systems",
    credit: 3,
    mark: 81
  })
}).then(r => r.json()).then(console.log);
```

The browser automatically sends the session cookie.

---

# Notes

* `gradePoint` should **never be sent by the frontend**.
* The backend always computes it from `mark`.
* Only courses with a `gradePoint` are included in GPA/CGPA calculation.

---

# Future Improvements (Planned)

These APIs may be added later:

```
POST /api/semesters
GET /api/semesters
DELETE /api/courses/:courseId
```

These will allow full semester management from the dashboard.
