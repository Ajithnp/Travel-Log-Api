import { VendorInformationModel } from '../models/vendor.info.model';
import { FilterQuery } from 'mongoose';
import { IVendorInfoRepository } from 'interfaces/repository_interfaces/IVendorInfoRepository';
import { BaseRepository } from './base.repository';
import { injectable } from 'tsyringe';
import { IVendorInfo, IVendorInfoPopulated } from '../types/entities/vendor.info.entity';
import { CustomQueryOptions } from '../types/common/IQueryOptions';

@injectable()
export class VendorInfoRepository
  extends BaseRepository<IVendorInfo>
  implements IVendorInfoRepository
{
  constructor() {
    super(VendorInformationModel);
  }

  async findVendorWithUser(userId: string): Promise<IVendorInfoPopulated | null> {
    const vendor = await VendorInformationModel.findOne({ userId })
      .populate('userId')
      .lean<IVendorInfoPopulated>()
      .exec();
    return vendor;
  }
  //Model.find(filter, projection?, options?)
  public async findVendorsVerificationDetails(
    filter: FilterQuery<IVendorInfo> = {},
    options?: CustomQueryOptions,
  ): Promise<IVendorInfoPopulated[]> {
    const query = VendorInformationModel.find(filter, null, options)

      .populate('userId')
      .lean<IVendorInfoPopulated[]>();

    // if (options?.skip) query.skip(options.skip);
    // if (options?.limit) query.limit(options.limit);
    // if (options?.sort) query.sort(options.sort);

    return await query.exec();
  }
}
