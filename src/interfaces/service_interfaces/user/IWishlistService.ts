import {
  IWishlistIdsResponse,
  IWishlistResponse,
  IWishlistToggleResponse,
} from 'types/entities/wishlist.entity';

export interface IWishlistService {
  toggleWishlist(userId: string, packlageId: string): Promise<IWishlistToggleResponse>;
  getWishlistedIds(userId: string): Promise<IWishlistIdsResponse>;
  getWishlist(userId: string, page: number, limit: number): Promise<IWishlistResponse>;
  getWishlistCount(userId: string): Promise<number>;
}
