import { injectable } from "tsyringe";
import { ICancellationPolicyService } from "../../interfaces/service_interfaces/admin/ICancellationPolicyService";

@injectable()
export class CancellationPolicyService implements ICancellationPolicyService { 

    constructor() { }
}