# BaruasHub

BaruasHub is a personal academic management web application built to help diploma students manage their semester structure, courses, assignments, class schedules, and academic progress in one centralized system.

This project started as a **simple static website experiment** and gradually evolved into a **full‑stack containerized web application deployed on a self‑hosted homelab server**.

The goal of this project is not only to build a useful tool for students, but also to serve as a **learning platform for real-world infrastructure, backend systems, and deployment practices**.

---

# Project Evolution

## Phase 1 — Static Website (MVP)

The earliest version of the project was a static frontend website.

Purpose:

* Explore UI layout ideas
* Understand basic project structure
* Prototype the academic dashboard concept

Limitations:

* No database
* No authentication
* No persistence
* Pure frontend rendering

This stage served as the conceptual foundation for the full application.

---

## Phase 2 — Full Stack Application

The project later evolved into a full-stack system with:

* backend APIs
* database persistence
* authentication
* structured data models

Major components introduced:

* Next.js application framework
* PostgreSQL database
* Prisma ORM
* API routes

Core features implemented:

* semester management
* course tracking
* assignment management
* class schedule management
* academic summary and CGPA calculation

---

## Phase 3 — Notification System

To make the system practical for daily student use, a notification system was added.

Current notification types:

### Assignment reminders

Triggered when assignments are:

* due tomorrow
* due today

Channels:

* in‑app notifications
* email notifications (Gmail API)

### Class reminders

Triggered when the user has classes tomorrow.

Channel:

* in‑app notification

All tomorrow classes are grouped into a **single summary notification**.

---

## Phase 4 — Containerization

The entire application stack is containerized using Docker.

Services include:

* web application
* PostgreSQL database

Benefits:

* consistent environments
* easier deployment
* reproducible builds

Docker is also used to simulate a production environment during development.

---

## Phase 5 — Infrastructure Deployment

The application is deployed on a **self‑hosted ThinkPad server** running Linux.

Infrastructure components:

* Docker
* Docker Compose
* Nginx reverse proxy
* Cloudflare Tunnel

Deployment architecture:

User

→ Cloudflare

→ Cloudflare Tunnel

→ Nginx

→ Docker container (Next.js app)

→ PostgreSQL database

This setup allows secure public access without directly exposing the server to the internet.

---

# Technology Stack

## Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS

## Backend

* Next.js API Routes

## Database

* PostgreSQL

## ORM

* Prisma

## Infrastructure

* Docker
* Docker Compose
* Nginx
* Cloudflare Tunnel

## Email

* Gmail API

---

# Project Structure

```
.
├── app/                    # Main full-stack Next.js application
│   ├── app/                # App Router pages and API routes
│   ├── components/         # Reusable frontend components
│   ├── prisma/             # Database schema, migrations, and seed
│   ├── public/             # Static assets
│   ├── scripts/            # Utility/helper scripts
│   ├── src/lib/            # Core backend/business logic
│   └── Dockerfile          # Production app container build
├── docs/                   # Project documentation
│   ├── api-docs/           # API documentation
│   ├── infra-docs/         # Docker, network, and deployment docs
│   └── overview-docs/      # High-level project notes
├── infra/                  # Deployment-related configuration
│   └── docker/             # Docker Compose files for dev and production
├── web/                    # Original static MVP version of the project
└── README.md               # Root project overview
```

---

# Key System Features

## Academic Tracking

Users can manage:

* semesters
* courses
* credits
* grades

The system automatically calculates:

* GPA
* CGPA

---

## Assignment Management

Assignments support:

* due date tracking
* status tracking
* course association

Assignments are also integrated with the notification system.

---

## Class Schedule Management

Users can define weekly class schedules.

This enables the system to generate **class reminder notifications**.

---

## Notification System

The application includes an internal notification system that supports:

* assignment reminders
* class reminders

Notifications appear inside the application and may also be delivered via email.

---

# Development Goals

This project was intentionally designed to explore several important engineering topics:

* full stack web development
* API design
* database schema design
* authentication systems
* containerization
* reverse proxy configuration
* homelab deployment

It also acts as a **portfolio project demonstrating infrastructure and backend engineering skills**.

---

# Future Improvements

Planned or potential improvements include:

* multi‑user support
* better analytics dashboard
* mobile‑friendly UI improvements
* background worker services
* automated backups
* monitoring and health checks

---

# Educational Purpose

This project is also part of a broader learning journey in:

* networking
* infrastructure engineering
* cloud‑native systems

The architecture intentionally mirrors real production patterns used in modern web services.

---

# License

This project is currently intended for educational and personal use.
