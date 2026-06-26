import {
  BasePackageSingleResponseDTO,
  PackageDetailDTO,
  PackageForOfferResponseDTO,
  PackageScheduleContextResponseDTO,
} from '../../types/dtos/admin/response.dtos';
import {
  DifficultyLevel,
  IBasePackagePopulated,
  IBasePackagePopulatedByCategory,
  IFile,
  IPopulatedPackageDetails,
} from '../../types/entities/base-package.entity';
import { PublicPackageCategoryDTO, PublicPackageSummary } from '../../types/user/types';
import { PublicPackageDetailDTO } from '../../types/dtos/user/response.dtos';
import {
  IPackageListItem,
  PackageOfferInfo,
  RawPublicPackageDocument,
} from '../../interfaces/repository_interfaces/IBasePackageRepository';
import { PackageStatus } from 'types/type';
import { RecommendedPackagesResponseDTO } from 'interfaces/service_interfaces/user/IPublicPackageService';

export class PackageMapper {
  static toOfferResponse(pkg: PackageOfferInfo): PackageForOfferResponseDTO {
    return {
      id: pkg._id.toString(),
      title: pkg.title ?? '',
      hasOffer: pkg.hasOffer ?? false,
      offerValue: pkg.offerValue,
    };
  }

  static toResponse(pkg: IPackageListItem): BasePackageSingleResponseDTO {
    return {
      id: pkg._id.toString(),
      title: pkg.title ?? '',
      location: pkg.location ?? '',
      state: pkg.state ?? '',
      durationDays: Number(pkg.days) || 0,
      durationNights: Number(pkg.nights) || 0,
      imageUrl: pkg.images?.map((image: IFile) => ({ key: image.key })) ?? [],
      status: pkg.status as PackageStatus,
      category: pkg.categoryId?.name ?? '',
      difficultyLevel: pkg.difficultyLevel ?? '',
      basePrice: Number(pkg.basePrice) || 0,
      hasOffer: pkg.hasOffer,
      offerPercentage: pkg.offerPercentage,
      scheduleCount: pkg.scheduleCount,
    };
  }

  static toDetailResponse(pkg: IBasePackagePopulated): PackageDetailDTO {
    return {
      packageId: pkg._id.toString(),
      vendorId: pkg.vendorId.toString(),
      title: pkg.title ?? '',
      location: pkg.location ?? '',
      state: pkg.state ?? '',
      usp: pkg.usp ?? '',
      category: pkg.categoryId?.name ?? null,
      difficultyLevel: pkg.difficultyLevel ?? undefined,
      description: pkg.description ?? '',
      days: pkg.days ?? '',
      nights: pkg.nights ?? '',
      basePrice: pkg.basePrice ?? '',
      images: pkg.images?.map((image: IFile) => ({ key: image.key })) ?? [],
      itinerary:
        pkg.itinerary?.map((day) => ({
          dayNumber: day.dayNumber ?? 0,
          title: day.title ?? '',
          activities:
            day.activities?.map((activity) => ({
              startTime: activity.startTime ?? '',
              endTime: activity.endTime ?? '',
              title: activity.title ?? '',
              description: activity.description ?? '',
              location: activity.location ?? '',
              specials: activity.specials ?? [],
              included: activity.included ?? false,
            })) ?? [],
        })) ?? [],
      inclusions: pkg.inclusions ?? [],
      exclusions: pkg.exclusions ?? [],
      packingList: pkg.packingList ?? [],
      cancellationPolicy: pkg.cancellationPolicy
        ? {
            _id: pkg.cancellationPolicy._id.toString(),
            label: pkg.cancellationPolicy.label ?? '',
            key: pkg.cancellationPolicy.key ?? '',
          }
        : null,
      status: pkg.status,
      isActive: pkg.isActive,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
    };
  }

