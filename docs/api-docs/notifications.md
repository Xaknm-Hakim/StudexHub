# Notifications API Documentation — StudexHub

> Generated: 2026-05-10
> Last Updated: 2026-05-10
> Source: `app/app/api/notifications`, `app/app/api/internal/notifications/run`

---

## Purpose

Document the notification inbox API, read/delete operations, internal notification generation route, related notification types, and current implementation behavior.

---

## Core Principle

User-facing notification routes are scoped to the authenticated user. Internal notification generation is protected separately through an internal cron secret header.

---

## Base Path

`/api/notifications`

Internal generation route:

`/api/internal/notifications/run`

---

## Notification Types

Notification types are defined in `app/src/lib/types/enums.ts`, `app/src/lib/types/notification.ts`, and the Prisma `NotificationType` enum.

| Value                     | Description                                  |
| ------------------------- | -------------------------------------------- |
| `ASSIGNMENT_DUE_TOMORROW` | Assignment reminder for an assignment due tomorrow. |
| `ASSIGNMENT_DUE_TODAY`    | Assignment reminder for an assignment due today.    |
| `CLASS_TOMORROW_SUMMARY`  | Summary reminder for active classes tomorrow.       |

---

## Notification Channels

Notification channels are defined in `app/src/lib/types/enums.ts` and the Prisma `NotificationChannel` enum.

| Value    | Description                                      |
| -------- | ------------------------------------------------ |
| `IN_APP` | Notification stored in the database for the UI.  |
| `EMAIL`  | Assignment reminder email sent through Gmail.    |

---

## Notification Object

Notification records are returned directly from Prisma by the current notification routes.

```json
{
  "id": "notif_001",
  "userId": "user_001",
  "type": "ASSIGNMENT_DUE_TOMORROW",
  "title": "Assignment Due Tomorrow",
  "message": "Your assignment \"Database Proposal\" is due tomorrow.",
  "isRead": false,
  "assignmentId": "assign_001",
  "assignmentTitleSnapshot": "Database Proposal",
  "courseNameSnapshot": "Database",
  "createdAt": "2026-05-09T09:00:00.000Z"
}
```

### Notification Fields

| Field                       | Type             | Description                                      |
| --------------------------- | ---------------- | ------------------------------------------------ |
| `id`                        | `string`         | Notification ID.                                 |
| `userId`                    | `string`         | Owner user ID.                                   |
| `type`                      | `string`         | Notification type.                               |
| `title`                     | `string`         | Notification title.                              |
| `message`                   | `string`         | Notification message.                            |
| `isRead`                    | `boolean`        | Whether the notification has been marked as read. |
| `assignmentId`              | `string \| null` | Related assignment ID, when applicable.          |
| `assignmentTitleSnapshot`   | `string \| null` | Assignment title captured when notification was created. |
| `courseNameSnapshot`        | `string \| null` | Course name captured when notification was created. |
| `createdAt`                 | `string`         | Creation timestamp.                              |

### Notes

* The current Prisma notification model does not include a persisted `link` field.
* `createNotification()` accepts a `link` argument, but the current implementation does not write it to the database. Needs verification.

---

## GET /api/notifications

### Description

