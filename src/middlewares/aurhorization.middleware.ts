import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS, SUCCESS_STATUS } from "shared/constants/http_status_code";
import { ERROR_MESSAGES } from "shared/constants/messages";

export const authorize = (allowedRoles: string[]) => {
   return (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.user;

    if(allowedRoles.includes(role)){
        next() // pass the route handler
    }else {
        const errorMessage = {
            success: SUCCESS_STATUS.FAILURE,
            message: ERROR_MESSAGES.ACCESS_DENIED
        };
        res.status(HTTP_STATUS.FORBIDDEN).json(errorMessage)
    }
   }
}
