# StudexHub Documentation

> Last Updated: 2026-05-10
> Scope: Documentation index
> Status: Active

This directory contains technical documentation for StudexHub.

## Overview

- [System Overview](overview-docs/system-overview.md)
- [Architecture](overview-docs/architecture.md)
- [Deployment Guide](overview-docs/deployment.md)

## Infrastructure

- [Docker Setup](infra-docs/docker.md)
- [Network Configuration](infra-docs/network.md)

## API Documentation

- [Academics API](api-docs/academics.md)
- [Assignments API](api-docs/assignments.md)
- [Authentication API](api-docs/auth.md)
- [Class Schedules API](api-docs/class-schedules.md)
- [Courses API](api-docs/courses.md)
- [Internal API](api-docs/internal.md)
- [Notifications API](api-docs/notifications.md)
- [Semesters API](api-docs/semesters.md)
- [Type System](api-docs/types.md)
- [API Documentation Template](api-docs/templates.md)

## Archived API Documentation

Historical API documents live under [api-docs/legacy](api-docs/legacy/).

Treat legacy documents as archived context only. If implementation, current API docs, and legacy docs disagree, trust the implementation first and current API docs second.

## Documentation Rules

- Document current implemented behavior, not planned behavior.
- Keep API docs under `docs/api-docs`.
- Use [api-docs/templates.md](api-docs/templates.md) when adding or refreshing API route documentation.
- Keep project naming consistent as StudexHub.