Returns the latest notifications for the authenticated user and an unread notification count.

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
  "notifications": [
    {
      "id": "notif_001",
      "userId": "user_001",
      "type": "ASSIGNMENT_DUE_TOMORROW",
      "title": "Assignment Due Tomorrow",
      "message": "Your assignment \"Database Proposal\" is due tomorrow.",
      "isRead": false,
      "assignmentId": "assign_001",
      "assignmentTitleSnapshot": "Database Proposal",
      "courseNameSnapshot": "Database",
      "createdAt": "2026-05-09T09:00:00.000Z"
    }
  ],
  "unreadCount": 1
}
```

### Response Fields

| Field          | Type     | Description                                      |
| -------------- | -------- | ------------------------------------------------ |
| `notifications` | `array` | Latest notification records for the authenticated user. |
| `unreadCount` | `number` | Count of unread notifications for the authenticated user. |

### Notes

* Results are scoped to the authenticated user.
* Results are ordered by `createdAt` descending.
* The route returns at most `50` notifications.
* The response is a raw object, not wrapped in `{ success: true, data: ... }`.
* Exact unauthenticated response behavior is Needs verification because `requireUserId()` is outside this document's inspected source set.

### Common Error Responses

```json
{
  "error": "Failed to fetch notifications"
}
```

---

## PATCH /api/notifications/{id}/read

### Description

Marks one notification owned by the authenticated user as read.

### Auth

Required

Authentication is enforced through `requireUserId()`.

### Params

| Name | Type     | Description      |
| ---- | -------- | ---------------- |
| `id` | `string` | Notification ID. |

### Request Body

```json
{}
```

### Response

Returns the full updated notification record.

```json
{
  "id": "notif_001",
  "userId": "user_001",
  "type": "ASSIGNMENT_DUE_TOMORROW",
  "title": "Assignment Due Tomorrow",
  "message": "Your assignment \"Database Proposal\" is due tomorrow.",
  "isRead": true,
  "assignmentId": "assign_001",
  "assignmentTitleSnapshot": "Database Proposal",
  "courseNameSnapshot": "Database",
  "createdAt": "2026-05-09T09:00:00.000Z"
}
```

### Notes

* The route first checks for a notification matching both `id` and authenticated `userId`.
* The route sets `isRead` to `true`.
* The response is the full updated notification record, not only `{ "id": "...", "isRead": true }`.
* Exact unauthenticated response behavior is Needs verification because `requireUserId()` is outside this document's inspected source set.

### Common Error Responses

```json
{
  "error": "Notification not found"
}
```

```json
{
  "error": "Failed to mark notification as read"
}
```

---

## PATCH /api/notifications/read-all

### Description

Marks all unread notifications owned by the authenticated user as read.

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
  "updatedCount": 4
}
```

### Response Fields

| Field          | Type     | Description                                      |
| -------------- | -------- | ------------------------------------------------ |
| `updatedCount` | `number` | Number of unread notifications updated to read. |

### Notes

* The update is restricted to records matching the authenticated `userId` and `isRead: false`.
* Exact unauthenticated response behavior is Needs verification because `requireUserId()` is outside this document's inspected source set.

### Common Error Responses

```json
{
  "error": "Failed to mark all notifications as read"
}
```

---

## DELETE /api/notifications/{id}

### Description

Deletes one notification owned by the authenticated user.

### Auth

Required

Authentication is enforced through `requireUserId()`.

### Params

| Name | Type     | Description      |
| ---- | -------- | ---------------- |
| `id` | `string` | Notification ID. |

### Request Body

```json
{}
```

### Response

```json
{
  "ok": true,
  "deletedId": "notif_001"
}
```

### Response Fields

| Field       | Type      | Description              |
| ----------- | --------- | ------------------------ |
| `ok`        | `boolean` | Indicates successful delete handling. |
| `deletedId` | `string`  | Deleted notification ID. |

### Notes

* The route first checks for a notification matching both `id` and authenticated `userId`.
* Exact unauthenticated response behavior is Needs verification because `requireUserId()` is outside this document's inspected source set.

### Common Error Responses

```json
{
  "error": "Notification not found"
}
```

```json
{
  "error": "Failed to delete notification"
}
```

---

## Internal Notification Run

`POST /api/internal/notifications/run` is documented canonically in [Internal API](internal.md).

This notifications document describes the reminder-generation behavior used by that internal route to avoid duplicating the route contract in two places.

---

## Reminder Generation Behavior

### Assignment Reminders

Assignment reminders are generated by `app/src/lib/notifications/assignment-reminders.ts`.

Current behavior:

