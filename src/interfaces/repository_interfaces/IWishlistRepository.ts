import {
  IWishlist,
  IWishlistEntity,
  IWishlistPopulatedDocument,
} from 'types/entities/wishlist.entity';
import { IBaseRepository } from './IBaseRepository';

export interface IWishlistRepository extends IBaseRepository<IWishlistEntity> {
  addPackage(userId: string, packageId: string): Promise<IWishlistEntity>;
  isPackageWishlisted(userId: string, packageId: string): Promise<boolean>;
  removePackage(userId: string, packageId: string): Promise<IWishlistEntity | null>;
  findWishlistedIds(userId: string): Promise<Pick<IWishlistEntity, 'packages'> | null>;
  findWithPopulatedPackages(
    userId: string,
    page: number,
    limit: number,
  ): Promise<IWishlistPopulatedDocument | null>;
  countPackages(userId: string): Promise<number>;
}