  static toScheduleContext(pkg: IBasePackagePopulated): PackageScheduleContextResponseDTO {
    return {
      PackageId: pkg._id.toString(),
      title: pkg.title ?? '',
      location: pkg.location ?? '',
      state: pkg.state ?? '',
      category: pkg.categoryId?.name ?? null,
      difficultyLevel: pkg.difficultyLevel ?? '',
      status: pkg.status,
      days: Number(pkg.days ?? 0),
      nights: Number(pkg.nights ?? 0),
    };
  }

  static toPublicListing(p: RawPublicPackageDocument): PublicPackageSummary {
    return {
      _id: p._id.toString(),
      title: p.title,
      description: p.description ? p.description.substring(0, 200) + '…' : '',
      location: p.location ?? '',
      state: p.state ?? '',
      difficultyLevel: p.difficultyLevel as unknown as DifficultyLevel,
      days: p.days ?? 0,
      nights: p.nights ?? 0,
      usp: p.usp ?? '',
      images: p.images ?? [],
      category: p.category
        ? {
            _id: p.category._id.toString(),
            name: p.category.name,
            slug: p.category.slug,
          }
        : (null as unknown as PublicPackageCategoryDTO),
      vendor: {
        _id: p.vendor?._id?.toString() ?? '',
        name: p.vendor?.name ?? '',
      },
      startingFromPrice: p.startingFromPrice ?? 0,
      earliestDate: p.earliestDate!,
      earliestEndDate: p.earliestEndDate!,
      earliestScheduleStatus: p.earliestScheduleStatus as unknown as 'upcoming' | 'sold_out',
      scheduleCount: p.scheduleCount ?? 0,
      isSoldOut: p.isSoldOut ?? false,
      hasOffer: p.hasOffer ?? false,
      offerPercentage: p.offerPercentage ?? 0,
      averageRating: p.averageRating ?? 0,
      totalReviews: p.totalReviews ?? 0,
    };
  }

  static toPublicDetailResponse(pkg: IPopulatedPackageDetails): PublicPackageDetailDTO {
    return {
      packageId: pkg._id.toString(),
      vendor: {
        id: pkg.vendorId._id.toString(),
        name: pkg.vendorId.name ?? '',
      },
      title: pkg.title ?? '',
      location: pkg.location ?? '',
      state: pkg.state ?? '',
      usp: pkg.usp ?? '',
      category: pkg.categoryId?.name ?? null,
      difficultyLevel: pkg.difficultyLevel ?? undefined,
      description: pkg.description ?? '',
      days: pkg.days ?? '',
      nights: pkg.nights ?? '',
      basePrice: pkg.basePrice ?? '',
      images: pkg.images?.map((image: IFile) => ({ key: image.key })) ?? [],
      itinerary:
        pkg.itinerary?.map((day) => ({
          dayNumber: day.dayNumber ?? 0,
          title: day.title ?? '',
          activities:
            day.activities?.map((activity) => ({
              startTime: activity.startTime ?? '',
              endTime: activity.endTime ?? '',
              title: activity.title ?? '',
              description: activity.description ?? '',
              location: activity.location ?? '',
              specials: activity.specials ?? [],
              included: activity.included ?? false,
            })) ?? [],
        })) ?? [],
      inclusions: pkg.inclusions ?? [],
      exclusions: pkg.exclusions ?? [],
      packingList: pkg.packingList ?? [],
      cancellationPolicy: pkg.cancellationPolicy
        ? {
            _id: pkg.cancellationPolicy._id.toString(),
            label: pkg.cancellationPolicy.label ?? '',
            key: pkg.cancellationPolicy.key ?? '',
            description: pkg.cancellationPolicy.description,
            rules:
              pkg.cancellationPolicy.rules?.map((rule) => ({
                daysBeforeTrip: rule.daysBeforeTrip,
                refundPercent: rule.refundPercent,
              })) ?? [],
          }
        : null,
      status: pkg.status,
      isActive: pkg.isActive,
    };
  }

}
