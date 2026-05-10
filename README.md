# StudexHub

> Last Updated: 2026-05-10
> Scope: Project overview
> Status: Active

StudexHub is a full-stack academic management web application for tracking semesters, courses, assignments, class schedules, GPA/CGPA, and reminders.

The project is built as a practical student tool and as a self-hosted full-stack/infrastructure project using Next.js, PostgreSQL, Prisma, Docker, Nginx, and Cloudflare Tunnel.

---

## Project Structure

```text
.
├── app/                    # Main Next.js application
│   ├── app/                # App Router pages and API routes
│   ├── components/         # Reusable frontend components
│   ├── prisma/             # Prisma schema, migrations, and seed
│   ├── public/             # Static assets
│   ├── scripts/            # Operational helper scripts
│   ├── src/lib/            # Shared auth, Prisma, domain, notification, and type logic
│   └── Dockerfile          # Application container build
├── docs/                   # Technical documentation
│   ├── api-docs/           # Current API documentation
│   ├── infra-docs/         # Docker and network documentation
│   └── overview-docs/      # System, architecture, and deployment overview
├── infra/                  # Deployment configuration
│   └── docker/             # Docker Compose files
├── web/                    # Original static MVP version
└── README.md               # Project overview
```

---

## Application Domains

- Authentication and invite-based signup
- Semester and course management
- GPA and CGPA calculation
- Assignment tracking
- Weekly class schedules
- In-app and email notification reminders
- Internal health and notification trigger endpoints

---

## Documentation

- [Documentation Index](docs/README.md)
- [System Overview](docs/overview-docs/system-overview.md)
- [Architecture](docs/overview-docs/architecture.md)
- [Deployment Guide](docs/overview-docs/deployment.md)
- [Docker Setup](docs/infra-docs/docker.md)
- [Network Configuration](docs/infra-docs/network.md)

### API Docs

- [Academics API](docs/api-docs/academics.md)
- [Assignments API](docs/api-docs/assignments.md)
- [Authentication API](docs/api-docs/auth.md)
- [Class Schedules API](docs/api-docs/class-schedules.md)
- [Courses API](docs/api-docs/courses.md)
- [Internal API](docs/api-docs/internal.md)
- [Notifications API](docs/api-docs/notifications.md)
- [Semesters API](docs/api-docs/semesters.md)
- [Type System](docs/api-docs/types.md)
- [API Documentation Template](docs/api-docs/templates.md)

Historical API documents are archived under [docs/api-docs/legacy](docs/api-docs/legacy/). Do not treat legacy documents as the current API contract. Use current source code first and current API docs second when legacy docs conflict.

---

## Technology Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Docker and Docker Compose
- Gmail API for email reminders

---

## App Development

The main application lives in [app](app/). See [app/README.md](app/README.md) for app-local commands, structure, and workflow notes.

---

## License

This project is currently intended for educational and personal use.
