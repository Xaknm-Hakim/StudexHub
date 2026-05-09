# System Architecture

This document explains the high‑level architecture of the StudexHub system: how the application is structured, how requests flow through the infrastructure, and how the main services interact with each other.

The architecture is intentionally designed to mirror real production patterns while still being simple enough to run on a single homelab server.

---

# 1. High Level Overview

StudexHub is a **self‑hosted full‑stack web application** composed of several layers:

* Edge network (Cloudflare)
* Reverse proxy (Nginx)
* Application container (Next.js)
* Database container (PostgreSQL)

The application is deployed using **Docker Compose** on a Linux server.

---

# 2. Request Flow

A typical request follows this path:

User Browser

→ Cloudflare DNS

→ Cloudflare Tunnel

→ Nginx Reverse Proxy

→ Next.js Application Container

→ PostgreSQL Database

Explanation of each stage:

### Cloudflare

Cloudflare handles:

* DNS resolution
* TLS termination
* public edge access

The server itself is **not directly exposed to the public internet**.

Instead, access is provided via a **Cloudflare Tunnel**.

---

### Cloudflare Tunnel

Cloudflare Tunnel creates an outbound connection from the server to Cloudflare.

This allows inbound traffic to reach the server **without opening public ports**.

Benefits:

* improved security
* easier deployment behind NAT
* no need for port forwarding

---

### Nginx Reverse Proxy

Nginx runs directly on the host machine and acts as the entry point to the internal application.

Responsibilities:

* reverse proxy to the application container
* request header forwarding
* connection upgrades (websocket support)

Example routing behavior:

```
http://app.studexhub.com
        │
        ▼
Nginx (port 80)
        │
        ▼
Next.js container (port 3000)
```

---

### Application Layer (Next.js)

The application itself is built with **Next.js using the App Router**.

The Next.js server performs multiple roles:

* rendering frontend pages
* exposing backend API routes
* handling authentication
* executing application business logic

The system uses **API routes inside the Next.js project** instead of a separate backend server.

---

### Database Layer

The database is **PostgreSQL** running inside a Docker container.

The application communicates with the database through **Prisma ORM**.

Responsibilities of the database layer:

* store users
* store semesters
* store courses
* store assignments
* store class schedules
* store notifications

Database schema changes are managed using **Prisma migrations**.

---

# 3. Application Architecture

Internally, the application is divided into several layers:

Frontend Layer

Next.js pages and UI components.

Responsibilities:

* rendering dashboard views
* displaying assignments
* displaying schedules
* handling user interactions

---

Backend API Layer

API routes located under:

```
/app/app/api/
```

Responsibilities:

* authentication
* CRUD operations
* business logic
* notification triggers

Example API domains:

* assignments
* semesters
* courses
* schedules
* notifications

---

Service / Logic Layer

Shared logic lives in:

```
/app/src/lib/
```

Examples include:

* authentication helpers
* notification generation
* grading calculations
* Gmail email integration

This layer isolates business logic from API route handlers.

---

Database Layer

Prisma provides a structured interface to PostgreSQL.

The schema is defined in:

```
/prisma/schema.prisma
```

Migrations are stored in:

```
/prisma/migrations/
```

---

# 4. Notification System Architecture

The notification system is designed to generate reminders for important academic events.

Two main reminder types exist:

Assignment reminders

* due tomorrow
* due today

Class reminders

* classes scheduled for tomorrow

The notification pipeline works like this:

Scheduler / Trigger

→ Notification generation logic

→ Database notification records

→ In‑app notification display

→ Optional email delivery

Email notifications are delivered through the **Gmail API integration**.

---

# 5. Container Architecture

The project uses **Docker Compose** to orchestrate services.

Current service layout:

```
services:

  web:
    Next.js application

  db:
    PostgreSQL database
```

Benefits of containerization:

* consistent development environment
* simplified deployment
* easier reproducibility

---

# 6. Infrastructure Layout

The application runs on a **self‑hosted Linux server**.

Infrastructure stack:

* Linux server
* Docker
* Docker Compose
* Nginx
* Cloudflare Tunnel

This design provides a good balance between:

* simplicity
* security
* real‑world production patterns

---

# 7. Security Considerations

Several architectural choices improve security:

* no public database exposure
* server ports are not publicly open
* Cloudflare Tunnel protects origin
* authentication handled through secure cookies

Future improvements may include:

* rate limiting
* request logging
* automated backups

---

# 8. Future Architecture Improvements

Potential future enhancements include:

* background worker service for scheduled jobs
* message queue for notifications
* automated monitoring
* centralized logging
* CI/CD deployment pipeline

These improvements would further align the system with modern production architectures.
