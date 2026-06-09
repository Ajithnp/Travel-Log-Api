import { inject, injectable } from 'tsyringe';
import { IAdminFinanceController } from '../../interfaces/controller_interfaces/admin/IAdminFinanceController';
import { IAdminFinanceService } from '../../interfaces/service_interfaces/admin/IAdminFinanceService';

@injectable()
export class AdminFinanceController implements IAdminFinanceController {
  constructor(
    @inject('IAdminFinanceService')
    private _adminFinanceService: IAdminFinanceService,
  ) {}
}
