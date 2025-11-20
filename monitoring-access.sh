#!/bin/bash

# SFP Portal - Quick Monitoring Access Commands

echo "🚀 SFP Portal Monitoring - Quick Start Guide"
echo "=============================================="
echo ""

# Port-forward Grafana
echo "📊 Starting Grafana port-forward..."
kubectl port-forward -n sfp-portal svc/monitoring-grafana 3000:80 &
GRAFANA_PID=$!
sleep 2
echo "   ✅ Grafana running at: http://localhost:3000"
echo "   📝 Credentials: admin / admin"
echo ""

# Port-forward Prometheus
echo "📈 Starting Prometheus port-forward..."
kubectl port-forward -n sfp-portal svc/monitoring-kube-prometheus-prometheus 9090:9090 &
PROM_PID=$!
sleep 2
echo "   ✅ Prometheus running at: http://localhost:9090"
echo ""

# Port-forward AlertManager
echo "🚨 Starting AlertManager port-forward..."
kubectl port-forward -n sfp-portal svc/monitoring-kube-prometheus-alertmanager 9093:9093 &
ALERT_PID=$!
sleep 2
echo "   ✅ AlertManager running at: http://localhost:9093"
echo ""

# Monitoring status
echo "📋 Monitoring Components Status:"
echo "   ================================"
kubectl get pods -n sfp-portal -l "release=monitoring" -o wide
echo ""

# Service Monitor status
echo "🔍 ServiceMonitors (Auto-discovery enabled):"
kubectl get servicemonitor -n sfp-portal
echo ""

# Alert Rules status
echo "🚨 Alert Rules Active:"
kubectl get prometheusrule -n sfp-portal | grep api-alerts
echo ""

echo "=============================================="
echo "📚 How to use:"
echo ""
echo "1. Open Grafana:     http://localhost:3000"
echo "   - Login with admin/admin"
echo "   - Look for 'SFP Portal - API Metrics' dashboard"
echo ""
echo "2. Check Prometheus:  http://localhost:9090"
echo "   - Graph tab to query metrics"
echo "   - Alerts tab to see active/firing alerts"
echo ""
echo "3. View AlertManager: http://localhost:9093"
echo "   - See all fired alerts and routing status"
echo ""
echo "🎯 Key Metrics to Monitor:"
echo "   - CPU Usage: sum(rate(container_cpu_usage_seconds_total{pod=~\"api-.*\"}[5m])) * 100"
echo "   - Error Rate: sum(rate(http_requests_total{status_code=~\"5..\"}[2m])) / sum(rate(http_requests_total[2m])) * 100"
echo "   - Request Rate: sum(rate(http_requests_total[1m]))"
echo "   - P95 Latency: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))"
echo ""
echo "⚠️  Alert Thresholds:"
echo "   - CPU >80% (5 min)  → CRITICAL"
echo "   - Memory >75% (10 min) → WARNING"
echo "   - Error Rate >5% (2 min) → CRITICAL"
echo "   - P95 Latency >500ms (5 min) → WARNING"
echo "   - RPS spike >300% (2 min) → WARNING"
echo "   - Pod Down 2+ min → CRITICAL"
echo ""
echo "Press Ctrl+C to stop port-forwards"
echo "=============================================="

# Keep script running
wait
