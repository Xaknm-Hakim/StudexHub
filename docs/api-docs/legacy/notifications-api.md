Ah, that happened because the message likely **exceeded the response size**, so the markdown got cut off. Let’s do it properly.

Below is the **complete `notification-api.md`** in one clean block so you can **copy-paste directly into `docs/notification-api.md`**.

---

```md
# Notification API Documentation

This document explains how the **BaruasHub notification system APIs** work.

It is intended for **Din (frontend)** to integrate notifications into the UI.

The document covers:
- notification types
- API endpoints
- request / response formats
- frontend usage
- important backend behaviors

---

# Overview

BaruasHub notifications currently support **two reminder categories**.

## 1. Assignment reminders

Triggered when an assignment is:

- due **tomorrow**
- due **today**

Channels used:
- **In-app notification**
- **Email notification (Gmail API)**

---

## 2. Class reminders

Triggered when the user has classes **tomorrow**.

Channel used:

- **In-app notification only**

Important behavior:

All tomorrow classes are bundled into **one summary notification**.

Example message:

```

You have 3 classes tomorrow:
Database at 8:00 AM
English at 11:00 AM
Web Development at 2:00 PM

````

---

# Notification Types

Backend enum:

```ts
enum NotificationType {
  ASSIGNMENT_DUE_TOMORROW
  ASSIGNMENT_DUE_TODAY
  CLASS_TOMORROW_SUMMARY
}
````

Meaning:

## ASSIGNMENT_DUE_TOMORROW

User has an assignment due tomorrow.

## ASSIGNMENT_DUE_TODAY

User has an assignment due today.

## CLASS_TOMORROW_SUMMARY

User has one or more classes tomorrow.

---

# Notification Channels

Backend enum:

```ts
enum NotificationChannel {
  IN_APP
  EMAIL
}
```

Meaning:

## IN_APP

Stored in database and shown inside the website.

## EMAIL

Sent through Gmail API.

---

# Database Tables

## Notification

Stores notifications visible to users.

Important fields:

| Field                   | Description           |
| ----------------------- | --------------------- |
| id                      | notification id       |
| userId                  | owner of notification |
| type                    | notification type     |
| title                   | title text            |
| message                 | message text          |
| isRead                  | read status           |
| assignmentId            | related assignment    |
| assignmentTitleSnapshot | stored title          |
| courseNameSnapshot      | stored course name    |
| createdAt               | timestamp             |

---

## NotificationDeliveryLog

Used to prevent duplicate notifications.

Important fields:

| Field            | Description          |
| ---------------- | -------------------- |
| userId           | target user          |
| type             | notification type    |
| channel          | IN_APP or EMAIL      |
| notificationDate | reminder date        |
| assignmentId     | assignment reference |

Delivery logs are automatically **cleaned after 2 days**.

---

# Notification APIs

Frontend uses these APIs:

```
GET    /api/notifications
PATCH  /api/notifications/[id]/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/[id]
```

Backend cron uses:

```
POST /api/internal/notifications/run
```

---

# GET /api/notifications

## Purpose

Fetch notifications for the **current logged-in user**.

Used for:

* notification dropdown
* notification page
* unread badge count

---

## Request

```
GET /api/notifications
```

No request body.

---

## Response Example

```json
{
  "notifications": [
    {
      "id": "abc123",
      "userId": "user1",
      "type": "ASSIGNMENT_DUE_TOMORROW",
      "title": "Assignment Due Tomorrow",
      "message": "Your assignment \"Database Report\" is due tomorrow.",
      "isRead": false,
      "assignmentId": "assign123",
      "assignmentTitleSnapshot": "Database Report",
      "courseNameSnapshot": "Database Systems",
      "createdAt": "2026-03-06T00:00:00.000Z"
    }
  ],
  "unreadCount": 1
}
```

---

## Fields

### notifications

Array of notification objects.

### unreadCount

Number of unread notifications.

Useful for the **notification bell badge**.

---

# PATCH /api/notifications/[id]/read

## Purpose

Mark a **single notification** as read.

Use when:

* user clicks a notification
* user opens notification detail

---

## Request

```
PATCH /api/notifications/{notificationId}/read
```

Example:

```
PATCH /api/notifications/abc123/read
```

---

## Response

```json
{
  "id": "abc123",
  "isRead": true
}
```

---

## Error Response

If notification does not exist:

```json
{
  "error": "Notification not found"
}
```

Status code:

```
404
```

---

# DELETE /api/notifications/[id]

## Purpose

Delete a single notification from the user's inbox.

Used when:

* user clicks a "delete" button
* user clears a specific notification
* user wants to remove old reminders

This only deletes notifications that belong to the **currently authenticated user**.

---


# PATCH /api/notifications/read-all

## Purpose

Mark **all notifications** as read.

Used for:

* "Mark all as read" button

---

## Request

```
PATCH /api/notifications/read-all
```

No request body.

---

## Response

```json
{
  "updatedCount": 4
}
```

Meaning 4 notifications were updated.

---

# POST /api/internal/notifications/run

## Purpose

Internal cron job route.

This generates notifications automatically.

It performs:

1. assignment reminder processing
2. class reminder processing
3. cleanup of old delivery logs

---

## IMPORTANT

This API **must NOT be called from frontend UI**.

It is intended for:

* cron scheduler
* manual backend testing

---

## Authentication

Requires header:

```
x-internal-cron-secret
```

Example:

```
x-internal-cron-secret: your-secret
```

The value must match:

```
INTERNAL_CRON_SECRET
```

in `.env`.

---

## Example Curl

```
curl -X POST http://localhost:3000/api/internal/notifications/run \
  -H "x-internal-cron-secret: your-secret"
