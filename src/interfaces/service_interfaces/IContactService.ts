import { ContactStatus } from "shared/constants/constants";
import { PaginatedData } from "types/common/IPaginationResponse";

export interface IContactService {
    createContact(payload:CreateContactRequestDTO):Promise<void>;
    contactEnquiries (page:number,limit:number,search:string,status:ContactStatus):Promise<ContactEnquiriesResponseDTO>;
    updateEnquiry(enquiryId: string): Promise<string>;
}

export interface CreateContactRequestDTO {
    userId:string | null;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    isGuest:boolean;
    
}

export interface IContactResponseDTO {
  id:string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isGuest:boolean;
  status:ContactStatus;
  createdAt:Date;
  updatedAt:Date;
};


export interface ContactEnquiriesResponseDTO extends PaginatedData<IContactResponseDTO> {
    pendingCount:number;
    resolvedCount:number;
}

