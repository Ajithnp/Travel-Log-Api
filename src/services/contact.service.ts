import { inject, injectable } from "tsyringe";
import { CreateContactRequestDTO, IContactService } from "../interfaces/service_interfaces/IContactService";
import { IContactRepository } from "../interfaces/repository_interfaces/IContactRepository";
import { toObjectId } from "../shared/utils/database/objectId.helper";

@injectable()
export class ContactService implements IContactService {
   constructor(
    @inject('IContactRepository')
    private readonly _contactRepository: IContactRepository
   ){}

   async createContact (payload:CreateContactRequestDTO){
     await this._contactRepository.create({...payload,userId:payload.userId ? toObjectId(payload.userId) : null});
   };
}