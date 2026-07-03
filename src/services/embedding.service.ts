import { inject, injectable } from "tsyringe";
import { Types } from "mongoose";
import { ITripEmbeddingRepository } from "../interfaces/repository_interfaces/ITripEmbeddingRepository";
import { IEmbeddingService } from "../interfaces/service_interfaces/IEmbeddingService";
import { ISchedulePackageRepository } from "../interfaces/repository_interfaces/ISchedulePackage";
import { SCHEDULE_STATUS } from "../shared/constants/constants";
import { IBasePackageRepository } from "../interfaces/repository_interfaces/IBasePackageRepository";
import { buildCombinedText } from "../shared/utils/embedding/build-combined-text";
import { IAIProvider } from "../infrastructure/ai-integration/IAiIntegartion";
import { TripEmbeddingMapper } from "../shared/mappers/trip-embedding.mapper";


@injectable()
export class EmbeddingService implements IEmbeddingService {

    constructor(
        @inject('IAIProvider')
        private _aiProvider: IAIProvider,
        @inject('ITripEmbeddingRepository')
        private _tripEmbeddingRepository: ITripEmbeddingRepository,
        @inject('ISchedulePackageRepository')
        private _scheduleRepository: ISchedulePackageRepository,
        @inject('IBasePackageRepository')
        private _packageRepository: IBasePackageRepository,

    ) { }
    // -Single Schedule Embedding Generate + Save
    async generateAndSaveEmbedding(scheduleId: string, packageId: string): Promise<void> {

        const [schedule, pkg] = await Promise.all([
            this._scheduleRepository.findById(scheduleId),
            this._packageRepository.findByIdWithCategory(packageId)
        ])

        if (!schedule || !pkg) {
            return;
        }

        if (schedule.status !== SCHEDULE_STATUS.UPCOMING) {
            await this._tripEmbeddingRepository.deleteByScheduleId(scheduleId);
            return;
        }

        if (!pkg.isActive || pkg.isDeleted) {
            return;
        }

        const combinedText = buildCombinedText(pkg, schedule);

        // Gemini Embedding API call
        const embeddingVector = await this._aiProvider.getEmbeddingModel().embedQuery(combinedText);
        const embeddingData = TripEmbeddingMapper.toEntity(schedule, pkg, embeddingVector,combinedText);

        await this._tripEmbeddingRepository.findOneAndUpdate(
            { scheduleId: schedule._id },
            embeddingData,
            { upsert: true, new: true }
        );
    };
    
    async updateSeatsInEmbedding(scheduleId: string, seatsBooked: number, totalSeats: number): Promise<void> {
        const seatsAvailable = totalSeats - seatsBooked;

        await this._tripEmbeddingRepository.findOneAndUpdate(
            { scheduleId: new Types.ObjectId(scheduleId) },
            {
                seatsAvailable,
                isActive: seatsAvailable > 0,
            }
        );

    }

    async deleteEmbedding(scheduleId: string): Promise<void> {
        await this._tripEmbeddingRepository.deleteByScheduleId(scheduleId);
    }


}
