import { IApiResponse } from '../../../types/common/IApiResponse';
import { IUser } from '../../../types/entities/user.entity';
import { PaginatedData } from '../../../types/common/IPaginationResponse';

export interface IAdminUserService {
  // fetchUsers():Promise<IUser []>
  fetchUsers(
    page: number,
    limit: number,
    role: string,
    search?: string,
    selectedFilter?: string,
  ): Promise<PaginatedData<Partial<IUser>>>;

  updateUserAccess(id: string, block: boolean, reason?: string, token?: string): Promise<void>;
}
