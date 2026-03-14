# BaruasHub API Reference

This document maps the currently shared API endpoints in `app/api` and explains what each endpoint is for.

> Note: This reference is based only on the endpoint files provided in chat.  
> Some folders were listed but not fully shown, so those are not documented yet.

---

## Overview

Current API groups covered in this document:

- `academics`
- `assignments`
- `auth`
- `class-schedules`
- `courses`
- `internal/notifications`
- `notifications`
- `semesters`

---

# 1. Academics

## GET `/api/academics/summary`

### Purpose
Returns the user's academic overview, including:

- overall CGPA
- total counted credits
- GPA summary for each semester

### Auth
Requires logged-in user.

### Response
```json
{
  "cgpa": 3.52,
  "totalCredits": 42,
  "semesterStats": [
    {
      "semesterId": "abc123",
      "name": "Year 1 Semester 1",
      "year": 1,
      "gpa": 3.41,
      "credits": 20
    }
  ]
}
```

### Notes
Use this endpoint for:

- dashboard CGPA card
- academic summary page
- semester GPA overview list

This is the main **CGPA endpoint** in the current system.

---

# 2. Assignments

## GET `/api/assignments`

### Purpose
Fetch assignments belonging to the current user.

### Auth
Requires logged-in user.

### Supported query params

- `status=PENDING|DONE`
- `courseId=<courseId>`
- `q=<search text>`
- `sort=<field>` default: `dueDate`
- `order=asc|desc` default: `asc`

### Example
```http
GET /api/assignments?status=PENDING&sort=dueDate&order=asc
```

### Response
```json
{
  "ok": true,
  "data": [
    {
      "id": "asg1",
      "title": "Database Report",
      "dueDate": "2026-03-12T00:00:00.000Z",
      "status": "PENDING",
      "priority": "HIGH",
      "notes": null,
      "completedAt": null,
      "createdAt": "2026-03-09T02:00:00.000Z",
      "updatedAt": "2026-03-09T02:00:00.000Z",
      "courseId": "course1",
      "course": {
        "id": "course1",
        "name": "Database",
        "code": "DAT20103",
        "credit": 3
      },
      "daysLeft": 3,
      "dueStatus": "DUE_IN_X_DAYS"
    }
  ]
}
```

### Notes
The backend automatically adds:

- `daysLeft`
- `dueStatus`

Possible `dueStatus` values:

- `OVERDUE`
- `DUE_TODAY`
- `DUE_IN_X_DAYS`

---

## POST `/api/assignments`

### Purpose
Create a new assignment for the current user.

### Auth
Requires logged-in user.

### Request body
```json
{
  "title": "Database Report",
  "dueDate": "2026-03-12",
  "notes": "Finish ERD section",
  "priority": "HIGH",
  "courseId": "course1"
}
```

### Rules
- `title` is required
- `dueDate` is required
- `priority` defaults to `MEDIUM` if missing or invalid
- `courseId`, if provided, must belong to the current user

### Success response
```json
{
  "ok": true,
  "data": {
    "id": "asg1",
    "title": "Database Report",
    "dueDate": "2026-03-12T00:00:00.000Z",
    "status": "PENDING",
    "priority": "HIGH",
    "notes": "Finish ERD section",
    "courseId": "course1",
    "daysLeft": 3,
    "dueStatus": "DUE_IN_X_DAYS"
  }
}
```

---

## PATCH `/api/assignments/:id`

### Purpose
Update an assignment owned by the current user.

### Auth
Requires logged-in user.

### Updatable fields
- `title`
- `notes`
- `priority`
- `dueDate`
- `status`
- `courseId`

### Example request
```json
{
  "status": "DONE",
  "notes": "Submitted on time"
}
```

### Special behavior
If `status` becomes `"DONE"`, backend sets `completedAt = new Date()`.

If `status` becomes `"PENDING"`, backend sets `completedAt = null`.

### Success response
Returns the updated assignment with computed `daysLeft` and `dueStatus`.

---

## DELETE `/api/assignments/:id`

### Purpose
Delete an assignment owned by the current user.

### Auth
Requires logged-in user.

### Success response
```json
{
  "ok": true
}
```

---

# 3. Auth

## POST `/api/auth/login`

### Purpose
Log in using email and password, then create session cookie.

