import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { HTTP_STATUS, SUCCESS_STATUS } from "../shared/constants/http_status_code";
import { ERROR_MESSAGES } from "../shared/constants/messages";


export const errorMiddleware = (
    err: Error | AppError |any,
    req: Request,
    res: Response,
    next: NextFunction
)=> {

    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message: string = ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR;

    if(err instanceof AppError) {
        statusCode = err.status_code;
        message = err.message;

    }else if(err instanceof SyntaxError && 'body' in err) {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = ERROR_MESSAGES.INVALID_JSON_PAYLOAD
    }
    else{
        statusCode = (err?.status_code) ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
        message = (err?.message) ?? ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR;
    }

    console.error(`${statusCode}   ${message}` );
    console.error(err);
    res.status(statusCode).json({
        success: SUCCESS_STATUS.FAILURE,
        message,
    });
    
}


