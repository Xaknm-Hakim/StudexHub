# StudexCenter API Documentation

This document explains the backend API used in StudexCenter so frontend development can be implemented easily.

All APIs are intended for internal usage between the frontend and backend of the project.

---

# Base URL

Local development:

http://localhost:3000/api

Most frontend calls can simply use:

fetch("/api/semesters")

---

# Authentication

StudexCenter uses a **custom cookie-based session system**.

When a user logs in:
- the server sets a session cookie
- protected API routes check the session

Most protected routes call:

requireUserId()

If the user is not authenticated, the API returns:

401 Unauthorized

Frontend implication:

- protected pages should assume the user must already be logged in
- if a request returns `401`, redirect the user to login

Example fetch:

fetch("/api/assignments", {
  credentials: "include"
})

---

# Common Response Pattern

Most endpoints return JSON.

## Success

Example:

{
  "id": "abc123",
  "name": "Year 1 Semester 1"
}

## Client Error

Example:

{
  "error": "Semester name is required"
}

Usually paired with:

400 Bad Request  
401 Unauthorized  
404 Not Found  

## Server Error

Example:

{
  "error": "Internal server error"
}

Usually paired with:

500 Internal Server Error

---

# API Overview

Current API groups:

1. Semesters
2. Semester GPA
3. CGPA
4. Assignments
5. Class Schedules

---

# Semesters API

The semesters API manages academic semester records.

Each semester acts as a container for courses, grades, and GPA.

---

## GET /api/semesters

### Purpose

Fetch all semesters belonging to the logged-in user.

### When frontend should call it

- when the academic page loads
- when showing semester dropdown
- after creating a new semester

### Example request

GET /api/semesters

### Example response

[
  {
    "id": "sem_001",
    "name": "Year 1 Semester 1",
    "createdAt": "2026-02-20T10:00:00Z"
  },
  {
    "id": "sem_002",
    "name": "Year 1 Semester 2",
    "createdAt": "2026-02-25T10:00:00Z"
  }
]

### Frontend usage

Din can use this to:

- build semester list
- populate dropdown selector
- display academic overview

### Possible errors

401 Unauthorized  
User is not logged in.

500 Internal Server Error  
Database failure.

---

## POST /api/semesters

### Purpose

Create a new semester.

### When frontend should call it

After the user submits a create semester form.

### Request body

{
  "name": "Year 1 Semester 1"
}

### Example request

POST /api/semesters

{
  "name": "Year 1 Semester 1"
}

### Example response

{
  "id": "sem_001",
  "name": "Year 1 Semester 1",
  "createdAt": "2026-03-01T12:00:00Z"
}

### Frontend usage

After success:

- close modal/form
- refresh semester list
- optionally auto-select new semester

### Possible errors

400 Bad Request  
Missing semester name.

401 Unauthorized  
User not logged in.

500 Internal Server Error

---

# Semester GPA API

This API calculates GPA for one specific semester.

Important distinction:

GPA = result for one semester  
CGPA = cumulative result across all semesters

---

## GET /api/semesters/:semesterId/gpa

### Purpose

Calculate GPA for a single semester.

### When frontend should call it

- when a semester detail page loads
- when a semester is selected
- after updating grades

### Example request

GET /api/semesters/sem_001/gpa

### Example response

{
  "semesterId": "sem_001",
  "gpa": 3.67,
  "totalCredits": 18
}

### Field explanation

semesterId → the semester being calculated  
gpa → GPA for that semester  
totalCredits → total credits counted

### Frontend usage

Din can use this to:

- display semester GPA
- show academic summary
- update semester cards

### Possible errors

400 Bad Request

401 Unauthorized

404 Not Found  
Semester does not exist.

500 Internal Server Error

---

# CGPA API

This API calculates the overall CGPA across all semesters.

Unlike semester GPA, CGPA is a global academic summary.

---

## GET /api/cgpa

### Purpose

Calculate cumulative GPA across all semesters.

### When frontend should call it

- when the academic dashboard loads
- when showing overall CGPA
- after grades are updated

### Example request

GET /api/cgpa

### Example response

{
  "cgpa": 3.52,
  "totalCredits": 54,
  "totalPoints": 190.08
}

### Field explanation

cgpa → cumulative GPA  
totalCredits → credits across all semesters  
totalPoints → total grade points

### Frontend usage

Din can use this to:

- show CGPA card on dashboard
- display academic summary
- compare semester GPA vs CGPA

### Possible errors

401 Unauthorized

500 Internal Server Error

---

# Assignments API

The assignments API manages academic task tracking.

It powers:

- assignment list
- due tracking
- overdue detection
- completion status

The backend returns computed fields such as:

daysLeft  
dueStatus

This reduces frontend calculation.

---

# Assignment Object

Example assignment object:

