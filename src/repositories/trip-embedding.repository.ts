import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';
import { ITripEmbedding } from '../types/entities/trip-embedding.entity';
import { TripEmbeddingModel } from '../models/trip-embedding.model';
import { ITripEmbeddingRepository } from '../interfaces/repository_interfaces/ITripEmbeddingRepository';


@injectable()
export class TripEmbeddingRepository extends BaseRepository<ITripEmbedding> implements ITripEmbeddingRepository {
  constructor() {
    super(TripEmbeddingModel);
  }
}