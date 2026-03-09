# Network and Public Access Setup

This document records the full networking setup used to expose
**StudexHub** from a local Dockerized Next.js app to the public internet
using:

-   **Nginx** as reverse proxy
-   **Cloudflare DNS**
-   **Cloudflare Tunnel**
-   **Docker** for app and database containers

This setup was first tested on a **Debian desktop workspace**, and will
later be repeated on the real server.

------------------------------------------------------------------------

## 1. Architecture Overview

Current tested flow:

User Browser ↓ Cloudflare DNS ↓ Cloudflare Tunnel ↓ Local Debian machine
↓ Nginx (port 80) ↓ Next.js app in Docker (port 3000)

Internal app path:

localhost:80 (Nginx) ↓ 127.0.0.1:3000 ↓ baruashub-web container

------------------------------------------------------------------------

## 2. Docker Status Confirmation

Before setting up Nginx, confirm the app container is running and port
`3000` is exposed.

### Check running containers

docker ps

Expected output example:

CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES b46d5fbc32e8
docker-web "docker-entrypoint.s..." 5 minutes ago Up 5 minutes
0.0.0.0:3000-\>3000/tcp, \[::\]:3000-\>3000/tcp baruashub-web
45702fab48bd postgres:16-alpine "docker-entrypoint.s..." 5 minutes ago
Up 5 minutes 0.0.0.0:5432-\>5432/tcp, \[::\]:5432-\>5432/tcp
baruashub-db

### Test app directly from host

curl http://127.0.0.1:3000

If HTML is returned, the app is reachable from the host.

------------------------------------------------------------------------

## 3. Nginx Installation

Install Nginx on Debian:

sudo apt update sudo apt install nginx -y

Enable and start:

sudo systemctl enable nginx sudo systemctl start nginx

------------------------------------------------------------------------

## 4. Nginx Reverse Proxy Configuration

Create site config:

sudo nano /etc/nginx/sites-available/baruashub

Example config:

server {{ listen 80; server_name studexhub.com www.studexhub.com;

    client_max_body_size 10M;

    location / {{
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }}

}}

Enable site:

sudo ln -s /etc/nginx/sites-available/baruashub
/etc/nginx/sites-enabled/ sudo rm -f /etc/nginx/sites-enabled/default

Reload:

sudo nginx -t sudo systemctl reload nginx

------------------------------------------------------------------------

## 5. Domain Purchase

Domain used:

studexhub.com

Purchased via **Cloudflare Registrar**.

Benefits: - wholesale pricing - transparent renewal - direct Cloudflare
integration

------------------------------------------------------------------------

## 6. Cloudflared Installation

Add Cloudflare key:

curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg \| sudo tee
/usr/share/keyrings/cloudflare-main.gpg \>/dev/null

Add repo:

echo 'deb \[signed-by=/usr/share/keyrings/cloudflare-main.gpg\]
https://pkg.cloudflare.com/cloudflared any main' \| sudo tee
/etc/apt/sources.list.d/cloudflared.list

Update:

sudo apt update

Install:

sudo apt install cloudflared

Verify:

cloudflared --version

------------------------------------------------------------------------

## 7. Authorize Machine

cloudflared tunnel login

Choose domain:

studexhub.com

Credentials saved in:

\~/.cloudflared/

------------------------------------------------------------------------

## 8. Create Tunnel

cloudflared tunnel create studexhub

Files created:

\~/.cloudflared/cert.pem \~/.cloudflared/`<tunnel-id>`{=html}.json

------------------------------------------------------------------------

## 9. Tunnel Config

nano \~/.cloudflared/config.yml

Example:

tunnel: studexhub credentials-file:
/home/grey/.cloudflared/TUNNEL-ID.json

ingress: - hostname: studexhub.com service: http://localhost:80 -
hostname: www.studexhub.com service: http://localhost:80 - service:
http_status:404

------------------------------------------------------------------------

## 10. Connect Domain

cloudflared tunnel route dns studexhub studexhub.com cloudflared tunnel
route dns studexhub www.studexhub.com

------------------------------------------------------------------------

## 11. Run Tunnel

cloudflared tunnel run studexhub

Public site becomes available:

https://studexhub.com

Stop tunnel with:

CTRL + C

------------------------------------------------------------------------

## 12. Development Workflow

1.  docker compose up -d
2.  sudo systemctl start nginx
3.  cloudflared tunnel run studexhub

------------------------------------------------------------------------

## 13. Production Plan

On real server:

-   install Docker
-   deploy project
-   configure Nginx
-   install cloudflared
-   copy tunnel config
-   run cloudflared as system service

sudo cloudflared service install sudo systemctl enable cloudflared sudo
systemctl start cloudflared

------------------------------------------------------------------------

## 14. Security Notes

Current dev setup exposes Postgres for Prisma Studio.

Production recommendation:

-   do not expose port 5432 publicly
-   keep database inside Docker network

------------------------------------------------------------------------

## 15. OAuth Reminder

Add production redirect URL:

https://studexhub.com/api/auth/callback/google

------------------------------------------------------------------------

## 16. Summary

Working stack:

Docker → Nginx → Cloudflare Tunnel → Cloudflare DNS → Internet
