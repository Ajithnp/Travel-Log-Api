import { IFile } from "types/entities/base-package.entity";

export interface IReviewService {
    
    addReview:(userId:string,reviewDto:IReviewRequestDto)=>Promise<void>;
    deleteReview:(reviewId:string,userId:string)=>Promise<void>;
};

export interface IReviewRequestDto{
    bookingId:string;
    rating:number;
    text:string;
    images?:IFile[];
}