import client from "prom-client";

// Create a registry
const register = new client.Registry();

// Default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

const httpRequestTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const httpRequestSize = new client.Histogram({
  name: "http_request_size_bytes",
  help: "Size of HTTP requests in bytes",
  labelNames: ["method", "route"],
  buckets: [100, 1000, 5000, 10000, 50000],
  registers: [register],
});

const httpResponseSize = new client.Histogram({
  name: "http_response_size_bytes",
  help: "Size of HTTP responses in bytes",
  labelNames: ["method", "route", "status_code"],
  buckets: [100, 1000, 5000, 10000, 50000],
  registers: [register],
});

const dbQueryDuration = new client.Histogram({
  name: "db_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["operation", "table"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

const dbQueryTotal = new client.Counter({
  name: "db_queries_total",
  help: "Total number of database queries",
  labelNames: ["operation", "table", "status"],
  registers: [register],
});

// Middleware to collect HTTP metrics
export const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const route = req.route?.path || req.path;
  const method = req.method;

  // Track request size
  const requestSize = req.headers["content-length"] || 0;
  httpRequestSize.labels(method, route).observe(parseInt(requestSize) || 0);

  // Track response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = (Date.now() - startTime) / 1000;
    const statusCode = res.statusCode;

    // Record metrics
    httpRequestDuration.labels(method, route, statusCode).observe(duration);

    httpRequestTotal.labels(method, route, statusCode).inc();

    // Response size
    const responseSize = Buffer.byteLength(
      typeof data === "string" ? data : JSON.stringify(data)
    );
    httpResponseSize.labels(method, route, statusCode).observe(responseSize);

    console.log(
      `📊 [${method}] ${route} - ${statusCode} (${duration.toFixed(3)}s)`
    );

    return originalSend.call(this, data);
  };

  next();
};

export default register;
