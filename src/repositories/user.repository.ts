import { injectable } from 'tsyringe';
import { IUser } from 'types/entities/user.entity';
import { UserModel } from '../models/user.model';
import { IUserRepository } from '../interfaces/repository_interfaces/IUserRepository';
import { BaseRepository } from './base.repository';

@injectable()
export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(UserModel);
  }
}
