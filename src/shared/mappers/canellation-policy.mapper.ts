import { CancellationPolicyResponseDto, PaginatedPoliciesResponseDto } from "types/dtos/admin/cancellation-policy.dtos";
import { ICancellationPolicy } from "types/entities/cancellation-policy.entity";

export class CancellationPolicyMapper {
  static toResponseDto(policy: ICancellationPolicy): CancellationPolicyResponseDto {
    return {
      id: policy._id.toString(),
      key: policy.key,
      label: policy.label,
      description: policy.description,
      rules: policy.rules.map((rule) => ({
        daysBeforeTrip: rule.daysBeforeTrip,
        refundPercent: rule.refundPercent,
      })),
      isActive: policy.isActive,
      createdAt: policy.createdAt.toISOString(),
      updatedAt: policy.updatedAt.toISOString(),
    };
  }
 
  static toPaginatedResponseDto(
    policies: ICancellationPolicy[],
    total: number
  ): PaginatedPoliciesResponseDto {
    return {
      data: policies.map(CancellationPolicyMapper.toResponseDto),
      total,
    };
  }
}