import { SCHEDULE_STATUS } from "../../shared/constants/constants";
import { getMinimumPrice } from "../utils/booking/get-minimum-price";
import { ITripEmbedding } from "../../types/entities/trip-embedding.entity";
import { ISchedule } from "../../types/entities/schedule.entity";
import { IBasePackagePopulatedByCategory } from "../../types/entities/base-package.entity";


export class TripEmbeddingMapper {

  static toEntity(schedule: ISchedule, pkg: IBasePackagePopulatedByCategory, embedding: number[], combinedText:string): Partial<ITripEmbedding> {
    const seatsAvailable = schedule.totalSeats - schedule.seatsBooked;
    return {
      scheduleId: schedule._id,
      packageId: pkg._id,
      combinedText,
      embedding,
      title: pkg.title,
      location: pkg.location,
      state: pkg.state,
      imageKey: pkg.images?.[0]?.key || null,
      minPrice: getMinimumPrice(schedule.pricing),
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      seatsAvailable,
      difficultyLevel: pkg.difficultyLevel,
      category:pkg.categoryId.name,
      days: pkg.days,
      nights: pkg.nights,
      packageAverageRating:Number(pkg.averageRating || 0),
      packageTotalReviews:Number(pkg.totalReviews || 0),
      isActive: schedule.status === SCHEDULE_STATUS.UPCOMING && seatsAvailable > 0,
    };
  }
}
