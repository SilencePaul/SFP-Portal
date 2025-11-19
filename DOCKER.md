# Docker & Kubernetes Deployment Guide

## Prerequisites

- Docker Desktop (with Docker Compose)
- kubectl (for Kubernetes)
- DigitalOcean CLI (doctl) for cloud deployment

## Local Development with Docker

### Build and Run with Docker Compose

```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f web

# Stop services
docker-compose down
```

This will start:

- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **API** on http://localhost:5000
- **Web** on http://localhost:3000

### Build Individual Images

```bash
# Build API image
docker build -t sfp-api:latest ./api

# Build Web image
docker build -t sfp-web:latest ./web

# Run API container
docker run -p 5000:5000 \
  -e DATABASE_URL=postgresql://user:pass@postgres:5432/sfp_portal \
  -e REDIS_URL=redis://redis:6379 \
  sfp-api:latest

# Run Web container
docker run -p 3000:3000 \
  -e VITE_API_BASE_URL=http://localhost:5000 \
  sfp-web:latest
```

## Image Details

### API Image

- **Base**: Node.js 20 Alpine
- **Size**: ~300MB (optimized)
- **Port**: 5000
- **Features**:
  - Multi-stage build
  - Non-root user (nodejs)
  - Health check endpoint
  - Automatic migrations on startup

### Web Image

- **Base**: Node.js 20 Alpine for build, serves with Node
- **Size**: ~150MB
- **Port**: 3000
- **Features**:
  - Multi-stage build (production optimized)
  - Non-root user (nodejs)
  - Health check
  - Vite build optimization

## Environment Variables

### API Container

```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=your-secret-key
SENDGRID_API_KEY=optional-for-emails
```

### Web Container

```
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Pushing to Container Registry

### DigitalOcean Container Registry

```bash
# Authenticate with DigitalOcean
doctl auth init

# Create container registry (one-time)
doctl registry create sfp-portal-registry

# Tag images
docker tag sfp-api:latest registry.digitalocean.com/sfp-portal-registry/sfp-api:latest
docker tag sfp-web:latest registry.digitalocean.com/sfp-portal-registry/sfp-web:latest

# Login to registry
doctl registry login

# Push images
docker push registry.digitalocean.com/sfp-portal-registry/sfp-api:latest
docker push registry.digitalocean.com/sfp-portal-registry/sfp-web:latest
```

## Next Steps: Kubernetes Deployment

See `infra/k8s/README.md` for deploying to DigitalOcean Kubernetes.