### Request body
```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

### Success response
```json
{
  "ok": true
}
```

### Notes
- sets the session cookie
- returns `401` for invalid credentials

---

## POST `/api/auth/logout`

### Purpose
Log out the current user by clearing session cookie.

### Success response
```json
{
  "ok": true
}
```

---

## GET `/api/auth/me`

### Purpose
Return the currently authenticated user's basic info.

### Response
```json
{
  "user": {
    "id": "user1",
    "email": "user@example.com",
    "name": "Hakim",
    "createdAt": "2026-03-01T00:00:00.000Z"
  }
}
```

### Notes
Returns `401` if not authenticated.

---

## POST `/api/auth/signup`

### Purpose
Create a new account using:

- email
- password
- invite code

### Request body
```json
{
  "name": "Hakim",
  "email": "user@example.com",
  "password": "your-password",
  "inviteCode": "CODEID-OTP"
}
```

### Rules
- `email`, `password`, and `inviteCode` are required
- invite code format must be `CODEID-OTP`
- invite code can expire
- invite code can be locked after too many wrong attempts
- invite code can only be used once
- email must be unique

### Success response
```json
{
  "ok": true
}
```

---

# 4. Class Schedules

## GET `/api/class-schedules`

### Purpose
Fetch all weekly class schedules for the current user.

### Auth
Requires logged-in user.

### Response
```json
[
  {
    "id": "cls1",
    "title": "Database",
    "dayOfWeek": 1,
    "day": "Monday",
    "startTime": "08:00",
    "endTime": "10:00",
    "location": "Bilik A2",
    "isActive": true,
    "createdAt": "2026-03-09T04:00:00.000Z",
    "updatedAt": "2026-03-09T04:00:00.000Z"
  }
]
```

### Notes
This returns the weekly template, not generated real dates.

---

## POST `/api/class-schedules`

### Purpose
Create a weekly class schedule for the current user.

### Auth
Requires logged-in user.

### Request body
```json
{
  "title": "Database",
  "dayOfWeek": 1,
  "startTime": "08:00",
  "endTime": "10:00",
  "location": "Bilik A2"
}
```

### Validation
- `title` is required
- `dayOfWeek` must be `1` to `5`
- `startTime` and `endTime` must be in `HH:MM`
- `endTime` must be later than `startTime`
- overlapping active classes on the same day are rejected

### Success response
Returns the created class schedule.

---

## PATCH `/api/class-schedules/:id`

### Purpose
Update a class schedule owned by the current user.

### Auth
Requires logged-in user.

### Updatable fields
- `title`
- `location`
- `dayOfWeek`
- `startTime`
- `endTime`
- `isActive`

### Notes
Uses the same validation and overlap rules as create.

---

## DELETE `/api/class-schedules/:id`

### Purpose
Delete a class schedule owned by the current user.

### Success response
```json
{
  "success": true
}
```

---

# 5. Courses

## POST `/api/courses`

### Purpose
Create a new course for the current user.

### Auth
Requires logged-in user.

### Request body
```json
{
  "name": "Database",
  "code": "DAT20103",
  "credit": 3,
  "mark": 85,
  "semesterSlot": 2
}
```

### Behavior
- validates course name
- validates `credit` as positive integer
- validates `semesterSlot`
- converts `mark` into `gradePoint`
- auto-creates the semester if it does not already exist for that user and slot

### Success response
```json
{
  "course": {
    "id": "course1",
    "name": "Database",
    "code": "DAT20103",
    "credit": 3,
    "mark": 85,
    "gradePoint": 4,
    "semester": {
      "id": "sem1",
      "slot": 2,
      "name": "Year 1 Semester 2"
    }
  }
}
```

### Important note
Currently, this route only has `POST` in the shared file.  
Even if there was discussion about a future `GET /api/courses`, that was not shown in the pasted code here.

---

## PATCH `/api/courses/:courseId`

### Purpose
Update a course owned by the current user.

### Auth
Requires logged-in user.

### Updatable fields
- `name`
- `code`
- `credit`
- `mark`
- `semesterSlot`

### Behavior
- changing `mark` recalculates `gradePoint`
- setting `mark` to `null` or `""` clears both `mark` and `gradePoint`
- changing `semesterSlot` can auto-create target semester if missing

### Success response
Returns the updated course object with semester info.

---

## DELETE `/api/courses/:courseId`

### Purpose
Delete a course owned by the current user.

### Success response
```json
{
  "success": true
}
```

---

# 6. Internal Notifications

## POST `/api/internal/notifications/run`

### Purpose
Internal cron endpoint to run notification jobs.

### Auth
Protected by request header:
- `x-internal-cron-secret`

### Runs
- assignment reminders
- class reminders
- old delivery log cleanup

### Success response
```json
{
  "ok": true,
  "assignmentInAppCreated": 4,
  "assignmentEmailsSent": 4,
  "assignmentEmailFailures": 0,
  "classSummariesCreated": 2,
  "deliveryLogsDeleted": 15
}
```

### Notes
This endpoint is for internal server/cron usage only, not frontend.

---

# 7. Notifications

## PATCH `/api/notifications/:id/read`

### Purpose
Mark one notification as read.

### Auth
Requires logged-in user.

### Success response
Returns the updated notification object.

### Errors
- `404` if notification is not found or does not belong to the user

---

## PATCH `/api/notifications/read-all`

### Purpose
Mark all unread notifications as read for the current user.

### Auth
Requires logged-in user.

### Success response
```json
{
  "updatedCount": 5
}
```

### Note
Only the mark-as-read routes were provided in chat.  
A general `GET /api/notifications` list endpoint was not shown here.

---

# 8. Semesters

## GET `/api/semesters`

### Purpose
Return the available semester options.

### Auth
Requires logged-in user.

### Response
```json
{
  "semesters": [
    {
      "slot": 0,
      "label": "Special Semester"
    }
  ]
}
```

### Notes
This is not the user's created semesters list from DB.  
It returns predefined semester options from `SEMESTER_OPTIONS`.

---

## GET `/api/semesters/:semesterId/gpa`

### Purpose
Calculate GPA for one semester.

### Auth
Requires logged-in user.

### Response
```json
{
  "semesterId": "sem1",
  "semesterName": "Year 1 Semester 2",
  "gpa": 3.67,
  "totalCredits": 18,
  "countedCourses": 6,
  "totalCourses": 7
}
```

### Notes
This is a **single-semester GPA endpoint**, not the cumulative CGPA endpoint.

---

## POST `/api/semesters/:semesterId/courses`

### Purpose
Create a new course directly under a specific semester.

### Auth
Requires logged-in user.

### Request body
```json
{
  "name": "Database",
  "code": "DAT20103",
  "credit": 3,
  "mark": 85
}
```

### Behavior
- checks that the semester belongs to the current user
- validates `name`
- validates `credit`
- if `mark` exists, converts it to `gradePoint`

### Success response
```json
{
  "course": {
    "id": "course1",
    "semesterId": "sem1",
    "name": "Database",
    "code": "DAT20103",
    "credit": 3,
    "mark": 85,
    "gradePoint": 4
  }
}
```

---

# Suggested Mental Model for Din

## Academic summary
- `GET /api/academics/summary`
  - dashboard academic overview
  - CGPA
  - semester GPA list

## Semesters
- `GET /api/semesters`
  - get semester options list
- `GET /api/semesters/:semesterId/gpa`
  - get one semester GPA

## Courses
- `POST /api/courses`
  - create course by semester slot
- `PATCH /api/courses/:courseId`
  - update course
- `DELETE /api/courses/:courseId`
  - delete course
- `POST /api/semesters/:semesterId/courses`
  - create course directly inside chosen semester

## Assignments
- `GET /api/assignments`
  - list assignments
- `POST /api/assignments`
  - create assignment
- `PATCH /api/assignments/:id`
  - update assignment
- `DELETE /api/assignments/:id`
  - delete assignment

## Class schedules
- `GET /api/class-schedules`
  - list classes
- `POST /api/class-schedules`
  - create class
- `PATCH /api/class-schedules/:id`
  - update class
- `DELETE /api/class-schedules/:id`
  - delete class

## Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/signup`

## Notifications
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`

## Internal
- `POST /api/internal/notifications/run`
  - cron only

---

# Missing or Not Yet Documented

The following were mentioned by folder listing but not fully documented from pasted files:

- other possible routes inside `notifications/route.ts`
- anything else inside `academics` besides `summary`
- anything else inside `internal` besides notifications run

If more route files are pasted later, this document should be updated.
