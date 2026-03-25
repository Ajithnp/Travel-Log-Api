import { IWishlistIdsResponse, IWishlistToggleResponse } from "types/entities/wishlist.entity";

export interface IWishlistService {
    toggleWishlist(userId: string, packlageId: string): Promise<IWishlistToggleResponse>;
    getWishlistedIds(userId: string): Promise<IWishlistIdsResponse>
}