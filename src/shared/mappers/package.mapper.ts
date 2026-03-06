import { BasePackageSingleResponseDTO, PackageDetailDTO } from 'types/dtos/admin/response.dtos';
import { IBasePackagePopulated, IFile } from 'types/entities/base-package.entity';

export class PackageMapper {
  static toResponse(pkg: IBasePackagePopulated): BasePackageSingleResponseDTO {
    return {
      id: pkg._id.toString(),
      title: pkg.title ?? '',
      location: pkg.location ?? '',
      state:pkg.state ?? '',
      durationDays: Number(pkg.days) ?? 0,
      durationNights: Number(pkg.nights) ?? 0,
      imageUrl: pkg.images?.map((image: IFile) => ({ key: image.key })) ?? [],
      status: pkg.status,
      category: pkg.categoryId?.name ?? '',
      difficultyLevel: pkg.difficultyLevel ?? '',
      basePrice: Number(pkg.basePrice) ?? 0,
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
      itinerary: pkg.itinerary?.map((day) => ({
        dayNumber: day.dayNumber ?? 0,
        title: day.title ?? '',
        activities: day.activities?.map((activity) => ({
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
      cancellationPolicy: pkg.cancellationPolicy ?? null,
      status: pkg.status,
      isActive: pkg.isActive,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
    };
  }
}


