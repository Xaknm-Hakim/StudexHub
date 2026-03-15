# Deployment Guide

This document describes how BaruasHub is deployed to the production server. It explains the infrastructure components involved and the step‑by‑step process used to run the application in a production environment.

The deployment is intentionally designed to be **simple, reproducible, and close to real‑world infrastructure practices**.

---

# 1. Deployment Overview

BaruasHub is deployed on a **self‑hosted Linux server** (ThinkPad homelab machine).

The system uses the following infrastructure components:

* Docker
* Docker Compose
* Nginx
* Cloudflare Tunnel

These components work together to provide a secure and stable hosting environment.

High‑level deployment architecture:

```
User
  │
  ▼
Cloudflare DNS
  │
  ▼
Cloudflare Tunnel
  │
  ▼
Nginx Reverse Proxy
  │
  ▼
Docker Container (Next.js App)
  │
  ▼
PostgreSQL Database
```

---

# 2. Server Environment

The application runs on a Linux server with the following base requirements:

Required software:

* Docker
* Docker Compose
* Nginx
* Git
* Cloudflared

Recommended system configuration:

* Linux server (Ubuntu / Debian)
* At least 2 CPU cores
* Minimum 4 GB RAM
* Stable internet connection

The server acts as both:

* the **application host**
* the **database host**

---

# 3. Repository Deployment Structure

On the server, the project repository is cloned and organized in a dedicated directory.

Example layout:

```
/opt/baruashub/

├── app/                # Next.js application
├── docs/               # Project documentation
├── infra/              # Docker Compose files
├── web/                # Static MVP version
└── README.md
```

Infrastructure files are located in:

```
infra/docker/
```

---

# 4. Docker Container Deployment

The application is containerized using Docker.

Two main services are defined in Docker Compose:

```
web  → Next.js application

db   → PostgreSQL database
```

Example deployment flow:

```
docker compose build

docker compose up -d
```

Docker Compose ensures:

* consistent runtime environment
* service orchestration
* automatic container networking

---

# 5. Database Initialization

The PostgreSQL database is initialized automatically when the container starts.

Database schema is managed using **Prisma migrations**.

Production migration command:

```
npx prisma migrate deploy
```

Seed data can be inserted using:

```
npx prisma db seed
```

This ensures the database schema remains synchronized with the application code.

---

# 6. Nginx Reverse Proxy

Nginx runs on the host machine and acts as the **entry point for HTTP requests**.

Responsibilities:

* receive incoming HTTP requests
* forward traffic to the application container
* handle header forwarding

Example Nginx routing:

```
app.studexhub.com
        │
        ▼
Nginx (port 80)
        │
        ▼
Next.js container (port 3000)
```

The reverse proxy isolates the application container from direct internet access.

---

# 7. Cloudflare Tunnel

Cloudflare Tunnel provides secure external access to the server.

Instead of opening ports on the router or firewall, the server establishes an **outbound connection to Cloudflare**.

Advantages:

* no port forwarding required
* server origin IP remains hidden
* protection behind Cloudflare edge

Traffic flow:

```
Internet
   │
   ▼
Cloudflare Edge
   │
   ▼
Cloudflare Tunnel
   │
   ▼
Nginx Reverse Proxy
```

---

# 8. Deployment Workflow

Typical production deployment workflow:

1. Update the repository

```
git pull origin main
```

2. Rebuild containers

```
docker compose build
```

3. Restart services

```
docker compose up -d
```

4. Run database migrations

```
npx prisma migrate deploy
```

5. Verify services

```
docker compose ps
```

---

# 9. Service Monitoring

Common commands used for monitoring the deployment:

Check container status

```
docker compose ps
```

View logs

```
docker compose logs -f
```

Restart services

```
docker compose restart
```

Check Nginx status

```
systemctl status nginx
```

---

# 10. Backup Strategy

To protect application data, database backups should be performed regularly.

Recommended approach:

* scheduled `pg_dump` backups
* store backups in a dedicated directory

Example backup command:

```
pg_dump -U postgres database_name > backup.sql
```

Future improvements may include automated backup scripts.

---

# 11. Future Deployment Improvements

Potential enhancements to the deployment pipeline include:

* automated CI/CD pipelines
* container image registry
* automated database backups
* infrastructure monitoring
* centralized logging

These additions would move the deployment process closer to modern production DevOps practices.
