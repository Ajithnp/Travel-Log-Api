import { injectable, inject } from 'tsyringe';
import { IOtpService } from '../interfaces/service_interfaces/IOtpService';
import { generateOtpWithExpiry } from '../shared/utils/otp/otp.generator.helper';
import { IEmailUtils } from '../interfaces/common_interfaces/IEmailUtils';
import { AppError } from '../errors/AppError';
import { ERROR_MESSAGES } from '../shared/constants/messages';
import { HTTP_STATUS } from '../shared/constants/http_status_code';
import { hashOtp } from '../shared/utils/otp/otp.hash.helper';
import { ICacheService } from '../interfaces/service_interfaces/ICacheService';
import { OTP } from '../shared/constants/otp';
import { SendOtpResponseDTO } from '../types/dtos/auth/response.dtos';
import { VerifyOtpRequestDTO } from '../types/dtos/auth/request.dtos';
import { ACCOUNT_VERIFICATION } from '../shared/templates/email_templates';

@injectable()
export class OtpService implements IOtpService {
  constructor(
    @inject('IEmailUtils')
    private _emailUtil: IEmailUtils,
    @inject('ICacheService')
    private _cacheService: ICacheService,
  ) {}

  async sendOtp(email: string): Promise<SendOtpResponseDTO> {
    const { otp, expiresAt } = generateOtpWithExpiry();
    const hashedOtp = hashOtp(otp, email);
    const key = `otp:${email}`;

    await this._cacheService.set(key, hashedOtp, OTP.OTP_TTL_SECONDS);

    this._emailUtil.sendEmail({
      to: email,
      subject: 'verify Your Email Adress',
      html: ACCOUNT_VERIFICATION(otp, 'Account Verification'),
    });

    const response = {
      otpExpiresIn: expiresAt,
      serverTime: Math.floor(Date.now() / 1000),
    };

    return response;
  }

  async verifyOtp(data: VerifyOtpRequestDTO): Promise<void> {
    const { email, otp } = data;
    const key = `otp:${email}`;
    const hashedOtp = hashOtp(otp, email);
    const storedOtp = await this._cacheService.get(key);

    if (!storedOtp) {
      throw new AppError(ERROR_MESSAGES.OTP_EXPIRED, HTTP_STATUS.NOT_FOUND);
    }

    if (hashedOtp !== storedOtp) {
      throw new AppError(ERROR_MESSAGES.INVALID_OTP, HTTP_STATUS.BAD_REQUEST);
    }

    await this._cacheService.del(key);
  }
}
