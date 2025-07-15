import { Response } from "express";

const isProduction = process.env.NODE_ENV === 'production';



export const setAuthCookies = (res: Response, key: string, value: string , maxAge: number): void => {
    res.cookie(key, value, {
        httpOnly: true,
        secure: isProduction, // Use secure cookies in production
        sameSite: isProduction ? "none":"lax",
        maxAge, 
    });
};


export const clearAuthCookies = (res: Response, key: string): void => {
    res.clearCookie(key, {
        httpOnly: true,
        secure: isProduction, 
        sameSite: isProduction ? "none":"lax", 
        maxAge: 0, // immediately expires the cookie
    });
};