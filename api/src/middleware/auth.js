import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    // Allow bypassing auth in development mode with a special header
    // This is useful for testing without JWT tokens
    if (
      process.env.NODE_ENV !== "production" &&
      req.headers["x-dev-bypass-auth"] === "true"
    ) {
      // Mock volunteer data for development
      req.user = {
        sub: 1,
        role: "COORDINATOR",
        email: "dev@local",
      };
      return next();
    }

    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
      // normalized token payload: sub, role, email
      req.user = decoded;

      next();
    } catch (error) {
      // Handle specific JWT errors
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: "Token has expired" });
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: "Invalid token" });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};

export const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // req.user.role expected to be a string
    const userRole = String(req.user.role || "").toUpperCase();

    // Admin-like role can access everything
    if (userRole === "ADMIN") {
      return next();
    }

    // If no specific roles required, allow authenticated
    if (!roles || roles.length === 0) return next();

    const normalizedRequired = roles.map((r) => String(r).toUpperCase());
    const allowed = normalizedRequired.includes(userRole);
    if (!allowed) {
      return res.status(403).json({
        message: "Access denied",
        requiredRoles: roles,
        userRole,
      });
    }

    next();
  };
};

// Helper function to get user from token without middleware
export const getUserFromToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
  } catch (error) {
    return null;
  }
};
