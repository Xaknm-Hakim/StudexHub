# RUNBOOK

> Last Updated: 2026-05-10
> Scope: Operations runbook
> Status: Active

This runbook provides operational instructions for maintaining and operating the StudexHub system in production. It is intended to serve as a quick reference for routine operations, troubleshooting, and recovery procedures.

---

# 1. System Overview

StudexHub runs on a self-hosted Linux server using the following stack:

* Docker
* Docker Compose
* Nginx
* Cloudflare Tunnel
* PostgreSQL
* Next.js application

Traffic flow:

User → Cloudflare → Cloudflare Tunnel → Nginx → Next.js Container → PostgreSQL

---

# 2. Repository Location

Example server location:

```
/opt/baruashub/StudexHub/
```

VERIFY: Confirm the actual production checkout path before running commands. Current Docker Compose references `/opt/baruashub/StudexHub/infra` as a mounted infra path.

Main directories:

```
app/      → Next.js application
infra/    → Docker compose files
docs/     → documentation
```

---

# 3. Start the System

Navigate to the infrastructure directory:

```
cd /opt/baruashub/StudexHub/infra/docker
```

VERIFY: Use the actual production checkout path.

Start services:

```
docker compose --env-file .env.docker -f docker-compose.yml up -d
```

Verify containers:

```
docker compose --env-file .env.docker -f docker-compose.yml ps
```

---

# 4. Stop the System

```
docker compose --env-file .env.docker -f docker-compose.yml down
```

---

# 5. Restart Services

Restart all services:

```
docker compose --env-file .env.docker -f docker-compose.yml restart
```

Restart a specific service:

```
docker compose --env-file .env.docker -f docker-compose.yml restart web
```

---

# 6. Update the Application

Pull latest changes:

```
git pull origin main
```

Rebuild containers:

```
docker compose --env-file .env.docker -f docker-compose.yml build
```

Restart containers:

```
docker compose --env-file .env.docker -f docker-compose.yml up -d
```

Run database migrations:

```
docker compose --env-file .env.docker -f docker-compose.yml exec web npx prisma migrate deploy
```

---

# 7. View Logs

Application logs:

```
docker compose --env-file .env.docker -f docker-compose.yml logs -f web
```

Database logs:

```
docker compose --env-file .env.docker -f docker-compose.yml logs -f db
```

All logs:

```
docker compose --env-file .env.docker -f docker-compose.yml logs -f
```

---

# 8. Check Nginx Status

Check service status:

```
systemctl status nginx
```

Reload configuration:

```
sudo systemctl reload nginx
```

Test configuration:

```
sudo nginx -t
```

---

# 9. Check Cloudflare Tunnel

Check tunnel service:

```
systemctl status cloudflared
```

Restart tunnel:

```
sudo systemctl restart cloudflared
```

---

# 10. Database Access

Open PostgreSQL shell:

```
docker compose --env-file .env.docker -f docker-compose.yml exec db psql -U postgres
```

VERIFY: Confirm the production database user and database name from the approved environment configuration before connecting.

---

# 11. Backup Database

Manual backup example:

```
docker compose --env-file .env.docker -f docker-compose.yml exec db pg_dump -U postgres <database_name> > backup.sql
```

Recommended to automate backups using cron.

VERIFY: Confirm `<database_name>` and backup destination before running a backup.

---

# 12. Health Checks

Verify containers:

```
docker compose --env-file .env.docker -f docker-compose.yml ps
```

Check disk usage:

```
df -h
```

Check memory usage:

```
free -h
```

---

# 13. Common Troubleshooting

## Application Not Loading

Check container logs:

```
docker compose --env-file .env.docker -f docker-compose.yml logs web
```

Verify container is running:

```
docker compose --env-file .env.docker -f docker-compose.yml ps
```

---

## Reverse Proxy Issues

Check Nginx logs:

```
/var/log/nginx/error.log
/var/log/nginx/access.log
```

---

## Database Connection Errors

Verify database container:

```
docker compose --env-file .env.docker -f docker-compose.yml ps
```

Restart database:

```
docker compose --env-file .env.docker -f docker-compose.yml restart db
```

---

# 14. System Reboot Procedure

After server reboot:

1. Ensure Docker service started

```
systemctl status docker
```

2. Start containers if necessary

```
docker compose --env-file .env.docker -f docker-compose.yml up -d
```

3. Verify Nginx and Cloudflare tunnel

```
systemctl status nginx
systemctl status cloudflared
```

---

# 15. Operational Best Practices

* Keep the repository up to date
* Monitor container logs regularly
* Perform regular database backups
* Test Nginx configuration before reload
* Document any infrastructure changes

---

# 16. Emergency Recovery

If the application fails completely:

1. Check Docker containers
2. Restart services
3. Inspect logs
4. Verify database availability
5. Verify Nginx and Cloudflare tunnel

This runbook should be updated whenever infrastructure or deployment procedures change.