```

---

## Response Example

```json
{
  "ok": true,
  "assignmentInAppCreated": 2,
  "assignmentEmailsSent": 1,
  "assignmentEmailFailures": 1,
  "classSummariesCreated": 1,
  "deliveryLogsDeleted": 4
}
```

---

## Response Fields

### ok

Indicates whether cron execution succeeded.

### assignmentInAppCreated

Number of in-app assignment notifications created.

### assignmentEmailsSent

Number of assignment emails successfully sent.

### assignmentEmailFailures

Number of failed email attempts.

Failures are logged but do not stop execution.

### classSummariesCreated

Number of class summary notifications created.

### deliveryLogsDeleted

Number of delivery logs removed during cleanup.

---

# Assignment Reminder Logic

Triggered when:

```
status = PENDING
dueDate = today or tomorrow
```

For each assignment:

1. create in-app notification
2. send email if Gmail configured
3. store delivery log

---

# Class Reminder Logic

Triggered when:

```
classSchedule.dayOfWeek = tomorrow
isActive = true
```

Process:

1. group classes by user
2. generate summary
3. create single notification

---

# Duplicate Prevention

Duplicate reminders are prevented using:

```
NotificationDeliveryLog
```

Combination used:

```
userId + type + channel + notificationDate + assignmentId
```

Meaning the same reminder cannot be sent twice.

---

# Failure Handling

Email sending is wrapped in `try/catch`.

If an email fails:

```
log error
continue processing other assignments
```

This prevents the cron job from crashing.

---

# Gmail Integration

Assignment emails use Gmail API.

Required `.env` variables:

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
GOOGLE_REFRESH_TOKEN
GMAIL_SENDER_EMAIL
```

If Gmail is not configured:

* emails are skipped
* in-app notifications still work

---

# Frontend Integration Guide

Din should use these APIs:

## Fetch notifications

```ts
const res = await fetch("/api/notifications")
const data = await res.json()
```

---

## Mark single notification

```ts
await fetch(`/api/notifications/${id}/read`, {
  method: "PATCH"
})
```

---

## Mark all notifications

```ts
await fetch("/api/notifications/read-all", {
  method: "PATCH"
})
```

---

# Suggested UI Behavior

Unread notification:

* bold text
* highlight background
* unread dot

Read notification:

* normal text
* faded color

---

# Example UI Layout

Notification bell:

```
🔔 (3)
```

Dropdown example:

```
Assignment Due Tomorrow
Database Report

Assignment Due Today
Web Development Proposal

Tomorrow's Classes
3 classes scheduled
```

---

# Important Notes

1. Notifications are **user-specific**.
2. Internal cron API should **never be exposed to frontend**.
3. Snapshot fields prevent data changes from breaking old notifications.
4. AssignmentId may be null for class summaries.

---

# Future Improvements

Possible future upgrades:

* HTML email templates
* notification preferences
* retry queue for failed emails
* pagination for notifications
* auto-delete old notifications

---

# Summary

Current notification system supports:

* assignment reminders (today + tomorrow)
* class summary reminders
* in-app notifications
* Gmail email reminders
* duplicate prevention
* cron automation
* failure isolation

The backend notification system is now **fully operational and ready for frontend integration**
