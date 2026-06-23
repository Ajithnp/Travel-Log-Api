export interface IContactService {
    createContact(payload:CreateContactRequestDTO):Promise<void>;
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