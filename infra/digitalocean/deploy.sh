#!/bin/bash
# SFP-Portal Deployment Script for DigitalOcean
# This script automates the deployment to DOKS (DigitalOcean Kubernetes Service)

set -e

# Configuration
CLUSTER_NAME="sfp-portal"
REGISTRY_NAME="sfp-portal"
REGISTRY_REGION="nyc3"
DO_REGION="nyc3"
NAMESPACE="sfp-portal"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${GREEN}▶ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    if ! command -v doctl &> /dev/null; then
        print_error "doctl not found. Install it with: brew install doctl"
        exit 1
    fi
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl not found. Install it with: brew install kubectl"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "docker not found. Install Docker Desktop or run: brew install docker"
        exit 1
    fi
    
    print_success "All prerequisites found"
}

# Verify doctl authentication
verify_doctl() {
    print_step "Verifying doctl authentication..."
    
    if ! doctl auth validate &> /dev/null; then
        print_error "Not authenticated with DigitalOcean. Run: doctl auth init"
        exit 1
    fi
    
    print_success "doctl authenticated"
}

# Get or create DOKS cluster
setup_doks_cluster() {
    print_step "Setting up DOKS cluster..."
    
    if doctl kubernetes cluster get $CLUSTER_NAME --format Name --no-header &> /dev/null; then
        print_info "Cluster '$CLUSTER_NAME' already exists"
    else
        print_info "Creating cluster '$CLUSTER_NAME' in $DO_REGION..."
        doctl kubernetes cluster create $CLUSTER_NAME \
            --count 2 \
            --region $DO_REGION \
            --version latest \
            --enable-metrics
        print_success "Cluster created"
    fi
    
    print_step "Downloading kubeconfig..."
    doctl kubernetes cluster kubeconfig save $CLUSTER_NAME
    print_success "kubeconfig updated"
}

# Create container registry
setup_registry() {
    print_step "Setting up DigitalOcean Container Registry..."
    
    if doctl registry get $REGISTRY_NAME &> /dev/null 2>&1; then
        print_info "Registry '$REGISTRY_NAME' already exists"
    else
        print_info "Creating registry '$REGISTRY_NAME'..."
        doctl registry create $REGISTRY_NAME --region $REGISTRY_REGION
        print_success "Registry created"
    fi
    
    print_step "Authenticating Docker with DOCR..."
    doctl registry login --expiry-seconds 999999999
    print_success "Docker authenticated with DOCR"
}

# Build and push Docker images
build_and_push_images() {
    print_step "Building and pushing Docker images..."
    
    REGISTRY="registry.digitalocean.com/$REGISTRY_NAME"
    
    print_info "Building API image..."
    docker build -t $REGISTRY/api:latest ./api
    print_success "API image built"
    
    print_info "Pushing API image to DOCR..."
    docker push $REGISTRY/api:latest
    print_success "API image pushed"
    
    print_info "Building Web image..."
    docker build -t $REGISTRY/web:latest ./web
    print_success "Web image built"
    
    print_info "Pushing Web image to DOCR..."
    docker push $REGISTRY/web:latest
    print_success "Web image pushed"
}

# Setup kubectl authentication
setup_kubectl() {
    print_step "Setting up kubectl..."
    
    print_info "Creating namespace..."
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    print_success "Namespace '$NAMESPACE' ready"
    
    print_step "Creating image pull secret..."
    doctl registry create-docker-config --expiry-seconds 999999999 | \
        kubectl create secret generic regcred \
        --from-file=.dockerconfigjson=/dev/stdin \
        -n $NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -
    print_success "Image pull secret created"
}

# Deploy manifests
deploy_manifests() {
    print_step "Deploying Kubernetes manifests..."
    
    MANIFEST_DIR="infra/digitalocean"
    
    print_info "Applying ConfigMap..."
    kubectl apply -f $MANIFEST_DIR/01-configmap.yaml
    
    print_info "Applying Secret (update with actual values first!)..."
    kubectl apply -f $MANIFEST_DIR/02-secret.yaml
    
    print_info "Deploying Redis..."
    kubectl apply -f $MANIFEST_DIR/03-redis.yaml
    
    print_info "Deploying API..."
    kubectl apply -f $MANIFEST_DIR/04-api.yaml
    
    print_info "Deploying Web..."
    kubectl apply -f $MANIFEST_DIR/05-web.yaml
    
    print_success "All manifests deployed"
}

# Wait for deployments
wait_for_deployment() {
    print_step "Waiting for all services to be ready..."
    
    print_info "Waiting for API LoadBalancer IP..."
    API_IP=$(kubectl get svc api -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    while [ -z "$API_IP" ]; do
        sleep 5
        API_IP=$(kubectl get svc api -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    done
    print_success "API LoadBalancer IP: $API_IP"
    
    print_info "Waiting for Web LoadBalancer IP..."
    WEB_IP=$(kubectl get svc web -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    while [ -z "$WEB_IP" ]; do
        sleep 5
        WEB_IP=$(kubectl get svc web -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    done
    print_success "Web LoadBalancer IP: $WEB_IP"
    
    print_info "Waiting for all pods to be ready..."
    kubectl wait --for=condition=ready pod -l app=api -n $NAMESPACE --timeout=300s 2>/dev/null || true
    kubectl wait --for=condition=ready pod -l app=web -n $NAMESPACE --timeout=300s 2>/dev/null || true
}

# Show deployment info
show_deployment_info() {
    print_step "Deployment Information:"
    echo ""
    echo "Cluster: $CLUSTER_NAME"
    echo "Namespace: $NAMESPACE"
    echo "Registry: registry.digitalocean.com/$REGISTRY_NAME"
    echo ""
    
    print_info "Services:"
    kubectl get svc -n $NAMESPACE
    echo ""
    
    print_info "Pods:"
    kubectl get pods -n $NAMESPACE
    echo ""
    
    print_info "Next steps:"
    echo "1. Update ConfigMap and Secret with your actual configuration"
    echo "2. Set up DNS records pointing to the LoadBalancer IPs"
    echo "3. Set up SSL certificates (see DIGITALOCEAN_DEPLOYMENT.md for details)"
    echo ""
}

# Main execution
main() {
    echo ""
    print_step "Starting SFP-Portal Deployment to DigitalOcean"
    echo ""
    
    check_prerequisites
    verify_doctl
    setup_doks_cluster
    setup_registry
    build_and_push_images
    setup_kubectl
    
    # Warn about secrets
    echo ""
    print_info "IMPORTANT: Before deploying, update these files with your actual values:"
    echo "  - infra/digitalocean/02-secret.yaml (database credentials, JWT secret)"
    echo "  - infra/digitalocean/01-configmap.yaml (domain URLs)"
    echo ""
    read -p "Press Enter to continue with deployment (Ctrl+C to cancel)..."
    echo ""
    
    deploy_manifests
    wait_for_deployment
    show_deployment_info
    
    print_success "Deployment complete!"
}

# Run main function
main
