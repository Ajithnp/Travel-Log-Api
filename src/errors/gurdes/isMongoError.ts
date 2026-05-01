import { MongoServerError } from '../../types/errors';

export const isMongoServerError = (err: unknown): err is MongoServerError => {
  return (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as MongoServerError).name === 'MongoServerError' &&
    'code' in err &&
    (err as MongoServerError).code === 11000
  );
};

export const isExpressError = (
  err: unknown,
): err is { status_code: number; message: string; error_code?: string } => {
  return typeof err === 'object' && err !== null && 'status_code' in err;
};

export const isSyntaxError = (err: unknown): err is SyntaxError & { body: unknown } => {
  return err instanceof SyntaxError && 'body' in err;
};
