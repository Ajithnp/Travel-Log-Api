import { RateLimiterRedis } from "rate-limiter-flexible";
import redisClient from "./redis.config";

const loginLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 5,
  duration: 60,
  blockDuration: 300,
});

const otpLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 3,
  duration: 600,
  blockDuration: 600,
});

const searchLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 20,
  duration: 60,
});