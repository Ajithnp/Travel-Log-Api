import { ISeatReservation, SeatReservationStatus } from '../types/entities/seat-reservation.entity';
import { BaseRepository } from './base.repository';
import { ISeatReservationRepository } from '../interfaces/repository_interfaces/ISeatReservationRepository';
import { SeatReservationModel } from '../models/seat-reservation.model';

export class SeatReservationRepository
  extends BaseRepository<ISeatReservation>
  implements ISeatReservationRepository
{
  constructor() {
    super(SeatReservationModel);
  }

  async findByPaymentIntentId(paymentIntentId: string): Promise<ISeatReservation | null> {
    return this.model.findOne({ stripePaymentIntentId: paymentIntentId }).exec();
  }

  async updateStatus(id: string, status: SeatReservationStatus): Promise<ISeatReservation | null> {
    return this.model.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }
}
