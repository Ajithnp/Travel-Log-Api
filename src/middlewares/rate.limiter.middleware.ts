import { Request, Response, NextFunction } from "express";
import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import { HTTP_STATUS } from "../shared/constants/http_status_code";
import { ERROR_MESSAGES } from "../shared/constants/messages";

export function makeRateLimiter(limiter: RateLimiterRedis) {
  return async (req: Request, res:Response, next:NextFunction) => {
    try {
      await limiter.consume(req.ip || 'unknown'); 
      next();
    } catch (rejRes) {
         const rateLimitRes = rejRes as RateLimiterRes;
      res.set("Retry-After", Math.ceil(rateLimitRes.msBeforeNext / 1000).toString());
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({ message: ERROR_MESSAGES.TOO_MANY_REQUESTS});
    }
  };
}
