export class AppError extends Error {

    public status_code: number;

    constructor(message: string, statusCode: number){
        super(message);
        this.status_code = statusCode;

        Object.setPrototypeOf(this, new.target.prototype);
    }

    
}