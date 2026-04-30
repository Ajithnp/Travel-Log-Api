import { CancellationPolicyResponseDto, CreateCancellationPolicyDto } from "types/dtos/admin/cancellation-policy.dtos";


export interface ICancellationPolicyService { 
    createPolicy(payload: CreateCancellationPolicyDto): Promise<CancellationPolicyResponseDto>;
    getPolicies(): Promise<CancellationPolicyResponseDto[]> 
}