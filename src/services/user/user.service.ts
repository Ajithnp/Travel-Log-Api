import {
  ResetPasswordRequestDTO,
  UpdateEmailRequestDTO,
  UpdateProfileRequestDTO,
  VerifyEmailRequestDTO,
} from '../../types/dtos/user/request.dtos';
import { AppError } from '../../errors/AppError';
import { IUserRepository } from '../../interfaces/repository_interfaces/IUserRepository';
import { IUserService } from '../../interfaces/service_interfaces/user/IUserService';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../shared/constants/messages';
import {
  IUpdateEmailResponseDTO,
  UserProfileResponseDTO,

} from '../../types/dtos/user/response.dtos';
import { inject, injectable } from 'tsyringe';
import { IOtpService } from 'interfaces/service_interfaces/IOtpService';
import { IBcryptUtils } from '../../interfaces/common_interfaces/IBcryptUtils';
@injectable()
export class UserService implements IUserService {
  constructor(
    @inject('IUserRepository')
    private _userRepository: IUserRepository,

    @inject('IOtpService')
    private _otpService: IOtpService,

    @inject('IBcryptUtils')
    private _bcryptUtils: IBcryptUtils,
  ) {}

  async profile(id: string): Promise<UserProfileResponseDTO> {
    const userDoc = await this._userRepository.findById(id);
    if (!userDoc) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    const response = {
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      phone: userDoc.phone,
      createdAt: userDoc.createdAt.toDateString(),
      isBlocked: userDoc.isBlocked,
    }
    return response
  }

  async updateProfile(payload: UpdateProfileRequestDTO): Promise<void> {
    const { email, ...updateData } = payload;
    const user = await this._userRepository.findOne({email}) 
    if (!user) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

      if (Object.keys(updateData).length === 0) {
        throw new AppError("No valid fields provided for update", HTTP_STATUS.BAD_REQUEST);
     }

    const updatedUser = await this._userRepository.findOneAndUpdate(
      { email },
      { ...updateData }
    );

    if(!updatedUser) throw new AppError(ERROR_MESSAGES.USER_UPDATE_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR)


  };

  async updateEmailRequest(payload: UpdateEmailRequestDTO): Promise<IUpdateEmailResponseDTO> {
    const { email } = payload;
    
    const user = await this._userRepository.findOne({ email });
    if (user) {
      throw new AppError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.BAD_REQUEST, 'EMAIL_ALREADY_EXISTS');
    }
    
    const { otpExpiresIn, serverTime } = await this._otpService.sendOtp(email);

    const response = {
      email,
      otpExpiresIn,
      serverTime
    }

   return response
    
  }

  async updateEmail(payload: VerifyEmailRequestDTO): Promise<void> {
    const { email, otp } = payload;
     
    await this._otpService.verifyOtp({email,otp})
    // const  await this._cacheService.get(key);
    const user = await this._userRepository.findOne({ email });

    if (user) throw new AppError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.BAD_REQUEST, 'EMAIL_ALREADY_EXISTS');

    await this._userRepository.findOneAndUpdate(
      { email },
      {email },
    )
  };

  async resetPassword(payload: ResetPasswordRequestDTO): Promise<void> {
    const { email, oldPassword, newPassword } = payload;

    const user = await this._userRepository.findOne({ email });
    if (!user) throw new AppError(ERROR_MESSAGES.EMAIL_NOT_FOUND, HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');

    const isMatch = await this._bcryptUtils.comparePassword(oldPassword, user.password);
    if (!isMatch) throw new AppError(ERROR_MESSAGES.PASSWORD_DO_NOT_MATCH, HTTP_STATUS.BAD_REQUEST);

    const hashedPassword = await this._bcryptUtils.hashPassword(newPassword);

    await this._userRepository.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

  };
}
