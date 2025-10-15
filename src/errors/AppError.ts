export class AppError extends Error {
  public status_code: number;
  public error_code?: string;

  constructor(message: string, statusCode: number, errorCode?: string) {
    super(message);
    this.status_code = statusCode;
    this.error_code = errorCode;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
