import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';
import { ITripEmbedding } from '../types/entities/trip-embedding.entity';
import { TripEmbeddingModel } from '../models/trip-embedding.model';
import { ITripEmbeddingRepository } from '../interfaces/repository_interfaces/ITripEmbeddingRepository';
import mongoose from 'mongoose';


@injectable()
export class TripEmbeddingRepository extends BaseRepository<ITripEmbedding> implements ITripEmbeddingRepository {
  constructor() {
    super(TripEmbeddingModel);
  }

  async deleteByScheduleId(scheduleId: string): Promise<void> {
    await this.model.deleteOne({ scheduleId: new mongoose.Types.ObjectId(scheduleId) }).exec();
  }
}