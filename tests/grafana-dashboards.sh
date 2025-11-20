#!/bin/bash

# Grafana API credentials
GRAFANA_URL="http://localhost:3000"
GRAFANA_USER="admin"
GRAFANA_PASSWORD="admin"
DATASOURCE_ID="1"

# Helper function to create dashboard
create_dashboard() {
  local dashboard_name=$1
  local dashboard_json=$2
  
  echo "Creating dashboard: $dashboard_name"
  
  curl -s -X POST "$GRAFANA_URL/api/dashboards/db" \
    -H "Content-Type: application/json" \
    -u "$GRAFANA_USER:$GRAFANA_PASSWORD" \
    -d "$dashboard_json" | jq .
}

# Dashboard 1: CPU & Memory Usage
CPU_MEMORY_DASHBOARD='{
  "dashboard": {
    "title": "API Resource Usage",
    "panels": [
      {
        "id": 1,
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(container_cpu_usage_seconds_total{pod=~\"api-.*\"}[5m])) * 100",
            "refId": "A",
            "legendFormat": "CPU %"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "mode": "absolute",
              "steps": [
                { "color": "green", "value": null },
                { "color": "yellow", "value": 50 },
                { "color": "red", "value": 80 }
              ]
            },
            "unit": "percent"
          }
        },
        "gridPos": { "h": 8, "w": 12, "x": 0, "y": 0 }
      },
      {
        "id": 2,
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(container_memory_usage_bytes{pod=~\"api-.*\"}) / 1024 / 1024",
            "refId": "A",
            "legendFormat": "Memory MB"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "mode": "absolute",
              "steps": [
                { "color": "green", "value": null },
                { "color": "yellow", "value": 200 },
                { "color": "red", "value": 250 }
              ]
            },
            "unit": "decmbytes"
          }
        },
        "gridPos": { "h": 8, "w": 12, "x": 12, "y": 0 }
      }
    ],
    "schemaVersion": 35,
    "version": 0,
    "timezone": "utc",
    "refresh": "30s"
  }
}'

# Dashboard 2: Error Rate & Request Rate
ERROR_REQUEST_DASHBOARD='{
  "dashboard": {
    "title": "API Request & Error Metrics",
    "panels": [
      {
        "id": 1,
        "title": "Error Rate (5xx)",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status_code=~\"5..\"}[2m])) / sum(rate(http_requests_total[2m])) * 100",
            "refId": "A",
            "legendFormat": "Error Rate %"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "mode": "absolute",
              "steps": [
                { "color": "green", "value": null },
                { "color": "yellow", "value": 2 },
                { "color": "red", "value": 5 }
              ]
            },
            "unit": "percent"
          }
        },
        "gridPos": { "h": 8, "w": 12, "x": 0, "y": 0 }
      },
      {
        "id": 2,
        "title": "Request Rate (RPS)",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[1m]))",
            "refId": "A",
            "legendFormat": "RPS"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "mode": "absolute",
              "steps": [
                { "color": "green", "value": null },
                { "color": "yellow", "value": 200 },
                { "color": "red", "value": 300 }
              ]
            },
            "unit": "ops"
          }
        },
        "gridPos": { "h": 8, "w": 12, "x": 12, "y": 0 }
      }
    ],
    "schemaVersion": 35,
    "version": 0,
    "timezone": "utc",
    "refresh": "30s"
  }
}'

# Dashboard 3: Request Latency
LATENCY_DASHBOARD='{
  "dashboard": {
    "title": "API Latency & Performance",
    "panels": [
      {
        "id": 1,
        "title": "P50 Latency",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "refId": "A",
            "legendFormat": "P50"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "s"
          }
        },
        "gridPos": { "h": 8, "w": 8, "x": 0, "y": 0 }
      },
      {
        "id": 2,
        "title": "P95 Latency",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "refId": "A",
            "legendFormat": "P95"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "mode": "absolute",
              "steps": [
                { "color": "green", "value": null },
                { "color": "yellow", "value": 0.3 },
                { "color": "red", "value": 0.5 }
              ]
            },
            "unit": "s"
          }
        },
        "gridPos": { "h": 8, "w": 8, "x": 8, "y": 0 }
      },
      {
        "id": 3,
        "title": "P99 Latency",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "refId": "A",
            "legendFormat": "P99"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "s"
          }
        },
        "gridPos": { "h": 8, "w": 8, "x": 16, "y": 0 }
      }
    ],
    "schemaVersion": 35,
    "version": 0,
    "timezone": "utc",
    "refresh": "30s"
  }
}'

# Create all dashboards
create_dashboard "API Resource Usage" "$CPU_MEMORY_DASHBOARD"
create_dashboard "API Request & Error Metrics" "$ERROR_REQUEST_DASHBOARD"
create_dashboard "API Latency & Performance" "$LATENCY_DASHBOARD"

echo "✅ Dashboard creation completed"
