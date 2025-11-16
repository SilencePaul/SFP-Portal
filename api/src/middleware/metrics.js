import client from "prom-client";

// Default registry
const register = client.register;

// Create metrics
const httpRequestDurationMs = new client.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "code"],
  buckets: [50, 100, 200, 300, 500, 1000, 2000],
});

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "code"],
});

// Middleware to measure request duration
export const metricsMiddleware = (req, res, next) => {
  const end = httpRequestDurationMs.startTimer();
  const route = req.route ? req.route.path : req.path || req.originalUrl;

  res.on("finish", () => {
    const labels = { method: req.method, route, code: res.statusCode };
    httpRequestsTotal.inc(labels, 1);
    end(labels);
  });

  next();
};

export default register;
