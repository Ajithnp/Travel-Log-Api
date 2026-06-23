import { inject, injectable } from "tsyringe";
import { ContactEnquiriesResponseDTO, CreateContactRequestDTO, IContactResponseDTO, IContactService } from "../interfaces/service_interfaces/IContactService";
import { IContactRepository } from "../interfaces/repository_interfaces/IContactRepository";
import { toObjectId } from "../shared/utils/database/objectId.helper";
import { CONTACT_STATUS, ContactStatus } from "../shared/constants/constants";
import { IContact } from "../types/entities/contact.entity";
import { AppError } from "../errors/AppError";
import { ERROR_MESSAGES } from "../shared/constants/messages";
import { HTTP_STATUS } from "../shared/constants/http_status_code";

@injectable()
export class ContactService implements IContactService {
   constructor(
      @inject('IContactRepository')
      private readonly _contactRepository: IContactRepository
   ) { }

   static toContactResponseDTO(contact: Partial<IContact>): IContactResponseDTO {
      return {
         id: contact._id?.toString() ?? '',
         name: contact.name ?? '',
         email: contact.email ?? '',
         phone: contact.phone ?? '',
         subject: contact.subject ?? '',
         message: contact.message ?? '',
         isGuest: contact.isGuest ?? false,
         status: contact.status ?? CONTACT_STATUS.PENDING,
         createdAt: contact.createdAt ?? new Date(),
         updatedAt: contact.updatedAt ?? new Date()
      }
   }

   async createContact(payload: CreateContactRequestDTO) {
      await this._contactRepository.create({ ...payload, userId: payload.userId ? toObjectId(payload.userId) : null });
   };

   async contactEnquiries(page: number, limit: number, search: string, status: ContactStatus): Promise<ContactEnquiriesResponseDTO> {
      const { enquiries, totalCount, pendingCount, resolvedCount } = await this._contactRepository.findAllEnquiries(page, limit, search, status)

      return {
         data: enquiries.map(contact => ContactService.toContactResponseDTO(contact)),
         currentPage: page,
         totalPages: Math.ceil(totalCount / limit),
         totalDocs: totalCount,
         pendingCount,
         resolvedCount
      }
   }

   async updateEnquiry(enquiryId: string): Promise<string> {
      const enquiry = await this._contactRepository.findById(enquiryId);
      if (!enquiry) throw new AppError(ERROR_MESSAGES.ENQUIRY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

      if (enquiry.status === CONTACT_STATUS.RESOLVED) throw new AppError(ERROR_MESSAGES.ENQUIRY_ALREADY_RESOLVED, HTTP_STATUS.BAD_REQUEST);

      const updatedEnquiry = await this._contactRepository.findOneAndUpdate({ _id: toObjectId(enquiryId) }, { status: CONTACT_STATUS.RESOLVED });
      if (!updatedEnquiry) throw new AppError(ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);

      return updatedEnquiry._id.toString();
   };
}