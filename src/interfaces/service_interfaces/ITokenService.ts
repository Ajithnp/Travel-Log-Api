import { JwtPayload } from "jsonwebtoken";
import { ObjectId } from 'mongoose';

export interface ITokenPayload extends JwtPayload {
    id:string 
    name?: string,
    email: string; 
    role: string; 
    exp?: number;
    
}
export interface ITokenService {

 
    generateAccessToken(payload: ITokenPayload): string;

    generateRefreshToken(payload: ITokenPayload): string;


    verifyAccessToken(token: string): ITokenPayload | null;
    
    verifyRefreshToken(token: string): ITokenPayload | null;

    decodeToken(token: string): ITokenPayload | null;

    
   
}