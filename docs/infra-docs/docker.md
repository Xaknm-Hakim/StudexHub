# Docker Setup — StudexHub

> Last Updated: 2026-05-10
> Scope: Docker setup
> Status: Active

This document explains how the project runs using Docker, how the environment variables are structured, and how to perform common development tasks.

---

# Overview

The application runs using **Docker Compose** with two containers:

1. **web** — Next.js application
2. **db** — PostgreSQL database

Architecture:

```
Browser
   │
   │ HTTP
   ▼
Next.js container (baruashub-web)
   │
   │ Prisma
   ▼
PostgreSQL container (baruashub-db)
   │
   │ Docker Volume
   ▼
Persistent database storage
```

Current Compose files still use some `baruashub` identifiers for container names, database names, and volumes.

VERIFY: Treat those as existing operational identifiers, not product naming guidance. Confirm before renaming any Docker resource.

Docker Compose manages:

* container startup
* networking
* environment variables
* persistent storage

---

# Directory Structure

```
StudexHub/
│
├─ app/                    # Next.js application
│   ├─ Dockerfile
│   ├─ prisma/
│   ├─ scripts/
│   ├─ src/
│   ├─ .env                # Local development env
│   └─ prisma.config.ts
│
├─ infra/
│   └─ docker/
│       ├─ docker-compose.yml
│       ├─ .env.docker
│       └─ .env.docker.example
│
└─ docs/
    └─ infra-docs/
        └─ docker.md
```

---

# Environment Variables

The project uses **two separate environment files**.

## Local Development

File:

```
app/.env
```

Example:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/baruashub
AUTH_SECRET=local-secret
COOKIE_SECURE=false
```

VERIFY: Example values are placeholders. Use approved local environment values and do not commit real secrets.

Used when running the app **outside Docker**.

Example:

```
npm run dev
npx prisma studio
```

---

## Docker Environment

File:

```
infra/docker/.env.docker
```

Example:

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=baruashub

DATABASE_URL=postgresql://postgres:postgres@db:5432/baruashub

AUTH_SECRET=some-long-random-secret
COOKIE_SECURE=false
```

VERIFY: Example values are placeholders. Confirm the actual Docker database name, user, password, and runtime secrets from approved environment configuration.

Key difference:

```
db
```

is the **internal Docker hostname** of the database container.

---

# Why `.env` is not copied into Docker

The Docker image **does not contain `.env` files**.

Instead, environment variables are injected at runtime using:

```
--env-file infra/docker/.env.docker
```

This prevents secrets from being baked into the image.

---

# Starting the System

From the project root:

```
docker compose \
--env-file infra/docker/.env.docker \
-f infra/docker/docker-compose.yml \
up --build
```

This will:

1. build the Next.js container
2. start PostgreSQL
3. run Prisma migrations
4. start the Next.js server

The app will be available at:

```
http://localhost:3000
```

---

# Stopping the System

Stop containers:

```
docker compose -f infra/docker/docker-compose.yml down
```

Stop containers **and delete the database volume**:

```
docker compose -f infra/docker/docker-compose.yml down -v
```

---

# Prisma Migrations

When the web container starts it automatically runs:

```
npx prisma migrate deploy
```

This ensures the database schema is always up to date.

---

# Prisma Studio

Prisma Studio is usually easier to run **from the host machine**.

```
cd app
npx prisma studio
```

Open:

```
http://localhost:5555
```

The current production Compose file exposes PostgreSQL port `5432`.

VERIFY: Confirm whether this exposure is intended in the active environment before relying on host access.

---

# Running Scripts Inside Docker

Some scripts should run inside the container so they use the same environment as the application.

Example: generating signup invite codes.

```
docker compose \
--env-file infra/docker/.env.docker \
-f infra/docker/docker-compose.yml \
exec web npx tsx scripts/create-invite.ts
```

This runs the script inside the running web container.

---

# Docker Build Stages

The Dockerfile uses **multi-stage builds**.

Stages:

### deps

Installs Node dependencies.

### builder

Runs:

```
prisma generate
next build
```

This creates:

* compiled Next.js output
* generated Prisma client

### runner

The final lightweight image that runs the application.

Important: `node_modules` must be copied from **builder**, not `deps`, otherwise the Prisma client will be missing.

---

# Cookie Security

Session cookies use:

```
COOKIE_SECURE
```

instead of relying on `NODE_ENV`.

Example config:

```
secure: process.env.COOKIE_SECURE === "true"
```

Why?

`NODE_ENV=production` does **not always mean HTTPS**.

Local Docker development runs over HTTP, so secure cookies must be disabled.

Local:

```
COOKIE_SECURE=false
```

Production (HTTPS):

```
COOKIE_SECURE=true
```

---

# Common Commands

Start system:

```
docker compose --env-file infra/docker/.env.docker -f infra/docker/docker-compose.yml up --build
```

Stop system:

```
docker compose -f infra/docker/docker-compose.yml down
```

Open container shell:

```
docker compose exec web sh
```

Run invite code generator:

```
docker compose exec web npx tsx scripts/create-invite.ts
```

View logs:

```
docker compose logs -f
```

---

# Notes

If Docker behaves strangely after structural changes, the Next.js build cache may need to be removed:

```
rm -rf app/.next
```

Then rebuild the container.

VERIFY: Confirm no needed local build artifacts are being preserved before deleting generated directories.

---

# Summary

The project is fully containerized using:

* Next.js
* Prisma
* PostgreSQL
* Docker Compose

This setup ensures the application can run consistently across different environments.
