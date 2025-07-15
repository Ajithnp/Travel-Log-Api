import { JwtPayload } from "jsonwebtoken";

//  Interface for the payload used in JWT tokens.
export interface ITokenPayload extends JwtPayload {
    name?: string,
    email: string; 
    role?: string; 
    isVerified?: boolean;
}

// Interface for token-related operations 
export interface ITokenService {

     /**
     * Generates an access token based on the provided payload.
     * @param payload - The token payload containing user information.
     * @returns A string representing the signed access token / refresh token.
     */
    generateAccessToken(payload: ITokenPayload): string;
    generateRefreshToken(payload: ITokenPayload): string;

    /**
     * Verifies the provided refresh token / access token and returns its decoded payload.
     * @param token - The refresh token to verify.
     * @returns A promise that resolves with the decoded token payload if valid.
     * @throws An error if the token is invalid or expired.
     */
    verifyAccessToken(token: string): ITokenPayload | null;
    verifyRefreshToken(token: string): ITokenPayload | null;

    
    /**
     * Generates a token specifically for email verification purposes.
     * @param payload - An object containing the user's email.
     * @returns A string representing the signed email verification token.
     */
    generateEmailToken(payload: {email: string }): string;
    generateResetPasswordToken(payload: {email: string}): string;

    /**
     * Verifies and decodes the email verification token.
     * @param token - The token to verify and decode.
     * @returns An object containing the email if the token is valid, otherwise null.
     */
    verifyEmailToken(token: string): { email: string } | null;
    verifyResetPasswordToken(token: string): { email: string} | null;
}