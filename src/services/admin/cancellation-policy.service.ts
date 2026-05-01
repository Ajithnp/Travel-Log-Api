import { inject, injectable } from "tsyringe";
import { ICancellationPolicyService } from "../../interfaces/service_interfaces/admin/ICancellationPolicyService";
import { ICancellationPolicyRepository } from "../../interfaces/repository_interfaces/ICancellationPolicyRepository";
import { CancellationPolicyResponseDto, CreateCancellationPolicyDto, StatusToggleDto } from "../../types/dtos/admin/cancellation-policy.dtos";
import { AppError } from "../../errors/AppError";
import { CancellationPolicyMapper } from "../../shared/mappers/canellation-policy.mapper";
import { HTTP_STATUS } from "../../shared/constants/http_status_code";
import { toObjectId } from "../../shared/utils/database/objectId.helper";


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
    
    async getPolicies(): Promise<CancellationPolicyResponseDto[]> {

        const policies = await this._policyRepository.findAll();
     return policies.map(CancellationPolicyMapper.toResponseDto);
    }
    
    async togglePolicyActiveStatus(id: string, isActive: boolean): Promise<CancellationPolicyResponseDto> {
        const policyObjectId = toObjectId(id);
        
        const policy = await this._policyRepository.findOne({ _id: policyObjectId });
        if (!policy) {
          throw new AppError('Cancellation policy not found', HTTP_STATUS.NOT_FOUND);
        }

          if (policy.isActive === isActive) {
            return CancellationPolicyMapper.toResponseDto(policy);
          }

        const updatedPolicy = await this._policyRepository.toggleActive(id, isActive);
        if (!updatedPolicy) {
          throw new AppError('Failed to update cancellation policy status', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
        return CancellationPolicyMapper.toResponseDto(updatedPolicy);
    }
        
}