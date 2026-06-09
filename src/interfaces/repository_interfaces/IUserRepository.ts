import { IUser } from '../../types/entities/user.entity';
import { IBaseRepository } from './IBaseRepository';
import { AdminTabs, VendorTabs } from '../../shared/constants/constants';
import { PaginatedCommissionOverviewByVendors } from 'interfaces/service_interfaces/admin/IAdminFinanceService';

export interface IUserRepository extends IBaseRepository<IUser> {
  findByIdAndRemoveUnreadTabs(userId: string, tab: VendorTabs | AdminTabs): Promise<void>;
  findByIdAndAddUnreadTabs(userId: string, tab: VendorTabs | AdminTabs): Promise<void>;
  getUserUnreadTabs(userId: string): Promise<string[]>;
  
}
