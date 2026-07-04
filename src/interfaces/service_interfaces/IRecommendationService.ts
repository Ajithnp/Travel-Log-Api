import { RecommendedPackagesResponseDTO } from './user/IPublicPackageService';

export interface IRecommendationService {
  getRecommendedPackages(userId: string): Promise<RecommendedPackagesResponseDTO[]>;
}
