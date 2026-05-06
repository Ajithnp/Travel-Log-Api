export interface MongoServerError {
  name: 'MongoServerError';
  code: number;
  keyPattern: Record<string, number>;
  keyValue: Record<string, unknown>;
  message: string;
}

export interface ExpressError {
  status_code?: number;
  message?: string;
  error_code?: string;
}
