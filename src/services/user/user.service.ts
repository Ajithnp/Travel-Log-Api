import { IUserProfileDTO } from '../../dtos/user/user.profile.response.dtos';
import { AppError } from '../../errors/AppError';
import { IUserRepository } from '../../interfaces/repository_interfaces/IUserRepository';
import { IUserService } from '../../interfaces/service_interfaces/user/IUserService';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { inject, injectable } from 'tsyringe';

@injectable()
export class UserService implements IUserService {
    constructor(
        @inject('IUserRepository')
        private _userRepository: IUserRepository,
    ) { }
    
    async profileService(id: string): Promise<IUserProfileDTO> {
        const userDoc = await this._userRepository.findById(id);
        if (!userDoc) {
            throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
        }
        return {
            id: userDoc._id.toString(),
            name: userDoc.name,
            email: userDoc.email,
            phone: userDoc.phone,
            createdAt: userDoc.createdAt.toDateString(),
            isBlocked: userDoc.isBlocked
        }
    }
}