* Finds assignments with `status: PENDING`.
* Includes assignments with `dueDate` from the local start of today through before the local start of the day after tomorrow.
* Creates reminders only for assignments due today or tomorrow.
* Uses `ASSIGNMENT_DUE_TODAY` or `ASSIGNMENT_DUE_TOMORROW`.
* Creates an in-app notification when no matching `IN_APP` delivery log exists for the same user, type, date, and assignment.
* Sends an email only when Gmail configuration is available and the user has an email address.
* Creates an `EMAIL` delivery log after a successful email send.
* Email failures increment `assignmentEmailFailures` and do not stop remaining assignment processing.

Assignment in-app notifications store:

* `assignmentId`
* `assignmentTitleSnapshot`
* `courseNameSnapshot`

### Class Reminders

Class reminders are generated by `app/src/lib/notifications/class-reminders.ts`.

Current behavior:

* Finds active class schedules where `dayOfWeek` matches tomorrow's JavaScript `Date.getDay()` value.
* Groups tomorrow's classes by `userId`.
* Creates one `CLASS_TOMORROW_SUMMARY` in-app notification per user.
* Skips creation when a matching `IN_APP` delivery log already exists for that user, type, date, and `assignmentId: null`.
* Builds a comma-separated summary message from class title, start time, and optional location.

### Delivery Logs

Delivery logs are handled by `app/src/lib/notifications/delivery-log.ts`.

Current behavior:

* Duplicate checks use `userId`, `type`, `channel`, `notificationDate`, and `assignmentId`.
* The Prisma schema enforces uniqueness on `userId`, `type`, `channel`, `notificationDate`, and `assignmentId`.
* Cleanup deletes delivery logs where `createdAt` is older than 2 days.

---

## Related Types

| File | Related Types |
| ---- | ------------- |
| `app/src/lib/types/notification.ts` | `Notification` |
| `app/src/lib/types/enums.ts` | `NotificationType`, `NotificationChannel` |
| `app/src/lib/types/api.ts` | `Notification`, `NotificationDeliveryLog`, `NotificationListResponse`, `NotificationSingleResponse` |
| `app/src/lib/types/db.ts` | `NotificationRecord`, `NotificationDeliveryLogRecord` |
| `app/src/lib/types/requests.ts` | `CreateNotificationBody`, `UpdateNotificationBody`, `CreateNotificationDeliveryLogBody` |

### Notes

* Current public notification routes do not use `CreateNotificationBody`, `UpdateNotificationBody`, or `CreateNotificationDeliveryLogBody`.
* Current notification route responses do not consistently use the generic `ApiResponse<T>` wrapper from `app/src/lib/types/api.ts`.

---

## Related Utilities

| File | Responsibility |
| ---- | -------------- |
| `app/src/lib/notifications/assignment-reminders.ts` | Creates assignment due today/tomorrow reminders and sends assignment reminder emails when configured. |
| `app/src/lib/notifications/class-reminders.ts` | Creates one in-app class summary notification per user for tomorrow's active classes. |
| `app/src/lib/notifications/create-notification.ts` | Creates notification records. |
| `app/src/lib/notifications/delivery-log.ts` | Checks delivery logs, creates delivery logs, and cleans old delivery logs. |
| `app/src/lib/notifications/date.ts` | Provides local date helpers used by reminder generation. |
| `app/src/lib/notifications/types.ts` | Re-exports notification enums from Prisma and defines `RunNotificationsResult`. |

---

## Differences From Legacy Documentation

* Current documentation should use StudexHub naming.
* `PATCH /api/notifications/{id}/read` currently returns the full updated notification record.
* `DELETE /api/notifications/{id}` currently returns `{ "ok": true, "deletedId": "..." }`.
* Class summary notification messages are currently comma-separated sentences.
* The current notification schema does not include a persisted `link` field.
* Frontend UI guidance and future improvement ideas from the legacy document are not part of the current API contract.

---

## Verification Items

* Exact unauthenticated response behavior for user notification routes is Needs verification.
* Whether the unused `link` argument in `createNotification()` is intentional is Needs verification.
* Whether `RunNotificationsResult` should include `assignmentEmailFailures` is Needs verification.
* Runtime timezone guarantees for local-day reminder calculations are Needs verification.
* Gmail email template content is Needs verification.
