import { IFile } from "types/entities/base-package.entity";

export interface IReviewService {
    
    addReview:(userId:string,reviewDto:IReviewRequestDto)=>Promise<void>;
};

export interface IReviewRequestDto{
    bookingId:string;
    rating:number;
    text:string;
    images?:IFile[];
}