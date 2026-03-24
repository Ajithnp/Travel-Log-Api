import { IWishlist, IWishlistEntity } from "types/entities/wishlist.entity";
import { IBaseRepository } from "./IBaseRepository";

export interface IWishlistRepository extends IBaseRepository<IWishlistEntity> { 

    addPackage(userId: string, packageId: string): Promise<IWishlist>;
    
}