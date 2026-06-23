"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancellationPolicyMapper = void 0;
class CancellationPolicyMapper {
    static toResponseDto(policy) {
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
    static toPaginatedResponseDto(policies, total) {
        return {
            data: policies.map(CancellationPolicyMapper.toResponseDto),
            total,
        };
    }
}
exports.CancellationPolicyMapper = CancellationPolicyMapper;
