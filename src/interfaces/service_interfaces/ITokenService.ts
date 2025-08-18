import { JwtPayload } from "jsonwebtoken";

//  Interface for the payload used in JWT tokens.
export interface ITokenPayload extends JwtPayload {
    name?: string,
    email: string; 
    role: string; 
    exp?: number;
    
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

    decodeToken(token: string): ITokenPayload | null;

    
   
}