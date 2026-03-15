# RUNBOOK

This runbook provides operational instructions for maintaining and operating the BaruasHub system in production. It is intended to serve as a quick reference for routine operations, troubleshooting, and recovery procedures.

---

# 1. System Overview

BaruasHub runs on a self‑hosted Linux server using the following stack:

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
/opt/baruashub/
```

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
cd /opt/baruashub/infra/docker
```

Start services:

```
docker compose up -d
```

Verify containers:

```
docker compose ps
```

---

# 4. Stop the System

```
docker compose down
```

---

# 5. Restart Services

Restart all services:

```
docker compose restart
```

Restart a specific service:

```
docker compose restart web
```

---

# 6. Update the Application

Pull latest changes:

```
git pull origin main
```

Rebuild containers:

```
docker compose build
```

Restart containers:

```
docker compose up -d
```

Run database migrations:

```
docker compose exec web npx prisma migrate deploy
```

---

# 7. View Logs

Application logs:

```
docker compose logs -f web
```

Database logs:

```
docker compose logs -f db
```

All logs:

```
docker compose logs -f
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
docker compose exec db psql -U postgres
```

---

# 11. Backup Database

Manual backup example:

```
docker compose exec db pg_dump -U postgres database_name > backup.sql
```

Recommended to automate backups using cron.

---

# 12. Health Checks

Verify containers:

```
docker compose ps
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
docker compose logs web
```

Verify container is running:

```
docker compose ps
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
docker compose ps
```

Restart database:

```
docker compose restart db
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
docker compose up -d
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
