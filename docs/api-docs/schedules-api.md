# Class Schedules API

This document explains how to use the Class Schedules backend in BaruasHub.

## Purpose

The Class Schedules feature lets each user store their weekly class template.

Each class schedule belongs to the currently logged-in user and stores:

* class title
* day of week
* start time
* end time
* location
* active status

This is a **weekly recurring template**, not a list of every real calendar occurrence.

---

## Database Shape

The backend stores class schedules in the `ClassSchedule` model.

Important fields:

* `id`
* `userId`
* `title`
* `dayOfWeek`
* `startTime`
* `endTime`
* `location`
* `isActive`
* `createdAt`
* `updatedAt`

### `dayOfWeek` mapping

Use integer values:

* `1` = Monday
* `2` = Tuesday
* `3` = Wednesday
* `4` = Thursday
* `5` = Friday

Frontend should show readable names in a dropdown, but send the number to the API.

---

## Available Endpoints

### 1. Get all class schedules

**Endpoint**

```http
GET /api/class-schedules
```

**Purpose**

Returns all class schedules for the currently logged-in user.

**Example response**

```json
[
  {
    "id": "cm123abc",
    "title": "Database",
    "dayOfWeek": 1,
    "startTime": "08:00",
    "endTime": "10:00",
    "location": "Bilik A2",
    "isActive": true,
    "createdAt": "2026-03-06T04:12:00.000Z",
    "updatedAt": "2026-03-06T04:12:00.000Z",
    "day": "Monday"
  }
]
```

---

### 2. Create a class schedule

**Endpoint**

```http
POST /api/class-schedules
```

**Purpose**

Creates a new weekly class schedule for the logged-in user.

**Request body**

```json
{
  "title": "Database",
  "dayOfWeek": 1,
  "startTime": "08:00",
  "endTime": "10:00",
  "location": "Bilik A2"
}
```

**Success response**

```json
{
  "id": "cm123abc",
  "title": "Database",
  "dayOfWeek": 1,
  "startTime": "08:00",
  "endTime": "10:00",
  "location": "Bilik A2",
  "isActive": true,
  "createdAt": "2026-03-06T04:12:00.000Z",
  "updatedAt": "2026-03-06T04:12:00.000Z",
  "day": "Monday"
}
```

---

### 3. Update a class schedule

**Endpoint**

```http
PATCH /api/class-schedules/:id
```

Example:

```http
PATCH /api/class-schedules/cm123abc
```

**Purpose**

Updates an existing class schedule owned by the logged-in user.

**Request body**

You may send one field or multiple fields.

```json
{
  "title": "Advanced Database",
  "location": "Lab 3",
  "startTime": "09:00",
  "endTime": "11:00",
  "dayOfWeek": 1,
  "isActive": true
}
```

**Success response**

Returns the updated class schedule object.

---

### 4. Delete a class schedule

**Endpoint**

```http
DELETE /api/class-schedules/:id
```

Example:

```http
DELETE /api/class-schedules/cm123abc
```

**Purpose**

Deletes an existing class schedule owned by the logged-in user.

**Success response**

```json
{
  "success": true
}
```

---

## Validation Rules

The backend validates all input before saving.

### 1. Title is required

This will fail:

```json
{
  "title": ""
}
```

---

### 2. `dayOfWeek` must be Monday to Friday only

Allowed values:

* `1`
* `2`
* `3`
* `4`
* `5`

Invalid examples:

```json
{
  "dayOfWeek": 0
}
```

```json
{
  "dayOfWeek": 6
}
```

```json
{
  "dayOfWeek": "Sunday"
}
```

---

### 3. Time must use `HH:MM` 24-hour format

Valid examples:

* `08:00`
* `13:30`
* `17:45`

Invalid examples:

* `8:00`
* `8pm`
* `25:00`
* `09.30`

---

### 4. End time must be later than start time

Valid:

```json
{
  "startTime": "08:00",
  "endTime": "10:00"
}
```

Invalid:

```json
{
  "startTime": "10:00",
  "endTime": "08:00"
}
```

---

### 5. Overlapping classes are rejected

The backend checks for overlaps on the same day for the same user.

Example:

Existing class:

```json
{
  "title": "Database",
  "dayOfWeek": 1,
  "startTime": "08:00",
  "endTime": "10:00"
}
```

Trying to create this will fail:

```json
{
  "title": "Networking",
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "11:00"
}
```

Because the time range overlaps.

---

## Frontend Notes for Din

### Recommended form inputs

Use these fields in the form:

* Class name
* Day of week dropdown
* Start time
* End time
* Location

### Day dropdown example

User sees:

* Monday
* Tuesday
* Wednesday
* Thursday
* Friday

But frontend sends:

```json
{
  "dayOfWeek": 1
}
```

for Monday, and so on.

### Recommended input types

* title: text input
* dayOfWeek: select dropdown
* startTime: time input
* endTime: time input
* location: text input

---

## Example frontend fetch calls

### Create

```ts
await fetch("/api/class-schedules", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "Database",
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "10:00",
    location: "Bilik A2",
  }),
});
```

### Get all

```ts
const res = await fetch("/api/class-schedules");
const data = await res.json();
```

### Update

```ts
await fetch("/api/class-schedules/cm123abc", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    location: "Lab 3",
    startTime: "09:00",
    endTime: "11:00",
  }),
});
```

### Delete

```ts
await fetch("/api/class-schedules/cm123abc", {
  method: "DELETE",
});
```

---

## Error Handling

Frontend should handle these common error cases.

### `400 Bad Request`

Used for invalid input such as:

* missing title
* invalid `dayOfWeek`
* invalid time format
* end time earlier than start time

### `404 Not Found`

Used when the class schedule does not exist or does not belong to the user.

### `409 Conflict`

Used when the new or updated class overlaps with another existing class.

Example conflict message:

```json
{
  "error": "This class overlaps with \"Database\" (08:00 - 10:00)."
}
```

Frontend should display this clearly to the user.

---

## Current Scope

This feature currently stores only the **weekly class template**.

It does **not** yet:

* generate real upcoming dates
* sync with Google Calendar
* create reminders
* archive old semester schedules automatically

Those can be added later.

---

## Current MVP Summary

What is already done:

* Prisma model for class schedules
* create class schedule API
* get class schedules API
* update class schedule API
* delete class schedule API
* backend validation
* overlap protection
* user-based ownership filtering

What frontend should do now:

* build form
* build day dropdown
* call API endpoints
* render timetable/list UI
* show backend error messages properly
