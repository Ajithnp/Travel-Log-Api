// src/middlewares/validate-dto.ts
import { AnyZodObject, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { HTTP_STATUS } from '../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../shared/constants/messages';

export const validateDTO =
  (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError('Provide required data', HTTP_STATUS.BAD_REQUEST));
      } else {
        next(error);
      }
    }
  };

//   router.post("/signup", validateDTO(SignupSchema), signup);
