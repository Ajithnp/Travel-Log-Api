import { inject, injectable } from "tsyringe";
import { BaseRoute } from "../../routes/base.routes";
import { IAdminUserController } from "../../interfaces/controller_interfaces/admin/IAdminUserController";
import { IAdminVendorController } from "../../interfaces/controller_interfaces/admin/IAdminVendorController";
@injectable()
export class AdminRoutes extends BaseRoute {

    constructor(
        @inject("IAdminUserController")
        private _adminUserContoller : IAdminUserController,
        @inject("IAdminVendorController")
        private _adminVendorController : IAdminVendorController,
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

         this.router.get(
            '/vendor/verification-requests',
            this._adminVendorController.vendorVerificationRequest.bind(this._adminVendorController)
         );

         this.router.patch(
            '/update-vendor-verification/:id',
            this._adminVendorController.updateVendorverification.bind(this._adminVendorController)
         )

         this._router.get(
            'get-vendors',
            this._adminVendorController.getVendors.bind(this._adminVendorController)
            
         );
        
    };

   
    
};