import { IBaseRepository } from "./IBaseRepository";
import { ITripEmbedding } from "../../types/entities/trip-embedding.entity";


export interface ITripEmbeddingRepository extends IBaseRepository<ITripEmbedding> {
//   generateEmbeddings(packageId: string): Promise<void>;
  deleteByScheduleId(scheduleId: string): Promise<void>;
}