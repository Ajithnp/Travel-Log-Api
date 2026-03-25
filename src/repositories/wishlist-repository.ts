import {IWishlist, IWishlistEntity } from "../types/entities/wishlist.entity";
import { WishlistDocument, WishlistModel } from "../models/wishlist.model";
import { BaseRepository } from "./base.repository";
import { IWishlistRepository } from "../interfaces/repository_interfaces/IWishlistRepository";
import { toObjectId } from "../shared/utils/database/objectId.helper";
import { Types } from "mongoose";

export class WishlistRepository extends BaseRepository<WishlistDocument> implements IWishlistRepository {
    constructor() {
        super(WishlistModel);
    }

  async addPackage(userId: string, packageId: string): Promise<IWishlistEntity> {
    const updated = await WishlistModel.findOneAndUpdate(
      { userId: toObjectId(userId) },
      { $addToSet: { packages: toObjectId(packageId) } },
      {
        new: true,    // return updated document
        upsert: true, // create if doesn't exist
      },
    ).lean();
 
    return updated as IWishlistEntity;
    }
    
 async isPackageWishlisted(
    userId: string,
    packageId: string,
  ): Promise<boolean> {
    const doc = await this.model.exists({
      userId: new Types.ObjectId(userId),
      packages: new Types.ObjectId(packageId),
    });
    return doc !== null;
    }
    
    async removePackage(userId: string,packageId: string): Promise<IWishlistEntity | null> {
      return await this.model.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $pull: { packages: new Types.ObjectId(packageId) } },
      { new: true },
    ).lean();
    }
    
 async findWishlistedIds(userId: string): Promise<Pick<IWishlistEntity, 'packages'> | null> {
    const doc = await this.model.findOne(
      { userId: new Types.ObjectId(userId) },
      { packages: 1, _id: 0 }, // projection: only packages array
    ).lean();
   return doc as Pick<IWishlistEntity, 'packages'> | null;
  }
    
}