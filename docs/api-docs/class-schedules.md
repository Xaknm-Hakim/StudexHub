
# Class Schedules API

> Generated: 2026-04-18
> Last Updated: 2026-04-18
> Source: app/app/api/class-schedules

---

## Base Path

`/api/class-schedules`

---

## GET /api/class-schedules

### Description

Returns all class schedules owned by the authenticated user, ordered by weekday and start time.

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
[
  {
    "id": "sched_001",
    "title": "Database Lecture",
    "dayOfWeek": 1,
    "startTime": "08:00",
    "endTime": "10:00",
    "location": "Room A1",
    "isActive": true,
    "createdAt": "2026-04-18T09:00:00.000Z",
    "updatedAt": "2026-04-18T09:00:00.000Z",
    "day": "Monday"
  }
]
```

### Response Fields

| Field       | Type             | Description                                  |
| ----------- | ---------------- | -------------------------------------------- |
| `id`        | `string`         | Class schedule ID.                           |
| `title`     | `string`         | Class title.                                 |
| `dayOfWeek` | `number`         | Weekday number. Valid values are `1` to `5`. |
| `startTime` | `string`         | Start time in `HH:MM` format.                |
| `endTime`   | `string`         | End time in `HH:MM` format.                  |
| `location`  | `string \| null` | Optional class location.                     |
| `isActive`  | `boolean`        | Whether the schedule is active.              |
| `createdAt` | `string`         | Creation timestamp.                          |
| `updatedAt` | `string`         | Last update timestamp.                       |
| `day`       | `string`         | Derived weekday label from `dayOfWeek`.      |

### Notes

* Results are sorted by `dayOfWeek` ascending, then `startTime` ascending.
* The response is a raw array, not wrapped in `{ ok: true, data: ... }`.
* The `day` field is derived at response time using the weekday map:

  * `1` = Monday
  * `2` = Tuesday
  * `3` = Wednesday
  * `4` = Thursday
  * `5` = Friday
* ⚠️ This route does not include local `try/catch`, so unauthorized or unexpected errors rely on the surrounding application error handling.

---

## POST /api/class-schedules

### Description

Creates a new class schedule for the authenticated user.

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
  "title": "Database Lecture",
  "dayOfWeek": 1,
  "startTime": "08:00",
  "endTime": "10:00",
  "location": "Room A1"
}
```

### Request Body Fields

| Field       | Type             | Required | Description                                                 |
| ----------- | ---------------- | -------- | ----------------------------------------------------------- |
| `title`     | `string`         | Yes      | Class title. Trimmed before save.                           |
| `dayOfWeek` | `number`         | Yes      | Weekday number. Must be between `1` and `5`.                |
| `startTime` | `string`         | Yes      | Start time in `HH:MM` format.                               |
| `endTime`   | `string`         | Yes      | End time in `HH:MM` format. Must be later than `startTime`. |
| `location`  | `string \| null` | No       | Optional location. Empty values become `null`.              |

### Response

```json
{
  "id": "sched_001",
  "title": "Database Lecture",
  "dayOfWeek": 1,
  "startTime": "08:00",
  "endTime": "10:00",
  "location": "Room A1",
  "isActive": true,
  "createdAt": "2026-04-18T09:00:00.000Z",
  "updatedAt": "2026-04-18T09:00:00.000Z",
  "day": "Monday"
}
```

### Notes

* `title` is required.
* `dayOfWeek` must be an integer from `1` to `5`.
* `startTime` and `endTime` must match the `HH:MM` 24-hour format.
* `endTime` must be later than `startTime`.
* Overlap checking is performed only against existing schedules for:

  * the same authenticated user
  * the same `dayOfWeek`
  * `isActive: true`
* If an overlap is found, the route returns `409 Conflict` with the conflicting class title and time range.
* Newly created schedules are formatted through `formatClassSchedule()` before returning.

### Common Error Responses

```json
{
  "error": "Title is required."
}
```

```json
{
  "error": "Invalid dayOfWeek. Must be between 1 and 5."
}
```

```json
{
  "error": "Invalid time format. Use \"HH:MM\"."
}
```

```json
{
  "error": "End time must be later than start time."
}
```

```json
{
  "error": "This class overlaps with \"Database Lecture\" (08:00 - 10:00)."
}
```

---

## PATCH /api/class-schedules/{id}

### Description

Updates an existing class schedule owned by the authenticated user.

### Auth

Required

Authentication is enforced through `requireUserId()`.

### Params

| Name | Type     | Description        |
| ---- | -------- | ------------------ |
| `id` | `string` | Class schedule ID. |

### Request Body

```json
{
  "title": "Database Tutorial",
  "dayOfWeek": 1,
  "startTime": "10:00",
  "endTime": "11:00",
  "location": "Lab 2",
  "isActive": true
}
```

### Request Body Fields

| Field       | Type             | Required | Description                                                     |
| ----------- | ---------------- | -------- | --------------------------------------------------------------- |
| `title`     | `string`         | No       | New title. If omitted, existing value is kept.                  |
| `dayOfWeek` | `number`         | No       | New weekday number. Must be between `1` and `5`.                |
| `startTime` | `string`         | No       | New start time in `HH:MM` format.                               |
| `endTime`   | `string`         | No       | New end time in `HH:MM` format. Must be later than `startTime`. |
| `location`  | `string \| null` | No       | New location. Empty values become `null`.                       |
| `isActive`  | `boolean`        | No       | Whether the schedule remains active.                            |

### Response

```json
{
  "id": "sched_001",
  "title": "Database Tutorial",
  "dayOfWeek": 1,
  "startTime": "10:00",
  "endTime": "11:00",
  "location": "Lab 2",
  "isActive": true,
  "createdAt": "2026-04-18T09:00:00.000Z",
  "updatedAt": "2026-04-18T10:00:00.000Z",
  "day": "Monday"
}
```

### Notes

* The route first checks whether the schedule exists and belongs to the authenticated user.
* Missing fields fall back to existing stored values.
* Validation rules are the same as `POST`.
* Overlap checking excludes the current schedule ID and only checks against other active schedules for the same user and same day.
* Returns `404` if the schedule does not exist or does not belong to the authenticated user.

### Common Error Responses

```json
{
  "error": "Class schedule not found."
}
```

```json
{
  "error": "Title is required."
}
```

```json
{
  "error": "Invalid dayOfWeek. Must be between 1 and 5."
}
```

```json
{
  "error": "Invalid time format. Use \"HH:MM\"."
}
```

```json
{
  "error": "End time must be later than start time."
}
```

```json
{
  "error": "This class overlaps with \"Database Lecture\" (08:00 - 10:00)."
}
```

---

## DELETE /api/class-schedules/{id}

### Description

Deletes an existing class schedule owned by the authenticated user.

### Auth

Required

Authentication is enforced through `requireUserId()`.

### Params

| Name | Type     | Description        |
| ---- | -------- | ------------------ |
| `id` | `string` | Class schedule ID. |

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

* The route first checks whether the schedule exists and belongs to the authenticated user.
* Returns `404` if the schedule does not exist or does not belong to the authenticated user.
* The success response uses `{ "success": true }`, not `{ "ok": true }`.

### Common Error Responses

```json
{
  "error": "Class schedule not found."
}
```
