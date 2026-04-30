import { inject, injectable } from "tsyringe";
import { ICancellationPolicyService } from "../../interfaces/service_interfaces/admin/ICancellationPolicyService";
import { ICancellationPolicyRepository } from "../../interfaces/repository_interfaces/ICancellationPolicyRepository";
import { CancellationPolicyResponseDto, CreateCancellationPolicyDto } from "../../types/dtos/admin/cancellation-policy.dtos";
import { AppError } from "../../errors/AppError";
import { CancellationPolicyMapper } from "../../shared/mappers/canellation-policy.mapper";
import { HTTP_STATUS } from "../../shared/constants/http_status_code";

@injectable()
export class CancellationPolicyService implements ICancellationPolicyService { 

    constructor(
        @inject('ICancellationPolicyRepository')
        private _policyRepository: ICancellationPolicyRepository)
    { }

    async createPolicy(payload: CreateCancellationPolicyDto): Promise<CancellationPolicyResponseDto> {
       const existing = await this._policyRepository.findByKey(payload.key);
         if (existing) {
           throw new AppError(`A policy with key "${payload.key}" already exists`, HTTP_STATUS.CONFLICT);
         }
 
        const policy = await this._policyRepository.create(payload);
     return CancellationPolicyMapper.toResponseDto(policy);
  }
}