
# Internal API

> Generated: 2026-04-18
> Last Updated: 2026-04-18
> Source: app/app/api/internal

---

## Base Path

`/api/internal`

---

## GET /api/internal/health

### Description

Runs an internal service health check for the StudexHub application and database.

### Auth

Internal Secret Required

Authorization is enforced through the `x-internal-cron-secret` request header, which must match `INTERNAL_CRON_SECRET`.

### Query Params

| Name | Type | Required | Description                                     |
| ---- | ---- | -------- | ----------------------------------------------- |
| None | -    | No       | This endpoint does not accept query parameters. |

### Required Headers

| Name                     | Type     | Required | Description                                    |
| ------------------------ | -------- | -------- | ---------------------------------------------- |
| `x-internal-cron-secret` | `string` | Yes      | Internal secret used to authorize the request. |

### Request Body

```json
{}
```

### Response

```json
{
  "ok": true,
  "service": "StudexHub",
  "timestamp": "2026-04-18T12:00:00.000Z",
  "checks": {
    "app": true,
    "db": true
  }
}
```

### Response Fields

| Field        | Type      | Description                                                           |
| ------------ | --------- | --------------------------------------------------------------------- |
| `ok`         | `boolean` | Overall health result.                                                |
| `service`    | `string`  | Service name.                                                         |
| `timestamp`  | `string`  | ISO timestamp for when the health check ran.                          |
| `checks`     | `object`  | Individual subsystem health results.                                  |
| `checks.app` | `boolean` | Application-layer health. Hardcoded `true` in current implementation. |
| `checks.db`  | `boolean` | Database health based on `SELECT 1` query success.                    |

### Notes

* If `INTERNAL_CRON_SECRET` is not configured, the route returns `500`.
* If the provided secret does not match, the route returns `401`.
* Database health is determined by attempting `SELECT 1` through Prisma.
* If the database check fails, the route still responds with JSON, but returns `503 Service Unavailable`.
* Current implementation always sets `checks.app = true`, so the only dynamic health dependency is the database check.

### Common Error Responses

```json
{
  "ok": false,
  "error": "INTERNAL_CRON_SECRET is not configured"
}
```

```json
{
  "ok": false,
  "error": "Unauthorized"
}
```

---

## POST /api/internal/notifications/run

### Description

Runs internal notification jobs, including assignment reminders, class reminders, and cleanup of old delivery logs.

### Auth

Internal Secret Required

Authorization is enforced through the `x-internal-cron-secret` request header, which must match `INTERNAL_CRON_SECRET`.

### Query Params

| Name | Type | Required | Description                                     |
| ---- | ---- | -------- | ----------------------------------------------- |
| None | -    | No       | This endpoint does not accept query parameters. |

### Required Headers

| Name                     | Type     | Required | Description                                    |
| ------------------------ | -------- | -------- | ---------------------------------------------- |
| `x-internal-cron-secret` | `string` | Yes      | Internal secret used to authorize the request. |

### Request Body

```json
{}
```

### Response

```json
{
  "ok": true,
  "assignmentInAppCreated": 12,
  "assignmentEmailsSent": 10,
  "assignmentEmailFailures": 2,
  "classSummariesCreated": 4,
  "deliveryLogsDeleted": 18
}
```

### Response Fields

| Field                     | Type      | Description                                                             |
| ------------------------- | --------- | ----------------------------------------------------------------------- |
| `ok`                      | `boolean` | Indicates whether the internal notification run completed successfully. |
| `assignmentInAppCreated`  | `number`  | Count of in-app assignment reminder notifications created.              |
| `assignmentEmailsSent`    | `number`  | Count of assignment reminder emails successfully sent.                  |
| `assignmentEmailFailures` | `number`  | Count of assignment reminder email send failures.                       |
| `classSummariesCreated`   | `number`  | Count of class reminder summaries created.                              |
| `deliveryLogsDeleted`     | `number`  | Count of old delivery log records deleted during cleanup.               |

### Notes

* If `INTERNAL_CRON_SECRET` is missing, the helper throws and the route returns `500`.
* If the provided secret does not match, the route returns `401`.
* This endpoint is intended for internal automation or cron-style triggering, not normal client use.
* The route runs three internal jobs in sequence:

  * assignment reminders
  * class reminders
  * delivery log cleanup
* If any unhandled error occurs during execution, the route returns `500`.

### Common Error Responses

```json
{
  "error": "Unauthorized"
}
```

```json
{
  "ok": false,
  "error": "Failed to run notifications"
}
```
