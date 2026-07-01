# Runbook

## Purpose

This runbook is for developers, team members, and graders who need to set up, run, or troubleshoot the CityBite Bangkok digital ordering system. It covers local development environment setup, starting and stopping services, Keycloak configuration, and common issues.

All commands below are run from the `codes/` directory inside the monorepo unless otherwise stated.

---

## Prerequisites

Install the following before setting up the project:

| Tool | Minimum Version | Purpose |
|------|----------------|---------|
| Docker Desktop | Latest stable | Runs all services in containers |
| Docker Compose | v2 (bundled with Docker Desktop) | Orchestrates multi-container setup |
| Git | Any recent version | Clone the repository |

No local installation of Java, Node.js, or PostgreSQL is required — everything runs inside Docker.

---

## Environment Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd software-engineering-term-project-team-03/codes
```

### 2. Create the root `.env` file

Copy the example and fill in the required values:

```bash
cp .env.example .env
```

Edit `codes/.env` with your values:

```env
# Database
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=restaurant
DB_PORT=5432

# Keycloak
KEYCLOAK_URL=http://localhost/auth/
KEYCLOAK_INTERNAL_URL=http://keycloak:8080/auth
KEYCLOAK_REALM=restaurant-realm
KEYCLOAK_CLIENT_ID=restaurant-app
KEYCLOAK_ADMIN_USER=your_keycloak_admin
KEYCLOAK_ADMIN_PASSWORD=your_keycloak_admin_password

# Ports (used by docker-compose-local.yml only)
BACKEND_PORT=8080
FRONTEND_PORT=5173
```

### 3. Create the frontend `.env` file

```bash
cp frontend/restaurant/.env.example frontend/restaurant/.env
```

The frontend `.env` values are pre-filled for local use and generally do not need changes:

```env
VITE_API_URL=/api
VITE_KEYCLOAK_URL=http://localhost/auth
VITE_REALM=restaurant-realm
VITE_CLIENT_ID=restaurant-app
```

### 4. Keycloak realm configuration

The Keycloak realm is automatically imported from `codes/realm-config.json` when the `keycloak` container starts for the first time (via the `--import-realm` flag). No manual import is needed on a fresh setup.

If the realm is missing after startup (e.g. after wiping the `keycloak_data` volume), import it manually:
1. Open `http://localhost/auth/admin` in a browser
2. Log in with `KEYCLOAK_ADMIN_USER` / `KEYCLOAK_ADMIN_PASSWORD`
3. Select **Create realm** → **Browse** → upload `codes/realm-config.json` → **Create**

---

## Starting the System

### Standard (production-like) — NGINX proxy on port 80

All traffic goes through NGINX on `http://localhost`. Frontend, backend, and Keycloak are not exposed directly.

```bash
cd codes
docker compose -f docker-compose.db.yml -f docker-compose.yml up --build
```

| URL | Service |
|-----|---------|
| `http://localhost/` | Customer-facing frontend |
| `http://localhost/api/` | Backend REST API |
| `http://localhost/auth/` | Keycloak authentication |
| `http://localhost/auth/admin` | Keycloak Admin Console |

### Local development — with hot reload and exposed ports

Frontend and backend ports are exposed directly for faster development iteration. Live reload is enabled for both frontend (Vite) and backend (sync on source change).

```bash
cd codes
docker compose -f docker-compose.db.yml -f docker-compose-local.yml up --build
```

| URL | Service |
|-----|---------|
| `http://localhost:5173` | Frontend (Vite dev server) |
| `http://localhost:8080` | Backend API |
| `http://localhost/auth/` | Keycloak (still via NGINX) |

### Database only

Start only PostgreSQL without any application services:

```bash
cd codes
docker compose -f docker-compose.db.yml up -d
```

---

## Stopping the System

```bash
docker compose down
```

To also remove persistent volumes (wipes the database and Keycloak data — use with caution):

```bash
docker compose down -v
```

---

## Routine Tasks

### Create a staff or owner account

Staff and owner accounts are managed through the Keycloak Admin Console — there is no self-registration flow.

1. Open `http://localhost/auth/admin` and log in
2. Select the **restaurant-realm** realm
3. Go to **Users** → **Add user**
4. Fill in the username and email, then click **Create**
5. Go to the **Credentials** tab → set a password (disable "Temporary" if you do not want the user to be forced to change it)
6. Go to the **Role mapping** tab → assign either `STAFF` or `OWNER`

### Reset the database

Stop all services, remove the database volume, and restart:

```bash
docker compose down -v
docker compose -f docker-compose.db.yml -f docker-compose.yml up --build
```

### View application logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f keycloak
docker compose logs -f proxy
```

### Rebuild after code changes

```bash
docker compose -f docker-compose.db.yml -f docker-compose.yml up --build
```

In local dev mode, the `develop.watch` configuration in `docker-compose-local.yml` syncs source file changes automatically without a full rebuild.

---

## Troubleshooting

### Backend crashes immediately on startup

**Cause:** Spring Boot started before PostgreSQL was ready to accept connections.

**Fix:** Restart the backend container after the database is fully up:
```bash
docker compose restart backend
```

Long-term fix: add a `depends_on` health check for the `db` service in `docker-compose.yml`.

---

### Staff dashboard returns 401 Unauthorized

**Cause:** The frontend is not attaching the Keycloak JWT to API requests, or the Keycloak realm is not configured correctly.

**Diagnosis:**
1. Open browser DevTools → Network tab
2. Find a `/api/` request from the staff dashboard
3. Check that the request has an `Authorization: Bearer <token>` header

**Fix:** If the header is missing, verify that the Keycloak adapter in the frontend (`keycloak.ts`) is initialized before the API client makes requests, and that `getToken()` is called and included in the shared `apiClient`.

---

### Keycloak login page not loading / redirect fails

**Cause:** `KEYCLOAK_URL` in `.env` does not match what the browser sees, or the Keycloak container has not imported the realm yet.

**Fix:**
1. Confirm `KEYCLOAK_URL=http://localhost/auth/` in `codes/.env`
2. Confirm `VITE_KEYCLOAK_URL=http://localhost/auth` in `frontend/restaurant/.env`
3. Check Keycloak logs: `docker compose logs -f keycloak`
4. If the realm is missing, import it manually via the Admin Console (see Environment Setup step 4)

---

### Frontend shows blank page or "Network Error"

**Cause:** Backend is not running, or `VITE_API_URL` does not match the NGINX proxy path.

**Fix:**
1. Confirm the backend container is running: `docker compose ps`
2. Confirm `VITE_API_URL=/api` in `frontend/restaurant/.env`
3. Check backend logs for startup errors: `docker compose logs backend`

---

### `docker compose up` fails with "port already in use"

**Cause:** Port 80 (or 5173/8080 in local mode) is in use by another process.

**Fix:**
```bash
# Find what is using port 80
sudo lsof -i :80

# Kill the process or stop the conflicting service, then retry
docker compose up --build
```

---

### Changes to source code not reflected after save (local mode)

**Cause:** The Docker watch sync may have stalled.

**Fix:** Restart the affected container:
```bash
docker compose restart frontend
# or
docker compose restart backend
```

---

## Service Architecture Summary

```
Browser
  └── http://localhost (port 80)
        └── NGINX proxy (proxy service)
              ├── /          → frontend:5173  (React/Vite)
              ├── /api/      → backend:8080   (Spring Boot)
              └── /auth      → keycloak:8080  (Keycloak 25.0)

backend → db:5432 (PostgreSQL 16)
```

All services share the `my_app_network` Docker network. Only NGINX exposes a port to the host machine in the standard setup.