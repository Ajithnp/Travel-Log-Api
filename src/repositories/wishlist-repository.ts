import { IWishlistEntity } from "types/entities/wishlist.entity";
import { WishlistModel } from "../models/wishlist.model";
import { BaseRepository } from "./base.repository";

export class WishlistRepository extends BaseRepository<IWishlistEntity> implements ICategoryRepository {
    constructor() {
        super(WishlistModel);
    }
    
}