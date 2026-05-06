import { IFile } from 'types/entities/base-package.entity';

export interface VendorVerificationUpdateDTO {
  status: 'Rejected' | 'Approved';
  reasonForReject?: string; // optional for approval, required for rejection
}

export interface ICreateCategoryInputDTO {
  name: string;
  description: string;
  icon?: IFile;
}

export type IUpdateCategoryInputDTO = Partial<Omit<ICreateCategoryInputDTO, 'name'>>;

export interface ReviewRequestDTO {
  status: 'active' | 'rejected';
  isActive: boolean;
  adminId: string;
  slug?: string;
  rejectionReason?: string;
}
