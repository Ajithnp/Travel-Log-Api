export interface IEmbeddingService {
    generateAndSaveEmbedding(scheduleId: string, packageId: string): Promise<void>;
    updateSeatsInEmbedding(scheduleId: string, seatsBooked: number, totalSeats: number): Promise<void>;
    deleteEmbedding(scheduleId: string): Promise<void>;
}