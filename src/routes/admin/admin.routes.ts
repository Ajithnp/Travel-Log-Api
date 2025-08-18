import { inject, injectable } from "tsyringe";
import { BaseRoute } from "../../routes/base.routes";
import { IAdminUserController } from "../../interfaces/controller_interfaces/IAdminUserController";

@injectable()
export class AdminRoutes extends BaseRoute {

    constructor(
        @inject("IAdminUserController")
        private _adminUserContoller : IAdminUserController,
    ){

        super();
        this.initializeRoutes();
    }

    protected initializeRoutes(): void {

        //============ user management ====================
        this._router.get(
            '/get-users',
            this._adminUserContoller.getAllUsers.bind(this._adminUserContoller)

        );

        this.router.patch(
            '/user/:userId/block',
            this._adminUserContoller.blockOrUnclockUser.bind(this._adminUserContoller)
        );

         //========== vendor management ==================

        //  this._router.get(
        //     'get-vendors',
            
        //  )
        
    };

   
    
};