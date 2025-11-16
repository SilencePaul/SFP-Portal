import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL;

const redis = new Redis(redisUrl, {
  retryStrategy: () => null, // Don't retry connection
  enableReadyCheck: false,
  enableOfflineQueue: false,
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => {
  // Silently ignore Redis connection errors in development
  if (process.env.NODE_ENV !== "production") {
    // Don't log Redis errors in development
  } else {
    console.error("Redis error:", err);
  }
});

export default redis;
