import { IBaseRepository } from "./IBaseRepository";
import { IReview, IReviewUserPopulated } from "../../types/entities/review.entity";

export interface IReviewRepository extends IBaseRepository<IReview> {

    findByPackageId(packageId: string, userId:string): Promise<IReview | null>;

    getRatingStats(packageId: string): Promise<IRatingStatsSummary>;

    getAverageRating(packageId:string):Promise<{average:number,total:number}>

    findAllByPackageId(filters: PublicReviewFilters): Promise<{reviews: IReviewUserPopulated[],total: number}>
}

export interface PublicReviewFilters{
    packageId: string;
    page: number;
    limit: number;
    userId?: string; 
}

export interface IRatingStatsSummary {
  average:   number
  total:     number
  breakdown: { 1: number; 2: number; 3: number; 4: number; 5: number }
}