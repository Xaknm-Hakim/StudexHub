# System Overview

This document provides a comprehensive overview of the StudexHub system. It explains the purpose of the platform, the problems it aims to solve, the core system components, and how different parts of the application work together.

While other documents focus on specific areas (such as architecture or deployment), this document serves as the **complete high‑level explanation of the entire system**.

---

# 1. Project Purpose

StudexHub is an academic management platform designed primarily for diploma students who want a structured way to manage their academic activities.

The system focuses on helping students track:

* semesters
* courses
* assignments
* class schedules
* academic performance
* important reminders

The goal is to provide a **single centralized dashboard** where students can view and manage all academic information instead of scattering it across notebooks, messaging apps, or personal reminders.

---

# 2. System Goals

StudexHub was built with several design goals in mind:

## Practical Academic Tool

Provide a usable tool that helps students organize coursework and deadlines.

## Real Engineering Project

Serve as a full-stack project that demonstrates real-world engineering practices including:

* backend API design
* database schema modeling
* containerized deployment
* reverse proxy configuration
* homelab infrastructure

## Infrastructure Learning Platform

The project also functions as a learning platform for infrastructure engineering concepts such as:

* container orchestration
* reverse proxy architecture
* secure tunneling
* self-hosted deployment

---

# 3. Core System Features

The StudexHub system is built around several key functional modules.

## 3.1 Authentication System

Users must authenticate to access the application.

Authentication features include:

* user registration
* user login
* session management
* logout

Sessions are maintained using **secure cookies**.

API endpoints involved:

```
/api/auth/login
/api/auth/signup
/api/auth/logout
/api/auth/me
```

---

## 3.2 Semester Management

The system organizes academic data around **semesters**.

A semester acts as the top-level container for academic data.

Each semester contains:

* courses
* assignments

Semester endpoints:

```
/api/semesters
/api/semesters/[semesterId]
```

Additional operations include:

* retrieving GPA for a semester
* listing courses belonging to a semester

---

## 3.3 Course Management

Courses represent individual subjects taken within a semester.

Each course contains information such as:

* course name
* credit value
* grade

Courses are used to calculate:

* semester GPA
* cumulative GPA

Course endpoints:

```
/api/courses
/api/courses/[courseId]
```

---

## 3.4 Assignment Management

Assignments allow users to track coursework tasks and deadlines.

Each assignment typically includes:

* assignment title
* associated course
* due date
* completion status

Assignment endpoints:

```
/api/assignments
/api/assignments/[id]
```

Assignments are also integrated with the **notification system**.

---

## 3.5 Class Schedule Management

Users can define weekly class schedules for their courses.

This allows the system to provide reminders for upcoming classes.

Schedule endpoints:

```
/api/class-schedules
/api/class-schedules/[id]
```

Schedules store information such as:

* day of the week
* start time
* end time
* associated course

---

## 3.6 Academic Summary

The system automatically calculates academic statistics.

These include:

* semester GPA
* cumulative GPA

Academic summary endpoint:

```
/api/academics/summary
```

This endpoint aggregates data across multiple semesters.

---

## 3.7 Notification System

The notification system reminds users about important academic events.

Two major types of reminders currently exist.

### Assignment Reminders

Triggered when assignments are:

* due tomorrow
* due today

### Class Reminders

Triggered when the user has classes scheduled for the next day.

Notifications are stored in the database and displayed within the application interface.

Some notifications can also be delivered via email.

---

# 4. Email Notification System

The system integrates with the **Gmail API** to send email reminders.

Email notifications are used for:

* assignment due reminders

The email subsystem includes:

* Gmail API client
* email templates
* message sending logic

This integration allows the system to notify users even when they are not actively using the application.

---

# 5. Internal Notification Trigger

The application includes an internal endpoint used to trigger the notification generation process.

Endpoint:

```
/api/internal/notifications/run
```

This endpoint is designed to be called by:

* a scheduled job
* a manual admin trigger

Its purpose is to scan upcoming deadlines and generate reminder notifications.

---

# 6. Frontend Interface

The frontend is built with **Next.js App Router**.

Major pages include:

* dashboard
* assignments page
* schedules page
* CGPA page
* login page

The interface is designed to provide a centralized academic overview.

---

# 7. Backend API Layer

The backend is implemented using **Next.js API routes**.

Instead of running a separate backend server, the application combines:

* frontend rendering
* backend API logic

within a single Next.js application.

API route structure:

```
/app/app/api/
```

Each API domain corresponds to a feature area such as:

* assignments
* courses
* semesters
* schedules
* notifications

---

# 8. Business Logic Layer

Shared business logic is located in:

```
/src/lib/
```

This layer contains reusable logic for:

* authentication
* notification generation
* grading calculations
* email delivery

Separating logic from API routes helps keep the application modular and maintainable.

---

# 9. Database Layer

StudexHub uses **PostgreSQL** as its primary database.

Database access is handled through **Prisma ORM**.

Core database entities include:

* User
* Semester
* Course
* Assignment
* ClassSchedule
* Notification

Database schema is defined in:

```
/prisma/schema.prisma
```

Database migrations are stored in:

```
/prisma/migrations/
```

---

# 10. Infrastructure Layer

The entire system runs on a **self-hosted Linux server**.

Infrastructure stack:

* Docker
* Docker Compose
* Nginx
* Cloudflare Tunnel

This infrastructure enables secure public access while keeping the server protected behind Cloudflare.

---

# 11. System Evolution

The project has gone through several development stages.

## Stage 1 — Static Website

The earliest version of the project was a static website used to prototype the interface.

This version is still preserved inside the repository under:

```
/web
```

## Stage 2 — Full Stack Application

The project evolved into a full-stack application with:

* backend APIs
* database persistence
* authentication

## Stage 3 — Containerized Deployment

The application was later containerized using Docker and deployed on a self-hosted server.

---

# 12. Future Improvements

Potential future system enhancements include:

* background worker service for scheduled tasks
* improved analytics dashboard
* automated database backups
* centralized logging
* monitoring tools
* CI/CD pipeline

These improvements would further strengthen the system's reliability and scalability.

---

# 13. Summary

StudexHub combines several modern engineering practices into a single cohesive system:

* full-stack web development
* containerized infrastructure
* self-hosted deployment
* secure reverse proxy architecture

The system demonstrates how a relatively small application can be structured using patterns similar to those used in real production environments.
