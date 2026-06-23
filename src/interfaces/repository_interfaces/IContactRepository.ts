import { ContactStatus } from 'shared/constants/constants';
import { IContact } from '../../types/entities/contact.entity';
import { IBaseRepository } from './IBaseRepository';

export interface IContactRepository extends IBaseRepository<IContact> {
  findAllEnquiries(
    page: number,
    limit: number,
    search: string,
    status: ContactStatus,
  ): Promise<{
    enquiries: Partial<IContact>[];
    totalCount: number;
    pendingCount: number;
    resolvedCount: number;
  }>;
}
