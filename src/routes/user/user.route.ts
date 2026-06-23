import { inject, injectable } from 'tsyringe';
import BaseRoute from '../base.route';
import { IUserController } from '../../interfaces/controller_interfaces/user/IUserController';
import { IUserProfileController } from '../../interfaces/controller_interfaces/user/IUserProfileController';
import { isAuthenticated, optionalAuth } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/aurhorization.middleware';
import { USER_ROLES } from '../../shared/constants/roles';
// import { otpLimiter } from '../../config/rate.limiter.config';
// import { makeRateLimiter } from '../../middlewares/rate.limiter.middleware';
import { validateDTO } from '../../middlewares/validate.dto.middleware';
import {
  UpdateEmailSchema,
  ChangeEmailRequestSchema,
  ResetPasswordSchema,
  UpdateProfileSchema,
} from '../../types/dtos/user/request.dtos';
import { publicPackageQuerySchema } from '../../validators/public-package.validation';
import { makeRateLimiter } from '../../middlewares/rate.limiter.middleware';
import { wishlistToggleLimiter } from '../../config/rate.limiter.config';
import { IChatController } from '../../interfaces/controller_interfaces/IChatController';
import { IWalletController } from '../../interfaces/controller_interfaces/user/IWalletController';
import { ICouponController } from '../../interfaces/controller_interfaces/ICouponController';
import { contactFormRequestSchema } from '../../validators/contact.validation';
import { IContactController } from '../../interfaces/controller_interfaces/IContactController';

@injectable()
export class UserRoutes extends BaseRoute {
  constructor(
    @inject('IUserController')
    private _userController: IUserController,

    @inject('IUserProfileController')
    private _userProfileController: IUserProfileController,

    @inject('IChatController')
    private _chatController: IChatController,

    @inject('IWalletController')
    private _walletController: IWalletController,

    @inject('ICouponController')
    private _couponController: ICouponController,

     @inject('IContactController')
    private _contactController: IContactController,
  ) {
    super();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    // public //
    this._router.get(
      '/packages/public',
      validateDTO(publicPackageQuerySchema),
      this._userController.getPublicPackages.bind(this._userController),
    );

    this._router.get(
      '/packages/categories',
      this._userController.getCategories.bind(this._userController),
    );

    this._router.get(
      '/packages/:packageId',
      this._userController.getPackageDetails.bind(this._userController),
    );

    this._router.get(
      '/packages/:packageId/schedules',
      this._userController.getPackageSchedules.bind(this._userController),
    );

    this._router.get(
      '/packages/vendors/:vendorId/profile',
      this._userController.getVendorPublicProfile.bind(this._userController),
    );

    this._router.get(
      '/me',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._userProfileController.profile.bind(this._userController),
    );

    this._router.put(
      '/me',
      validateDTO(UpdateProfileSchema),
      isAuthenticated,
      authorize([USER_ROLES.USER, USER_ROLES.VENDOR]),
      this._userProfileController.updateProfile.bind(this._userProfileController),
    );

    this._router.post(
      '/me/change-email',
      validateDTO(ChangeEmailRequestSchema),
      isAuthenticated,
      authorize([USER_ROLES.USER, USER_ROLES.VENDOR]),
      this._userProfileController.updateEmailRequest.bind(this._userProfileController),
    );

    this._router.patch(
      '/me/email',
      validateDTO(UpdateEmailSchema),
      isAuthenticated,
      authorize([USER_ROLES.USER, USER_ROLES.VENDOR]),
      this._userProfileController.updateEmail.bind(this._userProfileController),
    );

    this._router.patch(
      '/me/password',
      validateDTO(ResetPasswordSchema),
      isAuthenticated,
      authorize([USER_ROLES.USER, USER_ROLES.VENDOR]),
      this._userProfileController.resetPassword.bind(this._userProfileController),
    );

    // wishlist
    this._router.post(
      '/wishlist/:packageId',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      makeRateLimiter(wishlistToggleLimiter, 'userId'),
      this._userController.toggleWishlist.bind(this._userController),
    );

    this._router.get(
      '/wishlist/ids',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._userController.getWishlistedIds.bind(this._userController),
    );

    this._router.get(
      '/wishlist',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._userController.getWishlist.bind(this._userController),
    );

    this._router.get(
      '/wishlist/count',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._userController.getWishlistCount.bind(this._userController),
    );

    // Chat
    this._router.get(
      '/chats/:chatId',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._chatController.getUserChat.bind(this._chatController),
    );

    this._router.post(
      '/chats/:chatId/messages',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._chatController.sendUserMessage.bind(this._chatController),
    );

    this._router.get(
      '/chats/:chatId/messages',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._chatController.getUserChatMessages.bind(this._chatController),
    );

    // Wallet
    this._router.get(
      '/wallet/balance',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._walletController.getWalletBalance.bind(this._walletController),
    );

    this._router.get(
      '/wallet',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._walletController.getWallet.bind(this._walletController),
    );

    //dashboard
    this._router.get(
      '/dashboard',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._userController.dashboard.bind(this._userController),
    );
    // reward
    this._router.get(
      '/reward/unrevealed',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._couponController.getUserReward.bind(this._couponController),
    );

    this._router.patch(
      '/reward/:rewardId/reveal',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._couponController.revealReward.bind(this._couponController),
    );

    this._router.post(
      '/contact',
      optionalAuth,
      validateDTO(contactFormRequestSchema),
      this._contactController.createContact.bind(this._contactController),
    );
  }
}
