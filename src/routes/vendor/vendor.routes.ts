import { inject, injectable } from 'tsyringe';
import BaseRoute from '../base.route';
import { IVendorController } from '../../interfaces/controller_interfaces/vendor/IVendorController';
import { IVendorPackageController } from '../../interfaces/controller_interfaces/vendor/IVendorPackageController';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/aurhorization.middleware';
import { USER_ROLES } from '../../shared/constants/roles';
import { validateDTO } from '../../middlewares/validate.dto.middleware';
import { PackageCreateUnionSchema } from '../../validators/vendor/package/base-package.schema';
import { IVendorCategoryController } from '../../interfaces/controller_interfaces/vendor/IVendorCategoryController';
import { getRequestedCategorySchema } from '../../validators/vendor/category.validation';
import { requestCategorySchema } from '../../validators/category.validation';
import { ISchedulePackageController } from '../../interfaces/controller_interfaces/vendor/IShedulePackageController';
import {
  createScheduleSchema,
  updateScheduleStatusSchema,
} from '../../validators/vendor/schedule-package.validation';
import { UpdateProfileLogoRequestSchema } from '../../validators/vendor/profile.validation';
import { VendorVerificationSchema } from '../../validators/vendor/vendor-verification';
import { IChatController } from '../../interfaces/controller_interfaces/IChatController';
import { IDocumentController } from '../../interfaces/controller_interfaces/IDocumentController';

import { IVendorOfferController } from '../../interfaces/controller_interfaces/vendor/IVendorOfferController';
import {
  createOfferSchema,
  getVendorOffersQuerySchema,
} from '../../validators/vendor/offer.validation';
import { CONTROLLER_TOKENS } from '../../shared/constants/di.tokens';
import { IVendorRevenueController } from '../../interfaces/controller_interfaces/vendor/IVendorRevenueController';
import { IPayoutController } from 'interfaces/controller_interfaces/IPayoutContoller';

