import { inject, injectable } from 'tsyringe';
import { IAdminUserService } from '../../interfaces/service_interfaces/admin/IAdminUserService';
import { IApiResponse } from 'types/common/IApiResponse';
import { IUser } from '../../types/entities/user.entity';
import { IUserRepository } from '../../interfaces/repository_interfaces/IUserRepository';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { ITokenService } from '../../interfaces/service_interfaces/ITokenService';
import { blacklistToken } from '../../shared/utils/token.revocation.helper';
import { USER_ROLES } from '../../shared/constants/roles';
import { PaginatedData } from '../../types/common/IPaginationResponse';
import { FilterQuery, Types } from 'mongoose';

@injectable()
export class AdminUserService implements IAdminUserService {
  constructor(
    @inject('IUserRepository')
    private _userRepository: IUserRepository,
    @inject('ITokenService')
    private _tokenService: ITokenService,
  ) {}

  async fetchUsers(
    page: number,
    limit: number,
    role: IUser['role'],
    search?: string,
    selectedFilter?: string,
  ): Promise<PaginatedData<Partial<IUser>>> {
    const skip = (page - 1) * limit;
    const query: FilterQuery<IUser> = { role };

    if (search && search.trim() !== '') {
      query.name = { $regex: search, $options: 'i' };
    }
    // if (selectedFilter === 'all') query.isBlocked = undefined
    if (selectedFilter === 'active') query.isBlocked = false;
    if (selectedFilter === 'blocked') query.isBlocked = true;

    const [usersDoc, totalDocs] = await Promise.all([
      this._userRepository.findAll(query, { skip, limit, sort: { createdAt: -1 } }),
      this._userRepository.countDocuments(query),
    ]);

    const userData: Partial<IUser>[] = usersDoc.map((user) => ({
      id: (user._id as Types.ObjectId).toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
    }));

    return {
      data: userData,
      currentPage: page,
      totalPages: Math.ceil(totalDocs / limit),
      totalDocs,
    };
  }
  //==========================================================================================

  async updateUserAccess(
    id: string,
    block: boolean,
    reason?: string,
    accessToken?: string,
  ): Promise<void> {
    const userDoc = await this._userRepository.findById(id);
    if (!userDoc) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const userUpdatedDoc = await this._userRepository.findByIdAndUpdate(id, {
      isBlocked: block,
      blockedReason: block === true ? reason : '',
    });

    if (!userUpdatedDoc) {
      throw new AppError(ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    // if (block && accessToken) {
    //   blacklistToken(accessToken);
    // }
  }
}
