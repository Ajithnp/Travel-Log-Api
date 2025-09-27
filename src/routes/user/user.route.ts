import { inject, injectable } from 'tsyringe';
import { BaseRoute } from '../../routes/base.routes';
import { IUserController } from '../../interfaces/controller_interfaces/user/IUserController';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/aurhorization.middleware';
import { USER_ROLES } from '../../shared/constants/roles';
@injectable()
export class UserRoutes extends BaseRoute {
    constructor(
        @inject('IUserController')
        private _userController: IUserController,
    ) {
        super()
        this.initializeRoutes();
    }

    protected initializeRoutes(): void {
        this._router.get(
            '/me',
            isAuthenticated,
            authorize([USER_ROLES.USER]),
            this._userController.profile.bind(this._userController)
        )
    }
}