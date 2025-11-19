# Local Docker Setup - Validation & Testing Guide

## Prerequisites Checklist

Before running Docker locally, ensure you have:

- [ ] Docker Desktop installed ([download here](https://www.docker.com/products/docker-desktop))
- [ ] Docker running (check system tray)
- [ ] `docker` command available in terminal
- [ ] `docker compose` command available (Docker Desktop includes this)

## Troubleshooting Docker PATH Issues

If you're getting "docker: command not found", try these steps:

### Windows (PowerShell - Recommended)

```powershell
# 1. Open PowerShell AS ADMINISTRATOR
# 2. Verify Docker is installed
& "C:\Program Files\Docker\Docker\Docker.exe" --version

# 3. Restart Docker Desktop:
# - Right-click system tray → Docker icon → Quit
# - Open Docker Desktop again
# - Wait 30 seconds for startup

# 4. In a NEW terminal, test:
docker --version
docker compose --version
```

### Windows (Git Bash)

```bash
# Use this instead of standard bash
# Docker works better with PowerShell on Windows

# Or use Windows Terminal (recommended)
# Search for "Windows Terminal" in Start menu
```

### macOS/Linux

```bash
# Docker should work out of the box
# If not, ensure Docker daemon is running:
docker --version
docker compose --version
```

## Testing Steps

Once Docker is accessible:

### 1. Start Services

```bash
cd /path/to/SFP-Portal
docker compose up -d
```

### 2. Verify Services are Running

```bash
# Check all containers
docker compose ps

# Expected output:
# NAME            COMMAND                 SERVICE   STATUS
# sfp-postgres    "postgres"              postgres  Up
# sfp-redis       "redis-server"          redis     Up
# sfp-api         "sh -c node src/m..."   api       Up
# sfp-web         "serve -s dist -l..."   web       Up
```

### 3. Check Service Health

```bash
# View API logs
docker compose logs api

# View Web logs
docker compose logs web

# View Database logs
docker compose logs postgres

# Real-time monitoring
docker compose logs -f api
```

### 4. Test Endpoints

```bash
# Test API
curl http://localhost:5000/health

# Expected: HTTP 200

# Test Web
curl http://localhost:3000

# Expected: HTML response (React app)
```

### 5. Access Services

**Web UI**: http://localhost:3000

**API**: http://localhost:5000

**PostgreSQL**:

- Host: localhost
- Port: 5432
- User: postgres
- Password: postgres
- Database: sfp_portal

**Redis**: localhost:6379

## Common Issues & Solutions

### Issue: "Cannot connect to Docker daemon"

**Solution**:

- Ensure Docker Desktop is running
- Check system tray icon
- Restart Docker Desktop

### Issue: "Port already in use"

**Solution**:

```bash
# Find what's using the port (e.g., 5000)
# On Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Kill the process or use a different port:
docker compose down
```

### Issue: "Image build fails"

**Solution**:

```bash
# Clean and rebuild
docker compose down
docker system prune -a
docker compose build --no-cache
docker compose up -d
```

### Issue: "Database connection error in API logs"

**Solution**:

- Wait 30 seconds for PostgreSQL to fully start
- Check database logs: `docker compose logs postgres`
- Ensure `sfp-postgres` container is healthy

## Performance Tips

```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1

# Reduce logging verbosity
docker compose logs --tail 50 api

# Monitor resource usage
docker stats

# Cleanup unused resources
docker system prune
```

## Stopping & Cleanup

```bash
# Stop all services (keeps data)
docker compose stop

# Stop and remove containers (keeps volumes/data)
docker compose down

# Complete cleanup (removes everything including data)
docker compose down -v
```

## Database Persistence

- Database data is stored in volume: `postgres_data`
- Redis data is stored in volume: `redis_data`
- Data persists even after `docker compose down`
- To reset: `docker compose down -v`

## Next Steps

Once local testing is successful:

1. ✅ Verify all services are running
2. ✅ Confirm API and Web are accessible
3. ✅ Test database connectivity
4. 📋 **Next**: Push images to DigitalOcean Container Registry
5. 📋 **Then**: Deploy to DigitalOcean Kubernetes

See `DOCKER.md` for image registry instructions.
