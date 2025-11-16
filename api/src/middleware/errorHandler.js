const errorHandler = (err, req, res, next) => {
  // Log detailed error information including request details
  console.error("Error occurred:", {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
  });

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let data = err.data || null;

  // Handle specific error types
  if (err.name === "ValidationError" || err.errors) {
    // Handle validation errors from express-validator
    statusCode = 400;
    message = "Validation failed";
    data = err.errors || err.data;
  } else if (err.original && err.original.code === "23505") {
    // Handle PostgreSQL unique constraint violation
    statusCode = 400;
    message = "Duplicate entry - this record already exists";
    data = process.env.NODE_ENV !== "production" ? err.original : null;
  } else if (err.name === "UnauthorizedError") {
    // Handle JWT errors
    statusCode = 401;
    message = "Authentication failed";
  } else if (err.name === "NotFoundError") {
    // Handle not found errors
    statusCode = 404;
    message = "Resource not found";
  } else if (err.name === "SequelizeDatabaseError") {
    // Handle database errors
    statusCode = 500;
    message = "Database error occurred";
    data = process.env.NODE_ENV !== "production" ? err : null;
  } else if (err.name === "SequelizeForeignKeyConstraintError") {
    // Handle foreign key constraint errors
    statusCode = 400;
    message = "Invalid reference to another resource";
    data = process.env.NODE_ENV !== "production" ? err : null;
  }

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === "production" && statusCode >= 500) {
    message = "An unexpected error occurred";
    data = null;
  }

  // Respond with error details
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

export default errorHandler;
