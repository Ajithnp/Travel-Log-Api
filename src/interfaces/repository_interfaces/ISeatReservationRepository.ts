import {
  ISeatReservation,
  SeatReservationStatus,
} from '../../types/entities/seat-reservation.entity';
import { IBaseRepository } from './IBaseRepository';

export interface ISeatReservationRepository extends IBaseRepository<ISeatReservation> {
  findByPaymentIntentId(paymentIntentId: string): Promise<ISeatReservation | null>;
  updateStatus(id: string, status: SeatReservationStatus): Promise<ISeatReservation | null>;
}
