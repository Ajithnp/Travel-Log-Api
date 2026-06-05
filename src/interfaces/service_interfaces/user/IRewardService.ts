export interface IRewardService {
  getUnrevealedReward(userId: string): Promise<RewardResponseDto | null>;
  revealReward(rewardId: string, userId: string): Promise<void>;
}

export interface RewardResponseDto {
  title: string;
  rewardValue: number;
  id: string;
}
