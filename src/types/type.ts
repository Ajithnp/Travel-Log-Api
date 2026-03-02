import { PACKAGE_STATUS } from '../shared/constants/constants';

export type PackageStatus = (typeof PACKAGE_STATUS)[keyof typeof PACKAGE_STATUS];

export interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  pendingApproval: number;
}