@injectable()
export class VendorRoutes extends BaseRoute {
  constructor(
    @inject('IVendorController')
    private _vendorController: IVendorController,
    @inject('IVendorPackageController')
    private _vendorPackageController: IVendorPackageController,
    @inject('IVendorCategoryController')
    private _vendorCategoryController: IVendorCategoryController,
    @inject('ISchedulePackageController')
    private _schedulePackageController: ISchedulePackageController,
    @inject('IChatController')
    private _chatController: IChatController,
    @inject('IDocumentController')
    private _documentController: IDocumentController,
    @inject(CONTROLLER_TOKENS.VENDOR_OFFER_CONTROLLER)
    private _vendorOfferController: IVendorOfferController,
    @inject('IVendorRevenueController')
    private _vendorRevenueController: IVendorRevenueController,
    @inject('IPayoutController')
    private _payoutController: IPayoutController,
  ) {
    super();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this._router.get(
      '/me',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._vendorController.profile.bind(this._vendorController),
    );

    this._router.patch(
      '/me/profileLogo',
      validateDTO(UpdateProfileLogoRequestSchema),
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._vendorController.updateProfileLogo.bind(this._vendorController),
    );

    this._router.post(
      '/verification',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      validateDTO(VendorVerificationSchema),
      this._vendorController.vendorVerificationSubmit.bind(this._vendorController),
    );

    this._router.get(
      '/verification/:vendorId/rejected',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._vendorController.getRejectedVendor.bind(this._vendorController),
    );

    this._router.put(
      '/verification/:vendorInfoId',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      validateDTO(VendorVerificationSchema),
      this._vendorController.vendorVerificationReapply.bind(this._vendorController),
    );
    /*---------------Package management--------------------- */
    this._router.post(
      '/packages',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      validateDTO(PackageCreateUnionSchema),
      this._vendorPackageController.createPackage.bind(this._vendorPackageController),
    );

    this._router.get(
      '/packages/offers-context',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._vendorPackageController.getPackagesForOffer.bind(this._vendorPackageController),
    );

    this._router.get(
      '/packages',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._vendorPackageController.fetchPackages.bind(this._vendorPackageController),
    );

    this._router.put(
      '/packages/:packageId',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      validateDTO(PackageCreateUnionSchema),
      this._vendorPackageController.updatePackage.bind(this._vendorPackageController),
    );

    this._router.get(
      '/packages/:packageId',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._vendorPackageController.fetPackagesWithId.bind(this._vendorPackageController),
    );

    this._router.delete(
      '/packages/:packageId',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._vendorPackageController.deletePackage.bind(this._vendorPackageController),
    );

    this.router.patch(
      '/packages/:packageId/restore',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._vendorPackageController.restorePackage.bind(this._vendorPackageController),
    );

    this._router.get(
      '/packages/:packageId/schedule-context',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._vendorPackageController.getPackageScheduleContext.bind(this._vendorPackageController),
    );

    //======category

    this._router.get(
      '/categories/request',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      validateDTO(getRequestedCategorySchema),
      this._vendorCategoryController.getVendorsRequestCategories.bind(
        this._vendorPackageController,
      ),
    );

    this._router.get(
      '/categories',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._vendorCategoryController.getActiveCategories.bind(this._vendorPackageController),
    );

    this._router.post(
      '/categories',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      validateDTO(requestCategorySchema),
      this._vendorCategoryController.requestCategory.bind(this._vendorPackageController),
    );

    // schedule package

    this._router.post(
      '/schedules/packages/:packageId',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      validateDTO(createScheduleSchema),
      this._schedulePackageController.createSchedule.bind(this._schedulePackageController),
    );

    this._router.get(
      '/schedules',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._schedulePackageController.fetchSchedules.bind(this._schedulePackageController),
    );

    this._router.get(
      '/schedules/:scheduleId',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._schedulePackageController.getSchedule.bind(this._schedulePackageController),
    );

    this._router.get(
      '/schedules/:scheduleId/booking-summary',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._schedulePackageController.getVendorScheduleBookingSummary.bind(
        this._schedulePackageController,
      ),
    );

    this._router.get(
      '/schedules/:scheduleId/bookings',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._schedulePackageController.getScheduleBookings.bind(this._schedulePackageController),
    );

    this._router.get(
      '/schedules/:scheduleId/bookings/:bookingId',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._schedulePackageController.getScheduleBookingDetails.bind(
        this._schedulePackageController,
      ),
    );

    this._router.patch(
      '/schedules/:scheduleId/status',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      validateDTO(updateScheduleStatusSchema),
      this._schedulePackageController.updateScheduleStatus.bind(this._schedulePackageController),
    );

    this._router.get(
      '/schedules/:scheduleId/bookings/export/csv',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._documentController.getScheduleBookingsCSV.bind(this._documentController),
    );

    //===chat
    this._router.get(
      '/chats',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._chatController.getVendorChats.bind(this._chatController),
    );

    this._router.get(
      '/chats/:chatId/messages',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._chatController.getVendorChatMessages.bind(this._chatController),
    );

    this._router.post(
      '/chats/:chatId/messages',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._chatController.sendVendorMessage.bind(this._chatController),
    );

    this._router.patch(
      '/chats/:chatId/pin',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._chatController.pinMessage.bind(this._chatController),
    );

    this._router.patch(
      '/chats/:chatId/members/:userId',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._chatController.removeMember.bind(this._chatController),
    );

    this._router.patch(
      '/chats/:chatId/archive',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._chatController.archiveChat.bind(this._chatController),
    );

    this._router.get(
      '/chats/:chatId/members',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._chatController.getChatMembers.bind(this._chatController),
    );

    this._router.patch(
      '/chats/:chatId/read',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._chatController.markChatAsReadForVendor.bind(this._chatController),
    );

    //===offers
    this._router.post(
      '/offers',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      validateDTO(createOfferSchema),
      this._vendorOfferController.createOffer.bind(this._vendorOfferController),
    );

    this._router.get(
      '/offers',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      validateDTO(getVendorOffersQuerySchema),
      this._vendorOfferController.getOffers.bind(this._vendorOfferController),
    );

    this._router.patch(
      '/offers/:offerId/deactivate',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._vendorOfferController.deactivateOffer.bind(this._vendorOfferController),
    );

    //== revenue
    this._router.get(
      '/revenue/packages-earnings',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._vendorRevenueController.packagesEarningOverview.bind(this._vendorRevenueController),
    );
    //=== payouts
    this._router.get(
      '/payouts',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._payoutController.findAllVendorPayouts.bind(this._payoutController),
    );
  }
}
