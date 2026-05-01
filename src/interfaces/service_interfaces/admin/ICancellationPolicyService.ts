import { CancellationPolicyResponseDto, CreateCancellationPolicyDto, StatusToggleDto } from "types/dtos/admin/cancellation-policy.dtos";


export interface ICancellationPolicyService { 
    createPolicy(payload: CreateCancellationPolicyDto): Promise<CancellationPolicyResponseDto>;
    getPolicies(): Promise<CancellationPolicyResponseDto[]> 
    togglePolicyActiveStatus(id: string, isActive: boolean): Promise<CancellationPolicyResponseDto>;
}