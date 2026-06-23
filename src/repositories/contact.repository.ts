import ContactModel from '../models/contact.model';
import { BaseRepository } from './base.repository';
import { IContact } from '../types/entities/contact.entity';
import { IContactRepository } from '../interfaces/repository_interfaces/IContactRepository';
import { injectable } from 'tsyringe';
import { ContactStatus } from 'shared/constants/constants';
import { FilterQuery } from 'mongoose';

@injectable()
export class ContactRepository extends BaseRepository<IContact> implements IContactRepository {
  constructor() {
    super(ContactModel);
  }

  async findAllEnquiries(
    page: number,
    limit: number,
    search: string,
    status: ContactStatus,
  ): Promise<{
    enquiries: Partial<IContact>[];
    totalCount: number;
    pendingCount: number;
    resolvedCount: number;
  }> {
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IContact> = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const [result] = await this.model.aggregate([
      { $match: filter },
      {
        $facet: {
          enquiries: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                name: 1,
                email: 1,
                phone: 1,
                subject: 1,
                message: 1,
                isGuest: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ],

          totalCount: [{ $count: 'count' }],

          pendingCount: [{ $match: { status: 'pending' } }, { $count: 'count' }],
          resolvedCount: [{ $match: { status: 'resolved' } }, { $count: 'count' }],
        },
      },
    ]);
    const totalCount = result.totalCount[0]?.count || 0;
    const pending = result.pendingCount[0]?.count || 0;
    const resolved = result.resolvedCount[0]?.count || 0;

    return {
      enquiries: result.enquiries,
      totalCount,
      pendingCount: pending,
      resolvedCount: resolved,
    };
  }
}
