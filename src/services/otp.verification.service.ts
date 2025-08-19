import { injectable , inject} from "tsyringe";
import { IOtpService } from "../interfaces/service_interfaces/IOtpService";
import { IOtpRepository } from "interfaces/repository_interfaces/IOtpRepository";
import {generateOtpWithExpiry } from "../shared/utils/otp.generator.helper";
import { IEmailUtils } from "../types/common/IEmailUtils";
import { AppError } from "../errors/AppError";
import { ERROR_MESSAGES } from "../shared/constants/messages";
import { HTTP_STATUS } from "../shared/constants/http_status_code";
import { IBcryptUtils } from "types/common/IBcryptUtils";
import logger from "../shared/utils/logger.helper";


@injectable()
export class OtpVerificationService implements IOtpService {
    constructor(
      @inject("IOtpRepository")
      private _otpRepository: IOtpRepository,
      @inject("IEmailUtils")
      private _emailUtil: IEmailUtils,
      @inject("IBcryptUtils")
      private _bcryptUtil: IBcryptUtils,
    ){}


   async  sendOtp(email: string): Promise<void> {

        const {otp , expiresAt } = generateOtpWithExpiry();
        const hashedOtp = await this._bcryptUtil.hashPassword(otp)
        const otpDoc =  await this._otpRepository.findOneAndUpdate(
            {email},
            {otp:hashedOtp,expiresAt},
            { upsert: true }
            
         );

         if(!otpDoc){
            throw new AppError(ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR,HTTP_STATUS.INTERNAL_SERVER_ERROR);
         }

         this._emailUtil.sendEmail(
            email,
            "verify Your Email Adress",
            otp,
            'Verify Your Account'
         )
    };

    async verifyOtp(email: string, otp: string): Promise<void> {

        const otpDoc = await this._otpRepository.findOne({email});
        
        if(!otpDoc || otpDoc.expiresAt < new Date()){
            throw new AppError(ERROR_MESSAGES.OTP_EXPIRED,HTTP_STATUS.NOT_FOUND);
        }

        const isMatch = await this._bcryptUtil.comparePassword(otp, otpDoc.otp);
        
        if(!isMatch){
            throw new AppError(ERROR_MESSAGES.INVALID_OTP,HTTP_STATUS.BAD_REQUEST);
        }

        await this._otpRepository.delete(otpDoc._id )

    }
}