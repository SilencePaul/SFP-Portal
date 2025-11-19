# Kubernetes Deployment Guide for DigitalOcean

## Prerequisites

- Docker images built and pushed to container registry
- kubectl installed: `brew install kubectl` (macOS) or from [kubernetes.io](https://kubernetes.io/docs/tasks/tools/)
- doctl installed: `brew install doctl` or [download](https://github.com/digitalocean/doctl)
- DigitalOcean account with billing configured

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│         DigitalOcean Kubernetes (DOKS)              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐      ┌──────────────┐            │
│  │   API Pod    │      │   Web Pod    │            │
│  │  (Replicas)  │      │ (Replicas)   │            │
│  └──────────────┘      └──────────────┘            │
│         │                     │                     │
│  ┌──────┴──────────────────────┴───────┐           │
│  │   Service (LoadBalancer/Ingress)    │           │
│  └────────────────────────────────────┘            │
│                                                     │
│  ┌─────────────────────────────────────┐           │
│  │   PostgreSQL StatefulSet            │           │
│  │   Redis StatefulSet                 │           │
│  │   Persistent Volumes                │           │
│  └─────────────────────────────────────┘           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Step 1: Create DigitalOcean Container Registry

```bash
# Authenticate with DigitalOcean
doctl auth init

# Create registry (one-time)
doctl registry create sfp-portal-registry --region nyc3

# Verify
doctl registry get sfp-portal-registry
```

## Step 2: Push Docker Images

```bash
# Authenticate Docker with registry
doctl registry login

# Build images
docker build -t sfp-api:latest ./api
docker build -t sfp-web:latest ./web

# Tag for registry
docker tag sfp-api:latest registry.digitalocean.com/sfp-portal-registry/sfp-api:latest
docker tag sfp-web:latest registry.digitalocean.com/sfp-portal-registry/sfp-web:latest

# Push to registry
docker push registry.digitalocean.com/sfp-portal-registry/sfp-api:latest
docker push registry.digitalocean.com/sfp-portal-registry/sfp-web:latest

# Verify
doctl registry repository list sfp-portal-registry
```

## Step 3: Create DigitalOcean Kubernetes Cluster

```bash
# List available options
doctl kubernetes options versions
doctl kubernetes options regions

# Create cluster (this takes 5-10 minutes)
doctl kubernetes cluster create sfp-portal-cluster \
  --region nyc3 \
  --version latest \
  --node-pool name=default-pool;size=s-2vcpu-2gb;count=3 \
  --auto-upgrade

# Wait for cluster to be ready
doctl kubernetes cluster get sfp-portal-cluster

# Configure kubectl
doctl kubernetes cluster kubeconfig save sfp-portal-cluster

# Verify connection
kubectl get nodes
kubectl get pods --all-namespaces
```

## Step 4: Deploy to Kubernetes

### Option A: Apply YAML Manifests (Recommended)

```bash
# Create namespace
kubectl create namespace sfp-portal

# Apply manifests (in order)
kubectl apply -f infra/k8s/01-configmap.yaml
kubectl apply -f infra/k8s/02-secret.yaml
kubectl apply -f infra/k8s/03-postgres-pvc.yaml
kubectl apply -f infra/k8s/04-postgres-deployment.yaml
kubectl apply -f infra/k8s/05-redis-deployment.yaml
kubectl apply -f infra/k8s/06-api-deployment.yaml
kubectl apply -f infra/k8s/07-web-deployment.yaml
kubectl apply -f infra/k8s/08-ingress.yaml

# Verify all pods are running
kubectl get pods -n sfp-portal
```

### Option B: Using Helm (Advanced)

```bash
# Install Helm
brew install helm

# Add repo (if using community charts)
helm repo add bitnami https://charts.bitnami.com/bitnami

# Deploy PostgreSQL
helm install postgres bitnami/postgresql \
  -n sfp-portal \
  --set auth.password=your-password

# Deploy Redis
helm install redis bitnami/redis \
  -n sfp-portal \
  --set auth.password=your-password

# Deploy API and Web
helm install sfp-portal ./helm-chart
```

## Step 5: Verify Deployment

```bash
# Check all resources
kubectl get all -n sfp-portal

# Get pod details
kubectl describe pod <pod-name> -n sfp-portal

# View logs
kubectl logs <pod-name> -n sfp-portal

# Check service endpoints
kubectl get svc -n sfp-portal

# Monitor in real-time
kubectl get pods -n sfp-portal --watch
```

## Step 6: Access Your Application

### Via Ingress (Recommended for Production)

```bash
# Get Ingress IP
kubectl get ingress -n sfp-portal

# Access via domain (after DNS is configured)
https://your-domain.com
```

### Via Port Forwarding (Development)

```bash
# Forward API
kubectl port-forward svc/api 5000:5000 -n sfp-portal

# Forward Web
kubectl port-forward svc/web 3000:3000 -n sfp-portal

# Then access locally:
# API: http://localhost:5000
# Web: http://localhost:3000
```

## Step 7: Configure Domain & HTTPS

```bash
# Get LoadBalancer IP
kubectl get service web -n sfp-portal

# Add DNS A record in your domain registrar pointing to LoadBalancer IP

# Install cert-manager for HTTPS
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create certificate issuer
kubectl apply -f infra/k8s/cert-issuer.yaml

# Update Ingress for HTTPS
kubectl apply -f infra/k8s/ingress-tls.yaml
```

## Step 8: Setup Monitoring & Logging

```bash
# Enable DigitalOcean metrics
doctl kubernetes cluster update sfp-portal-cluster \
  --enable-monitoring

# View metrics in DigitalOcean Dashboard
# https://cloud.digitalocean.com/kubernetes/clusters

# Check logs
kubectl logs -f <pod-name> -n sfp-portal

# Advanced: Install Prometheus + Grafana
kubectl apply -f infra/k8s/prometheus-stack.yaml
```

## Common Kubectl Commands

```bash
# Namespaces
kubectl get namespaces
kubectl create namespace sfp-portal
kubectl delete namespace sfp-portal

# Pods
kubectl get pods -n sfp-portal
kubectl describe pod <name> -n sfp-portal
kubectl logs <pod-name> -n sfp-portal
kubectl exec -it <pod-name> -n sfp-portal -- /bin/sh
kubectl delete pod <name> -n sfp-portal

# Deployments
kubectl get deployments -n sfp-portal
kubectl rollout status deployment/api -n sfp-portal
kubectl rollout restart deployment/api -n sfp-portal
kubectl scale deployment/api --replicas=5 -n sfp-portal

# Services
kubectl get svc -n sfp-portal
kubectl describe svc <name> -n sfp-portal

# ConfigMaps & Secrets
kubectl get configmap -n sfp-portal
kubectl get secrets -n sfp-portal
kubectl describe configmap <name> -n sfp-portal

# Ingress
kubectl get ingress -n sfp-portal
kubectl describe ingress <name> -n sfp-portal
```

## Troubleshooting

### Pod won't start

```bash
kubectl describe pod <name> -n sfp-portal
kubectl logs <name> -n sfp-portal
```

### Image pull errors

```bash
# Verify registry credentials are in cluster
kubectl get secrets -n sfp-portal

# Check image exists in registry
doctl registry repository list sfp-portal-registry
```

### Database connection errors

```bash
# Ensure database pod is running
kubectl get pods -n sfp-portal | grep postgres

# Check database logs
kubectl logs postgres-0 -n sfp-portal

# Test connection from API pod
kubectl exec -it api-0 -n sfp-portal -- psql -h postgres -U postgres
```

### Ingress not working

```bash
# Check Ingress status
kubectl describe ingress sfp-ingress -n sfp-portal

# Verify LoadBalancer service
kubectl get svc -n sfp-portal | grep web

# Get LoadBalancer IP
kubectl get svc web -n sfp-portal
```

## Scaling & Performance

```bash
# Scale API replicas
kubectl scale deployment api --replicas=5 -n sfp-portal

# Horizontal Pod Autoscaler
kubectl apply -f infra/k8s/hpa.yaml

# Check autoscaling
kubectl get hpa -n sfp-portal
```

## Backup & Disaster Recovery

```bash
# Backup database
kubectl exec postgres-0 -n sfp-portal -- \
  pg_dump -U postgres sfp_portal > backup.sql

# Restore database
kubectl exec -i postgres-0 -n sfp-portal -- \
  psql -U postgres < backup.sql

# Backup volumes (DigitalOcean Dashboard)
# https://cloud.digitalocean.com/volumes
```

## Cleanup

```bash
# Delete all resources
kubectl delete namespace sfp-portal

# Delete cluster
doctl kubernetes cluster delete sfp-portal-cluster
```

## Cost Optimization Tips

1. **Use appropriate node sizes** - Start with s-2vcpu-2gb
2. **Set resource requests/limits** - See k8s deployment manifests
3. **Use Horizontal Pod Autoscaler** - Scale based on load
4. **Enable node autoscaling** - Let cluster scale automatically
5. **Use spot nodes for non-critical workloads** - DigitalOcean App Platform

## Next Steps

1. ✅ Docker images created and tested locally
2. ✅ Push images to DigitalOcean Container Registry
3. ✅ Create Kubernetes cluster on DOKS
4. ✅ Deploy application
5. 📋 Configure monitoring and alerting
6. 📋 Setup CI/CD pipeline (GitHub Actions, etc.)
7. 📋 Configure backups and disaster recovery

## Support & Resources

- [DigitalOcean Kubernetes Docs](https://docs.digitalocean.com/products/kubernetes/)
- [Kubernetes Official Docs](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
