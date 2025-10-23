import { RateLimiterRedis } from 'rate-limiter-flexible';
import redisClient from './redis.config';

export const loginLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 5,
  duration: 60,
  blockDuration: 300,
});

export const otpLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 3, // Max 3 requests allowed
  duration: 600, // In 600 seconds (10 minutes)
  blockDuration: 600, // If limit exceeded, block for 10 minutes
});

export const searchLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 20,
  duration: 60,
});
