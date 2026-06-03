import {
  IWishlistItem,
  IWishlistPackagePopulated,
  IWishlistResponse,
} from '../../types/entities/wishlist.entity';
import { PACKAGE_STATUS } from '../../shared/constants/constants';

export class WishlistMapper {
  static toWishlistItem(pkg: IWishlistPackagePopulated): IWishlistItem {
    return {
      packageId: pkg._id.toString(),
      title: pkg.title,
      location: pkg.location,
      state: pkg.state,
      category: pkg.categoryId?.name ?? 'Uncategorized',
      difficultyLevel: pkg.difficultyLevel,
      hasUpcomingSchedule: pkg.hasUpcomingSchedule,
      days: pkg.days,
      nights: pkg.nights,
      basePrice: pkg.basePrice,
      averageRating: pkg.averageRating ?? 0,
      totalReviews: pkg.totalReviews ?? 0,
      images: pkg.images.length > 0 ? [{ key: pkg.images[0].key }] : [],
    };
  }

  static toWishlistResponse(
    packages: IWishlistPackagePopulated[],
    page: number,
    totalPages: number,
    totalCount: number,
    hasNextPage: boolean,
  ): IWishlistResponse {
    const data = packages
      .filter((pkg) => pkg !== null && pkg.isActive && pkg.status === PACKAGE_STATUS.PUBLISHED)
      .map(WishlistMapper.toWishlistItem);

    return { data, page, totalPages, totalCount, hasNextPage, hasPreviousPage: page > 1 };
  }
}
