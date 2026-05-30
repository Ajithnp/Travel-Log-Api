import { injectable } from "tsyringe";
import { BaseRepository } from "./base.repository";
import { IReview } from "../types/entities/review.entity";
import { IReviewRepository } from "../interfaces/repository_interfaces/IReviewRepository";
import { ReviewModel } from "../models/review.model";

@injectable()
export class ReviewRepository extends BaseRepository<IReview> implements IReviewRepository{

  constructor() {
    super(ReviewModel);
  }


  async findByPackageId(packageId: string, userId:string): Promise<IReview | null> {
    return await this.findOne({ packageId, userId });
  }

  

}