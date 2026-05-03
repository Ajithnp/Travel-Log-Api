import { IWishlistService } from '../../interfaces/service_interfaces/user/IWishlistService';
import { inject, injectable } from 'tsyringe';
import { IWishlistRepository } from '../../interfaces/repository_interfaces/IWishlistRepository';
import { ICacheService } from '../../interfaces/service_interfaces/ICacheService';
import {
  IWishlistIdsResponse,
  IWishlistResponse,
  IWishlistToggleResponse,
} from '../../types/entities/wishlist.entity';
import { IBasePackageRepository } from '../../interfaces/repository_interfaces/IBasePackageRepository';
import { PACKAGE_STATUS } from '../../shared/constants/constants';
import { AppError } from '../../errors/AppError';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { CACHE_KEYS, CACHE_TTL } from '../../types/cache';
import { WishlistMapper } from '../../shared/mappers/wishlist.mapper';

@injectable()
export class WishlistService implements IWishlistService {
  constructor(
    @inject('IWishlistRepository')
    private _wishlistRepository: IWishlistRepository,
    @inject('IBasePackageRepository')
    private _packageRepository: IBasePackageRepository,
    @inject('ICacheService')
    private _cacheService: ICacheService,
  ) {}

  private async invalidateUserWishlistCache(userId: string): Promise<void> {
    await this._cacheService.clearPrefix(`wishlist:full:${userId}`);
    await this._cacheService.clearPrefix(`wishlist:ids:${userId}`);
    await this._cacheService.clearPrefix(`wishlist:count:${userId}`);
  }

  // ─── Toggle (Add / Remove)
  async toggleWishlist(userId: string, packageId: string): Promise<IWishlistToggleResponse> {
    const pkg = await this._packageRepository.findById(packageId);
    if (!pkg) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (!pkg.isActive || pkg.status !== PACKAGE_STATUS.PUBLISHED) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_AVAILABLE, HTTP_STATUS.FORBIDDEN);
    }
    // ── Check current wishlist state ──
    const alreadyWishlisted = await this._wishlistRepository.isPackageWishlisted(userId, packageId);

    if (alreadyWishlisted) {
      await this._wishlistRepository.removePackage(userId, packageId);
    } else {
      await this._wishlistRepository.addPackage(userId, packageId);
    }

    await this.invalidateUserWishlistCache(userId);
    return { wishlisted: !alreadyWishlisted, packageId };
  }
  //====================================================

  async getWishlistedIds(userId: string): Promise<IWishlistIdsResponse> {
    const cacheKey = CACHE_KEYS.wishlistedIds(userId);

    const cached = await this._cacheService.get<string[]>(cacheKey);
    if (cached) return { wishlistedPackageIds: cached };

    const doc = await this._wishlistRepository.findWishlistedIds(userId);

    const ids: string[] = doc?.packages?.map((id) => id.toString()) ?? [];

    await this._cacheService.set(cacheKey, ids, CACHE_TTL.ids);
    return { wishlistedPackageIds: ids };
  }

  //=======================================================
  async getWishlist(userId: string, page: number, limit: number): Promise<IWishlistResponse> {
    const cacheKey = CACHE_KEYS.wishlistFull(userId, page);

    const cached = await this._cacheService.get<IWishlistResponse>(cacheKey);
    if (cached) return cached;

    const doc = await this._wishlistRepository.findWithPopulatedPackages(userId, page, limit);

    // No wishlist document yet — user never wishlisted anything
    if (!doc || !doc.packages || doc.packages.length === 0) {
      return {
        data: [],
        page,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }

    const result = WishlistMapper.toWishlistResponse(
      doc.packages,
      page,
      Math.ceil(doc.totalCount / limit),
      doc.totalCount,
      doc.hasNextPage,
    );

    await this._cacheService.set(cacheKey, result, CACHE_TTL.full);
    return result;
  }

  //=======================================================
  async getWishlistCount(userId: string): Promise<number> {
    const cacheKey = CACHE_KEYS.wishlistCount(userId);

    const cached = await this._cacheService.get<number>(cacheKey);
    if (cached !== null) return cached;

    const count = await this._wishlistRepository.countPackages(userId);
    await this._cacheService.set(cacheKey, count, CACHE_TTL.count);

    return count;
  }
}
