import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { AppError } from '../errors/AppError';
import { HTTP_STATUS } from '../shared/constants/http_status_code';

export const validateDTO =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (parsed.body) req.body = parsed.body;
      if (parsed.params) req.params = parsed.params;
      if (parsed.query) Object.assign(req.query, parsed.query);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
          // console.log("ZOD ERRORS:", JSON.stringify(error.errors, null, 2));
        next(new AppError(error.errors[0].message, HTTP_STATUS.BAD_REQUEST));
        return;
      }

      next(error);
    }
  };
