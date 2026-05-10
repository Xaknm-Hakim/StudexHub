# Network and Public Access Setup

> Last Updated: 2026-05-10
> Scope: Network and public access
> Status: Active

This document records the documented public-access path for StudexHub.

VERIFY: Confirm the active production host, Cloudflare tunnel, Nginx site file, and DNS records before using this as an operations source of truth.

---

## Architecture Overview

Documented request flow:

```text
User browser
  -> Cloudflare DNS
  -> Cloudflare Tunnel
  -> Nginx reverse proxy
  -> Next.js app on port 3000
  -> PostgreSQL through Prisma
```

The application container is exposed on host port `3000` by the current Docker Compose file.

VERIFY: Confirm this port mapping is still active in production before troubleshooting through it.

---

## Docker Reachability

Before checking Nginx or Cloudflare, confirm the app container is running.

```bash
docker compose --env-file infra/docker/.env.docker -f infra/docker/docker-compose.yml ps
```

The current Compose service names are:

| Service | Purpose |
| ------- | ------- |
| `web` | Next.js application |
| `db` | PostgreSQL database |

The current Compose container names use legacy `baruashub` identifiers.

VERIFY: Treat those names as existing operational identifiers. Do not rename them without an explicit migration plan.

---

## Nginx Reverse Proxy

Nginx is documented as the host-level reverse proxy in front of the Next.js application.

Expected proxy target:

```text
http://127.0.0.1:3000
```

Expected public hostnames:

```text
studexhub.com
www.studexhub.com
```

VERIFY: Confirm the actual Nginx site path, enabled symlink, server names, and proxy target on the production host.

Useful checks:

```bash
sudo nginx -t
sudo systemctl status nginx
sudo systemctl reload nginx
```

---

## Cloudflare Tunnel

Cloudflare Tunnel is documented as the public ingress path. The tunnel should route public hostnames to Nginx on the host.

Expected tunnel target:

```text
http://localhost:80
```

VERIFY: Confirm the tunnel name, tunnel ID, credentials file path, and ingress rules on the production host.

Useful checks:

```bash
cloudflared tunnel list
systemctl status cloudflared
sudo systemctl restart cloudflared
```

---

## DNS

The documented domain is:

```text
studexhub.com
```

Expected hostnames:

```text
studexhub.com
www.studexhub.com
```

VERIFY: Confirm Cloudflare DNS records are currently routed to the intended tunnel.

---

## Security Notes

The database should not be publicly exposed.

The current Docker Compose file exposes PostgreSQL on host port `5432`.

VERIFY: Confirm whether host-level database exposure is required for the active environment. If it is not required, document the approved change before modifying Docker configuration.

Internal cron endpoints require the `x-internal-cron-secret` header and must not be exposed as normal frontend workflows.

---

## Removed From Current Contract

This document does not describe Google OAuth setup. The current inspected auth routes are invite signup, login, logout, and session lookup.

VERIFY before adding OAuth callback URLs or Google sign-in instructions back to the network documentation.
