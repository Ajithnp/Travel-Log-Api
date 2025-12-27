import { IUser } from '../../../types/entities/user.entity';
import { PaginatedData } from '../../../types/common/IPaginationResponse';
import { UserProfileResponseDTO } from 'types/dtos/user/response.dtos';

export interface IAdminUserService {
  fetchUsers(
    page: number,
    limit: number,
    role: string,
    search?: string,
    selectedFilter?: string,
  ): Promise<PaginatedData<Partial<UserProfileResponseDTO>>>;

  updateUserAccess(id: string, block: boolean, reason?: string, token?: string): Promise<void>;
}
