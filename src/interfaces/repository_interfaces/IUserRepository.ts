import { IUser } from '../../types/IUser';
import { IBaseRepository } from './IBaseRepository';

export interface IUserRepository extends IBaseRepository<IUser> {
  
    findUserByEmail(email: string): Promise<IUser | null>;

    updateIsVerified(email: string, status: boolean): Promise<IUser | null>;
    updatePassword(email: string, password: string): Promise<IUser | null>;

}