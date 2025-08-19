import { Request,Response,NextFunction } from "express";

export interface IAdminUserController {

    getAllUsers(req:Request, res: Response, next: NextFunction): Promise<void>
    
    blockOrUnclockUser(req: Request, res:Response, next:NextFunction): Promise<void>
}