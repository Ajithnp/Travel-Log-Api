import { IFiles } from 'types/entities/vendor.info.entity';
import { VENDOR_STATUS } from '../../../shared/constants/common';

export interface VendorVerificationUpdateDTO {
  status: VENDOR_STATUS.Approved | VENDOR_STATUS.Rejected;
  reasonForReject?: string; // optional for approval, required for rejection
}

export interface ICategoryRequestDTO {
  name: string;
  description: string;
  icon?: IFiles; 
  isActive?: boolean;
}