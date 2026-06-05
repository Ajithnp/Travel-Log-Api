export interface ICouponService {
  createCoupon(payload: ICreateCouponTemplateRequestDto): Promise<ICreateCouponTemplateResponseDto>;
  deActivateCoupon(couponId: string): Promise<void>;
  getAllCoupons(
    page: number,
    limit: number,
    search?: string,
    isActive?: boolean,
  ): Promise<PaginatedCouponResponse>;
  processLuckyDrawCoupons(userId: string): Promise<void>;
}

export interface ICreateCouponTemplateRequestDto {
  title: string;
  rewardValue: number;
  probability: number;
}

export type ICreateCouponTemplateResponseDto = ICreateCouponTemplateRequestDto;

export interface ICouponTemplateResponseDto {
  id: string;
  title: string;
  rewardValue: number;
  probability: number;
  isActive: boolean;
}

export interface PaginatedCouponResponse {
  data: ICouponTemplateResponseDto[];
  totalDocs: number;
  currentPage: number;
  totalPages: number;
  activeCount: number;
  inactiveCount: number;
}
