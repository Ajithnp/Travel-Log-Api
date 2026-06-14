import { injectable } from "tsyringe";
import { BaseRepository } from "./base.repository";
import mongoose from "mongoose";
import { IPayoutRepository, PayoutStatsResult } from "../interfaces/repository_interfaces/IPayoutRepository";
import { PayoutModel } from "../models/payout.model";
import { IPayout } from "../types/entities/payout.entity";

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

  async getPayoutStats(): Promise<PayoutStatsResult> {
    const pipeline: mongoose.PipelineStage[] = [
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                gross: { $sum: '$grossAmount' },
                commission: { $sum: '$commissionAmount' },
                net: { $sum: '$netAmount' },
              },
            },
          ],
        },
      },
    ];

    const [result] = await this.model.aggregate(pipeline);

    return {
      totalPayouts: result?.totalCount[0]?.count || 0,
      byStatus: result?.byStatus || [],
    };
  }


}