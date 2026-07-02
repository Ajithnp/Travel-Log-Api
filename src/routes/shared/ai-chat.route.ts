import { inject, injectable } from "tsyringe";
import { IAIChatController } from "../../interfaces/controller_interfaces/IAIChatController";
import { authorize } from "../../middlewares/aurhorization.middleware";
import { isAuthenticated } from "../../middlewares/auth.middleware";
import { validateDTO } from "../../middlewares/validate.dto.middleware";
import BaseRoute from "../../routes/base.route";
import { USER_ROLES } from "../../shared/constants/roles";
import { chatbotQueryRequestSchema } from "../../validators/chatbot-query.validation";



@injectable()
export class AIChatRoutes extends BaseRoute {
  constructor(
    @inject('IAIChatController')
    private _aiChatController: IAIChatController,
  ) {
    super();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this._router.post(
      '/ask',
    //   isAuthenticated,
    //   authorize([USER_ROLES.USER]),
      validateDTO(chatbotQueryRequestSchema),
      this._aiChatController.askChatbot.bind(this._aiChatController),
    );

  }    
}