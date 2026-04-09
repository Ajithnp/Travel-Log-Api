import {
  IWishlistEntity,
  IWishlistPackagePopulated,
  IWishlistPopulatedDocument,
} from '../types/entities/wishlist.entity';
import { WishlistDocument, WishlistModel } from '../models/wishlist.model';
import { BaseRepository } from './base.repository';
import { IWishlistRepository } from '../interfaces/repository_interfaces/IWishlistRepository';
import { toObjectId } from '../shared/utils/database/objectId.helper';
import { Types } from 'mongoose';
import { PACKAGE_STATUS, SCHEDULE_STATUS } from '../shared/constants/constants';
import SchedulePackageModel from '../models/schedule.model';

export class WishlistRepository
  extends BaseRepository<WishlistDocument>
  implements IWishlistRepository
{
  constructor() {
    super(WishlistModel);
  }

  async addPackage(userId: string, packageId: string): Promise<IWishlistEntity> {
    const updated = await WishlistModel.findOneAndUpdate(
      { userId: toObjectId(userId) },
      { $addToSet: { packages: toObjectId(packageId) } },
      {
        new: true, // return updated document
        upsert: true, // create if doesn't exist
      },
    ).lean();

    return updated as IWishlistEntity;
  }

  async isPackageWishlisted(userId: string, packageId: string): Promise<boolean> {
    const doc = await this.model.exists({
      userId: new Types.ObjectId(userId),
      packages: new Types.ObjectId(packageId),
    });
    return doc !== null;
  }

  async removePackage(userId: string, packageId: string): Promise<IWishlistEntity | null> {
    return await this.model
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $pull: { packages: new Types.ObjectId(packageId) } },
        { new: true },
      )
      .lean();
  }

  async findWishlistedIds(userId: string): Promise<Pick<IWishlistEntity, 'packages'> | null> {
    const doc = await this.model
      .findOne(
        { userId: new Types.ObjectId(userId) },
        { packages: 1, _id: 0 }, // projection: only packages array
      )
      .lean();
    return doc as Pick<IWishlistEntity, 'packages'> | null;
  }

  async findWithPopulatedPackages(
    userId: string,
    page: number,
    limit: number,
  ): Promise<IWishlistPopulatedDocument | null> {
    const wishlistDoc = await this.model
      .findOne(
        { userId: new Types.ObjectId(userId) },
        { packages: 1 }, // projection: only the IDs array
      )
      .lean();

    if (!wishlistDoc) return null;

    const allPackageIds = wishlistDoc.packages as Types.ObjectId[];
    const totalCount = allPackageIds.length;

    if (totalCount === 0) {
      return {
        _id: wishlistDoc._id,
        userId: wishlistDoc.userId,
        packages: [],
        totalCount: 0,
        hasNextPage: false,
      } as unknown as IWishlistPopulatedDocument;
    }

    const skip = (page - 1) * limit;
    const pageIds = allPackageIds.slice(skip, skip + limit);

    // No more pages
    if (pageIds.length === 0) {
      return {
        _id: wishlistDoc._id,
        userId: wishlistDoc.userId,
        packages: [],
        totalCount,
        hasNextPage: false,
      } as unknown as IWishlistPopulatedDocument;
    }

    const doc = await this.model
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate({
        path: 'packages',
        match: {
          isActive: true,
          status: PACKAGE_STATUS.PUBLISHED,
        },
        select:
          'title location state categoryId difficultyLevel days nights basePrice images isActive status',
        populate: {
          path: 'categoryId', // nested populate to get category name
          select: 'name',
        },
      })
      .lean();

    if (!doc) return null;

    const validPackages = (doc.packages as unknown as (IWishlistPackagePopulated | null)[]).filter(
      (pkg): pkg is IWishlistPackagePopulated => pkg !== null,
    );

    if (validPackages.length === 0) {
      return { ...doc, packages: [] } as unknown as IWishlistPopulatedDocument;
    }

    const packageIds = validPackages.map((pkg) => pkg._id);

    const upcomingSchedules = await SchedulePackageModel.find(
      {
        packageId: { $in: packageIds },
        status: SCHEDULE_STATUS.UPCOMING,
      },
      { packageId: 1, _id: 0 },
    ).lean();

    const packageIdsWithSchedules = new Set(upcomingSchedules.map((s) => s.packageId.toString()));

    const packages: IWishlistPackagePopulated[] = validPackages.map((pkg) => ({
      ...pkg,
      hasUpcomingSchedule: packageIdsWithSchedules.has(pkg._id.toString()),
    }));

    return {
      _id: doc._id,
      userId: doc.userId,
      packages,
      totalCount,
      hasNextPage: skip + limit < totalCount,
    } as unknown as IWishlistPopulatedDocument;
  }

  async countPackages(userId: string): Promise<number> {
    const doc = await this.model
      .findOne({ userId: new Types.ObjectId(userId) }, { packages: 1, _id: 0 })
      .lean();

    if (!doc) return 0;
    return (doc.packages ?? []).length;
  }
}