{
  "id": "asg_001",
  "title": "Operating Systems Report",
  "dueDate": "2026-03-10",
  "status": "PENDING",
  "priority": "HIGH",
  "notes": "Prepare slides",
  "daysLeft": 3,
  "dueStatus": "DUE_IN_X_DAYS",
  "course": {
    "id": "course_001",
    "name": "Operating Systems",
    "code": "DAT10903",
    "credit": 3
  }
}

### Status values

PENDING  
DONE

### Priority values

LOW  
MEDIUM  
HIGH

### Due status values

OVERDUE  
DUE_TODAY  
DUE_IN_X_DAYS

---

## GET /api/assignments

### Purpose

Fetch all assignments.

### When frontend should call it

- when assignments page loads
- after create/update/delete
- when refreshing assignments

### Example request

GET /api/assignments

### Example response

[
  {
    "id": "asg_001",
    "title": "Operating Systems Report",
    "dueDate": "2026-03-10",
    "status": "PENDING",
    "priority": "HIGH",
    "notes": "Prepare slides",
    "daysLeft": 3,
    "dueStatus": "DUE_IN_X_DAYS"
  }
]

### Frontend usage

Din can use this to:

- render assignment table
- highlight overdue tasks
- sort by due date
- filter pending vs completed

### Possible errors

401 Unauthorized

500 Internal Server Error

---

## POST /api/assignments

### Purpose

Create a new assignment.

### When frontend should call it

After submitting the add assignment form.

### Request body

{
  "title": "Operating Systems Report",
  "dueDate": "2026-03-15",
  "priority": "HIGH",
  "courseId": "course_001",
  "notes": "Prepare slides"
}

### Example response

{
  "id": "asg_002",
  "title": "Operating Systems Report",
  "status": "PENDING"
}

### Possible errors

400 Bad Request  
Missing title or invalid due date.

401 Unauthorized

404 Not Found  
Course does not exist.

500 Internal Server Error

---

## PATCH /api/assignments/:assignmentId

### Purpose

Update an assignment.

Useful for:

- mark as done
- edit title
- edit due date
- change priority
- edit notes

### Example request

PATCH /api/assignments/asg_001

{
  "status": "DONE"
}

### Example response

{
  "id": "asg_001",
  "status": "DONE"
}

### Possible errors

400 Bad Request

401 Unauthorized

404 Not Found

500 Internal Server Error

---

## DELETE /api/assignments/:assignmentId

### Purpose

Delete an assignment.

### Example request

DELETE /api/assignments/asg_001

### Example response

{
  "message": "Assignment deleted successfully"
}

### Possible errors

401 Unauthorized

404 Not Found

500 Internal Server Error

---

# Class Schedules API

The class schedules API manages student timetable data.

It allows storing weekly class schedules.

---

# Class Schedule Object

Example:

{
  "id": "sched_001",
  "day": "MONDAY",
  "startTime": "08:00",
  "endTime": "10:00",
  "location": "Makmal 3",
  "course": {
    "id": "course_001",
    "name": "Operating Systems",
    "code": "DAT10903"
  }
}

---

## GET /api/class-schedules

### Purpose

Fetch all schedules.

### When frontend should call it

- when timetable page loads
- when dashboard needs schedule data

### Example request

GET /api/class-schedules

### Example response

[
  {
    "id": "sched_001",
    "day": "MONDAY",
    "startTime": "08:00",
    "endTime": "10:00",
    "location": "Makmal 3"
  }
]

### Possible errors

401 Unauthorized

500 Internal Server Error

---

## POST /api/class-schedules

### Purpose

Create a class schedule.

### Request body

{
  "courseId": "course_001",
  "day": "MONDAY",
  "startTime": "08:00",
  "endTime": "10:00",
  "location": "Makmal 3"
}

### Validation rules

startTime must be earlier than endTime  
time format must be valid

Validation handled in:

src/lib/class-schedule.ts

### Example response

{
  "id": "sched_002",
  "day": "MONDAY",
  "startTime": "08:00",
  "endTime": "10:00",
  "location": "Makmal 3"
}

### Possible errors

400 Bad Request  
Invalid time range.

401 Unauthorized

404 Not Found  
Course does not exist.

500 Internal Server Error

---

# Backend Helper Files

Important backend modules:

src/lib/prisma.ts  
Database connection.

src/lib/auth.ts  
Authentication helpers.

src/lib/cookies.ts  
Session cookie management.

src/lib/class-schedule.ts  
Schedule validation and formatting.

src/lib/grading/  
GPA and CGPA calculation logic.

---

# Suggested Future APIs

Possible future additions:

GET /api/dashboard/summary  
Return dashboard statistics.

PATCH /api/class-schedules/:scheduleId  
Edit timetable entry.

DELETE /api/class-schedules/:scheduleId  
Remove schedule.

Course API  
Create and manage courses.

---

# Final Notes

This API structure supports:

- academic semester management
- GPA calculation
- CGPA summary
- assignment tracking
- class timetable management

The backend also provides computed fields such as `daysLeft` and `dueStatus`, which simplifies frontend implementation.
