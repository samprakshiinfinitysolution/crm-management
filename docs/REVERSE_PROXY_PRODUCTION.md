# Production Reverse Proxy Architecture & Remote Address Masking Guide

> **Security Status:** High / Production-Grade  
> **Goal:** Completely conceal the backend server's remote IP address, private domain, and internal ports from client browsers, while optimizing performance, SSL termination, and DDoS protection.

---

## 1. Executive Summary & Problem Definition

### The Exposure Risk
When a single-page application (SPA) or frontend browser calls a backend API directly via an absolute URL (such as `https://crm-backend.onrender.com/api` or `http://192.168.1.50:5000/api`):
1. **Direct IP Exposure:** The browser opens a TCP/TLS connection directly to the backend. In Chrome DevTools (Network tab), the **`Remote Address`** header explicitly displays the backend's real public/private IP address (e.g., `216.24.57.1:443` or `159.65.12.34:5000`).
2. **DDoS & Port Scanning:** Attackers bypass any CDN / Cloudflare Web Application Firewall (WAF) and launch direct layer-7 DDoS or brute-force attacks against the origin backend.
3. **CORS & Cookie Complications:** Browsers treat cross-origin requests with strict third-party cookie restrictions, risking token rejection on Safari / iOS.

---

## 2. Three-Tier Concealment Architecture

```text
[ Browser / Client ]
        │
        │ Requests: "GET /api/leads", "WSS /socket.io"
        │ Remote Address visible to user: 104.21.5.12:443 (Cloudflare/Nginx ONLY)
        ▼
┌──────────────────────────────────────────────────────────────┐
│  Tier 1: Edge Reverse Proxy (Nginx / Caddy / Cloudflare)     │
│  - Public Ports: 80, 443 ONLY                                │
│  - Terminates TLS (SSL/HTTP2)                                │
│  - Strips Server & X-Powered-By headers                      │
│  - Enforces IP Rate Limiting                                 │
└──────────────────────────────────────────────────────────────┘
        │                                      │
        │ proxy_pass /                         │ proxy_pass /api/ & /socket.io/
        │ (Internal Bridge Network)            │ (Internal Bridge Network)
        ▼                                      ▼
┌──────────────────────────────┐       ┌──────────────────────────────┐
│  Tier 2: Next.js Frontend    │       │  Tier 3: Express Backend     │
│  - Internal Port: 3000       │       │  - Internal Port: 5000       │
│  - NO public port binding    │       │  - NO public port binding    │
│  - Server Components & SSR   │       │  - Trust Proxy: 1 hop        │
└──────────────────────────────┘       │  - Access & Refresh Rotation │
                                       └──────────────────────────────┘
                                                       │
                                        ┌──────────────┴──────────────┐
                                        ▼                             ▼
                                ┌──────────────┐              ┌──────────────┐
                                │  PostgreSQL  │              │  Redis Cache │
                                │  (Port 5432) │              │  (Port 6379) │
                                │  No public   │              │  No public   │
                                └──────────────┘              └──────────────┘
```

---

## 3. Implementation Details

### Tier 1: Client-Side URL Resolution
In [`frontend/src/store/api/baseApi.ts`](file:///c:/Users/mayan/Desktop/test/CRM/frontend/src/store/api/baseApi.ts), [`frontend/src/lib/api.ts`](file:///c:/Users/mayan/Desktop/test/CRM/frontend/src/lib/api.ts), and [`frontend/src/lib/exportUtils.ts`](file:///c:/Users/mayan/Desktop/test/CRM/frontend/src/lib/exportUtils.ts):
- When running in the browser (`typeof window !== "undefined"`), the base URL is always relative: `"/api"`.
- The browser dispatches requests to `https://crm.yourcompany.com/api/...` (Same-Origin).
- **Result:** The browser never initiates a direct socket connection to the backend server.

### Tier 2: Next.js BFF Reverse Proxy (`next.config.ts`)
- Configured with `poweredByHeader: false` to eliminate runtime fingerprinting.
- Next.js server-side rewrites route `/api/:path*` and `/socket.io/:path*` directly to `INTERNAL_BACKEND_URL` on the server-side.
- Private environment variables (`INTERNAL_BACKEND_URL`, `BACKEND_URL`) are never prefixed with `NEXT_PUBLIC_`, ensuring they are never bundled into client JavaScript.

### Tier 3: Edge Reverse Proxy (`reverse-proxy/nginx.conf` & `docker-compose.prod.yml`)
- Nginx binds to ports `80` and `443` and handles all public inbound traffic.
- All backend services (`backend`, `postgres`, `redis`) reside on an internal Docker bridge network (`crm-internal-network`) with **zero public port mappings**.
- Even if an attacker scans the host server with `nmap`, ports `5000`, `5432`, and `6379` are closed to the public internet.

---

## 4. How to Deploy in Production

### Option A: Docker Compose (Recommended)
1. Ensure your environment variables are configured in `.env.prod`.
2. Place your SSL certificates in `reverse-proxy/ssl/fullchain.pem` and `reverse-proxy/ssl/privkey.pem` (or use Certbot challenge).
3. Start the entire isolated stack:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
4. Verify port isolation:
   ```bash
   docker ps
   ```
   *Expected:* Only `crm-reverse-proxy` has `0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp`. `backend`, `postgres`, and `redis` only show internal ports.

### Option B: Dedicated VPS (Ubuntu/Debian) with Nginx
1. Install Nginx:
   ```bash
   sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
   ```
2. Copy [`reverse-proxy/nginx.conf`](file:///c:/Users/mayan/Desktop/test/CRM/reverse-proxy/nginx.conf) to `/etc/nginx/sites-available/crm.conf`.
3. Enable the site and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/crm.conf /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
4. Firewall backend port:
   ```bash
   # Block public access to port 5000, 5432, 6379
   sudo ufw default deny incoming
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

### Option C: Cloudflare Proxy (Orange Cloud)
1. Point your domain DNS A-record to your server IP with **Proxy status: Proxied** (Orange Cloud).
2. Set Cloudflare SSL/TLS mode to **Full (Strict)**.
3. In this setup, client DevTools will show Cloudflare Anycast IPs (e.g. `104.21.x.x`), completely hiding your origin server IP as well.

---

## 5. Verification Checklist

To verify that the backend remote address is properly hidden:
1. Open your CRM in Chrome / Firefox: `https://crm.yourcompany.com/login`.
2. Open **Developer Tools** (`F12`) -> **Network** tab.
3. Log in or trigger any API action (e.g., fetch leads).
4. Click on any `/api/...` request (e.g. `/api/auth/login` or `/api/leads`):
   - **Request URL:** `https://crm.yourcompany.com/api/...` (No port 5000, no backend hostname).
   - **Remote Address:** Displays only your reverse proxy / Cloudflare IP (e.g. `<Your_Domain_IP>:443`).
   - **Response Headers:** `Server` and `X-Powered-By` are suppressed.
5. In Network -> **WS (WebSockets)** tab:
   - `socket.io` request connects to `wss://crm.yourcompany.com/socket.io/...`.
   - **Remote Address:** Displays only `<Your_Domain_IP>:443`.
