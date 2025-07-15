import jwt from "jsonwebtoken"

import { ITokenPayload, ITokenService } from "interfaces/service_interfaces/ITokenService";
import { config } from "../config/env";
import { injectable } from "tsyringe";

@injectable()
export class TokenService implements ITokenService {

    private _accessSecret: string;
    private _refreshSecret: string;
    private _verificationSecret: string;
    private _resetPasswordSecret: string;

    constructor(){
        this._accessSecret = config.jwt.ACCESS_TOKEN_SECRET;
        this._refreshSecret = config.jwt.REFRESH_TOKEN_SECRET;
        this._verificationSecret = config.jwt.EMAIL_TOKEN_SECRET;
        this._resetPasswordSecret = config.jwt.PASSWORD_TOKEN_SECRET;
    }

    generateEmailToken(payload: { email: string; }): string {
        return jwt.sign(payload, this._verificationSecret, {expiresIn: "1h"});
    }

    generateAccessToken(payload: ITokenPayload): string {
        return jwt.sign(payload, this._accessSecret, { expiresIn: "10m" });
    }

    generateRefreshToken(payload: ITokenPayload): string {
        return jwt.sign(payload, this._refreshSecret, {expiresIn: "7d"});
    }

    generateResetPasswordToken(payload: { email: string; }): string {
        return jwt.sign(payload,this._resetPasswordSecret, {expiresIn: "10m"})
    }

    verifyEmailToken(token: string): { email: string; } | null {
        try {
            const decoded = jwt.verify(token, this._verificationSecret);

            if(!decoded || typeof decoded === 'string'){
                return null;
            }

         return decoded as ITokenPayload;

        } catch (error) {
            return null
        }
    }

    verifyResetPasswordToken(token: string): { email: string; } | null {
        try {
            const decoded = jwt.verify(token,this._resetPasswordSecret);
            if(!decoded || typeof decoded === 'string'){
                return null
            }

            return decoded as ITokenPayload;
            
        } catch (error) {
            return null
        }
    }

    verifyAccessToken(token: string): ITokenPayload | null {
        try {
            const decoded = jwt.verify(token, this._accessSecret);

            if(!decoded || typeof decoded === 'string'){
                return null;
            }
            return decoded as ITokenPayload;

        } catch (error) {
            return null
        }
    }

    verifyRefreshToken(token: string): ITokenPayload | null {
        try {
            const decoded = jwt.verify(token, this._refreshSecret);

            if(!decoded || typeof decoded === 'string'){
                return null;
            }

            return decoded as ITokenPayload;
        } catch (error) {
            return null
        }
    }
}