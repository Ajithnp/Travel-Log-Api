export interface IOtpService {
    /**
     * sends an OTP (One-Time Password) to the specified email address.
     * @param email - The email to which the OTP will be sent.
     * @returns A promise that resolves when the OTP is sent.
     * 
     */
    sendOtp(email: string): Promise<void>;

    /**
     * Verifies the OTP for the specified email.
     * @param email - The email associated with the OTP.
     * @param otp - The OTP to verify.
     * @returns A promise that resolves to a boolean indicating whether the OTP is valid.
     */
    verifyOtp(email: string, otp: string): Promise<void>;
    
    // isOtpValid(email: string, otp: string): Promise<boolean>;
}