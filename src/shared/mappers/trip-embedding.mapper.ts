import { SCHEDULE_STATUS } from "../../shared/constants/constants";
import { buildCombinedText } from "../utils/embedding/build-combined-text";
import { getMinimumPrice } from "../utils/booking/get-minimum-price";
import { ITripEmbedding } from "../../types/entities/trip-embedding.entity";
import { ISchedule } from "../../types/entities/schedule.entity";
import { IBasePackageEntity } from "../../types/entities/base-package.entity";


export class TripEmbeddingMapper {

  static toEntity(schedule: ISchedule, pkg: IBasePackageEntity, embedding: number[], combinedText:string): Partial<ITripEmbedding> {
    const seatsAvailable = schedule.totalSeats - schedule.seatsBooked;
    return {
      scheduleId: schedule._id,
      packageId: pkg._id,
      combinedText,
      embedding,
      title: pkg.title,
      location: pkg.location,
      state: pkg.state,
      minPrice: getMinimumPrice(schedule.pricing),
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      seatsAvailable,
      difficultyLevel: pkg.difficultyLevel,
      days: pkg.days,
      nights: pkg.nights,
      isActive: schedule.status === SCHEDULE_STATUS.UPCOMING && seatsAvailable > 0,
    };
  }
}
