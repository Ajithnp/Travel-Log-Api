import {
  CategoryRequestResponseDTO,
  CategoryRequestReviewedResponseDTO,
  CategoryResponseDTO,
} from 'types/dtos/admin/response.dtos';
import { ActiveCategoriesResponseDTO, VendorRequestedCategoryResponseDTO } from 'types/dtos/vendor/response.dtos';
import { ICategory, ICategoryRequestPopulated } from 'types/entities/category.entity';

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
});

export class CategoryMapper {
  static toResponse(cat: ICategory): CategoryResponseDTO {
    return {
      id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? null,
      icon: cat.icon ?? null,
      isActive: cat.isActive,
      status: cat.status,
      createdBy: cat.createdBy?.toString() ?? null,
      requestedBy: cat.requestedBy?.toString() ?? null,
      rejectionReason: cat.rejectionReason ?? null,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    };
  }

  static toRequestResponse(cat: ICategoryRequestPopulated): CategoryRequestResponseDTO {
    return {
      id: cat._id.toString(),
      name: cat.name,
      requested: cat.requestedBy
        ? { name: cat.requestedBy.name, email: cat.requestedBy.email }
        : null,
      vendorNote: cat.vendorNote ?? null,
      date: DATE_FORMAT.format(cat.createdAt),
      status: cat.status,
    };
  }

  static toReviewedResponse(cat: ICategoryRequestPopulated): CategoryRequestReviewedResponseDTO {
    return {
      id: cat._id.toString(),
      name: cat.name,
      requested: cat.requestedBy
        ? { name: cat.requestedBy.name, email: cat.requestedBy.email }
        : null,
      adminNote: cat.adminNote ?? null,
      updatedDate: DATE_FORMAT.format(cat.updatedAt),
      status: cat.status,
    };
  }

  static toVendorRequestResponse(cat: ICategory): VendorRequestedCategoryResponseDTO {
    return {
      id: cat._id.toString(),
      name: cat.name,
      adminNote: cat.rejectionReason ?? null,
      note: cat.vendorNote ?? null,
      createdAt: DATE_FORMAT.format(cat.updatedAt),
      status: cat.status,
    };
  }

  static toActiveCategoriesResponse(cat: ICategory): ActiveCategoriesResponseDTO {
    return {
      id: cat._id.toString(),
      name: cat.name,
    };
  }
}
