import { inject, injectable } from "tsyringe";
import { IAIController } from "../../interfaces/controller_interfaces/IAIController";
import { authorize } from "../../middlewares/aurhorization.middleware";
import { isAuthenticated } from "../../middlewares/auth.middleware";
import { validateDTO } from "../../middlewares/validate.dto.middleware";
import BaseRoute from "../base.route";
import { USER_ROLES } from "../../shared/constants/roles";
import { chatbotQueryRequestSchema } from "../../validators/chatbot-query.validation";



@injectable()
export class AIRoutes extends BaseRoute {
  constructor(
    @inject('IAIController')
    private _aiController: IAIController,
  ) {
    super();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this._router.post(
      '/ask',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      validateDTO(chatbotQueryRequestSchema),
      this._aiController.askChatbot.bind(this._aiController),
    );

    this._router.get(
      '/packages/recommendations',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._aiController.getRecommendedPackages.bind(this._aiController),
    );

  }
}