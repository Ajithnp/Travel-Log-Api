import { VendorInformationModel } from '../models/vendor.info.model';
import { FilterQuery, PipelineStage, Types } from 'mongoose';
import { IVendorInfoRepository } from 'interfaces/repository_interfaces/IVendorInfoRepository';
import { BaseRepository } from './base.repository';
import { injectable } from 'tsyringe';
import {
  IVendorInfo,
  IVendorInfoWithUser,
  IVendorInfoPopulated,
} from '../types/entities/vendor.info.entity';
import { CustomQueryOptions } from '../types/common/IQueryOptions';
import { IUser } from '../types/entities/user.entity';
import { VendorVerificationUpdateDTO } from 'types/dtos/admin/request.dtos';
import { VENDOR_VERIFICATION_STATUS } from 'types/enum/vendor-verfication-status.enum';
@injectable()
export class VendorInfoRepository
  extends BaseRepository<IVendorInfo>
  implements IVendorInfoRepository
{
  constructor() {
    super(VendorInformationModel);
  }

  async findVendorWithUserId(userId: string): Promise<IVendorInfoPopulated | null> {
    const vendor = await VendorInformationModel.findOne({ userId })
      .populate('userId')
      .lean<IVendorInfoPopulated>()
      .exec();
    return vendor;
  }

  async findVendors(
    vendorSearchQuery: FilterQuery<IUser>,
    vendorFilter: FilterQuery<IUser>,
    options: CustomQueryOptions = { skip: 0, limit: 10, sort: { createdAt: -1 } },
  ): Promise<IVendorInfoWithUser[]> {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      { $match: { isProfileVerified: true } },

      { $match: vendorSearchQuery },
      { $match: vendorFilter },

      { $sort: options.sort },
      { $skip: options.skip },
      { $limit: options.limit },
    ];
    const result = await VendorInformationModel.aggregate<IVendorInfoWithUser>(pipeline);
    return result;
  }

  async countVendorDocuments(
    vendorSearchQuery: FilterQuery<IUser>,
    vendorFilter: FilterQuery<IVendorInfo>,
    matchQuery?: FilterQuery<IVendorInfo>,
  ): Promise<number> {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ];

    if (matchQuery) pipeline.push({ $match: matchQuery });

    pipeline.push({ $match: vendorSearchQuery }, { $match: vendorFilter }, { $count: 'totalDocs' });

    const result = await VendorInformationModel.aggregate(pipeline);

    return result[0]?.totalDocs || 0;
  }

  async findVendorsVerificationDetails(
    vendorSearchQuery: FilterQuery<IUser>,
    vendorFilter: FilterQuery<IVendorInfo>,
    options: CustomQueryOptions = { skip: 0, limit: 10, sort: { createdAt: -1 } },
  ): Promise<IVendorInfoWithUser[]> {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $match: { 'user.role': 'vendor' } },

      { $match: vendorSearchQuery },
      { $match: vendorFilter },

      { $sort: options.sort },
      { $skip: options.skip },
      { $limit: options.limit },
    ];

    const result = await VendorInformationModel.aggregate<IVendorInfoWithUser>(pipeline);

    return result;
  }

//   async reApply(
//   vendorId: Types.ObjectId,
//   payload: 
// ): Promise<IVendorInfo | null> {
//   return await this.model.findOneAndUpdate(
//     { 
//       vendorId, 
//       status: VENDOR_VERIFICATION_STATUS.REJECTED  
//     },
//     { 
//       ...payload, 
//       status: VENDOR_VERIFICATION_STATUS.PENDING,  
//       reasonForReject: null,                        
//       updatedAt: new Date(),
//     },
//     { new: true }
//   );
// }
}
