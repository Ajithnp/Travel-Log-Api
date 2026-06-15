import { injectable } from "tsyringe";
import { BaseRepository } from "./base.repository";
import mongoose, { FilterQuery } from "mongoose";
import { IPayoutRepository, PayoutFilter } from "../interfaces/repository_interfaces/IPayoutRepository";
import { FindAllPayoutsResponseDto, PayoutStatsResponseDto } from "../interfaces/service_interfaces/IPayoutService";
import { PayoutModel } from "../models/payout.model";
import { IPayout } from "../types/entities/payout.entity";
import { PAYOUT_STATUS } from "../shared/constants/constants";

@injectable()
export class PayoutRepository extends BaseRepository<IPayout> implements IPayoutRepository {
  constructor() {
    super(PayoutModel);
  }

  async updateStatus(
    payoutId: string,
    status: IPayout['status'],
    extras?: Partial<IPayout>,
  ): Promise<void> {
    await this.findByIdAndUpdate(payoutId, { status, ...extras });
  };

  async payoutStats(): Promise<PayoutStatsResponseDto> {

    const pipeline: mongoose.PipelineStage[] = [
       
      {
        $facet:{
          totalPayouts:[{$group:{_id:null,value:{  $sum:1}}}]  ,
          completedPayouts:[
            {$match:{status:PAYOUT_STATUS.COMPLETED}},
            {$group:{_id:null,value:{$sum:1}}}
          ],
          failedPayouts:[
            {$match:{status:PAYOUT_STATUS.FAILED}},
            {$group:{_id:null,value:{$sum:1}}}
          ],
          processingPayouts:[
            {$match:{status:PAYOUT_STATUS.PROCESSING}},
            {$group:{_id:null,value:{$sum:1}}}
          ],
          totalRevenue:[
            {$group:{_id:null,value:{$sum:"$grossAmount"}}}
          ],
          totalCommision:[
            {$group:{_id:null,value:{$sum:"$commissionAmount"}}}
          ],
          totalNetAmount:[
            {$group:{_id:null,value:{$sum:"$netAmount"}}}
          ],
        }
      }
    ];

    const [result] = await this.model.aggregate(pipeline);

    return {
      totalPayouts: result?.totalPayouts?.[0]?.value || 0,
      totalReleased: result?.completedPayouts?.[0]?.value || 0,
      totalFailed: result?.failedPayouts?.[0]?.value || 0,
      totalRevanue: result?.totalRevenue?.[0]?.value || 0,
      commissionEarned: result?.totalCommision?.[0]?.value || 0,
      netAmount: result?.totalNetAmount?.[0]?.value || 0,
    };
  }

  async findAllPayouts(
    page: number,
    limit: number,
    search?: string,
    filter?: PayoutFilter
  ): Promise<{ payouts: FindAllPayoutsResponseDto[]; total: number }> {
    const matchStage:FilterQuery<IPayout> = {};
    if (filter) {
      matchStage.status = filter;
    }

    const pipeline: mongoose.PipelineStage[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendorData',
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      { $addFields: { vendor: { $arrayElemAt: ['$vendorData', 0] } } },
      {
        $lookup: {
          from: 'schedulepackages',
          localField: 'scheduleId',
          foreignField: '_id',
          as: 'scheduleData',
        },
      },
      { $addFields: { schedule: { $arrayElemAt: ['$scheduleData', 0] } } },
      {
        $lookup: {
          from: 'packages',
          localField: 'schedule.packageId',
          foreignField: '_id',
          as: 'packageData',
          pipeline: [{ $project: { title: 1 } }],
        },
      },
      { $addFields: { package: { $arrayElemAt: ['$packageData', 0] } } },
    ];

    if (search?.trim()) {
      pipeline.push({
        $match: {
          $or: [
            { 'vendor.name': { $regex: search.trim(), $options: 'i' } },
            { 'package.title': { $regex: search.trim(), $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push(
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                id: '$_id',
                vendorname: '$vendor.name',
                scheduleStartDate: '$schedule.startDate',
                scheduleEndDate: '$schedule.endDate',
                packageTittle: '$package.title',
                grossAmount: 1,
                commissionAmount: 1,
                netAmount: 1,
                status: 1,
                scheduledAt: 1,
              },
            },
          ],
        },
      }
    );

    const [result] = await this.model.aggregate(pipeline);
    
    return {
      payouts: result?.data || [],
      total: result?.metadata[0]?.total || 0,
    };
  }


}