export interface IOtpService {
   
    sendOtp(email: string): Promise<void>;
    
    verifyOtp(email: string, otp: string): Promise<void>;
    

}