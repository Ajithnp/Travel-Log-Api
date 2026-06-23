import { injectable } from 'tsyringe';
import { IUser } from 'types/entities/user.entity';
import { UserModel } from '../models/user.model';
import { IUserRepository } from '../interfaces/repository_interfaces/IUserRepository';
import { BaseRepository } from './base.repository';
import { AdminTabs, VendorTabs } from '../shared/constants/constants';

@injectable()
export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(UserModel);
  }
  async findByIdAndRemoveUnreadTabs(userId: string, tab: VendorTabs | AdminTabs): Promise<void> {
    await this.findByIdAndUpdate(userId, {
      $pull: {
        unreadTabs: tab,
      },
    });
  }

  async findByIdAndAddUnreadTabs(userId: string, tab: VendorTabs | AdminTabs): Promise<void> {
    await this.findByIdAndUpdate(userId, {
      $addToSet: {
        unreadTabs: tab,
      },
    });
  }

  async getUserUnreadTabs(userId: string): Promise<string[]> {
    const user = await this.findById(userId);
    return user?.unreadTabs || [];
  }
}
