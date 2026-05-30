import { IBaseRepository } from "./IBaseRepository";
import { IReview } from "../../types/entities/review.entity";

export interface IReviewRepository extends IBaseRepository<IReview> {

    findByPackageId(packageId: string, userId:string): Promise<IReview | null>;
}