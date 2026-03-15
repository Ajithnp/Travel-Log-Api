

interface VendorVerificationFile {
  fieldName: string;
  key: string;
}

export interface VendorVerificationRequestDTO {
  files: VendorVerificationFile[];
  ownerName: string;
  businessAddress: string;
  gstin: string;
  accountNumber: string;
  ifsc: string;
  accountHolderName: string;
  bankName: string;
  branch:string

}



//==== category=====

export interface VendorCategoryRequestInputDTO {
  name: string;
  vendorNote: string;
}

//===========schedule package===============

export interface CreateScheduleInputDTO {
  packageId: string;
  startDate: string; // ISO string from client
  endDate: string;
  reportingTime: string;
  reportingLocation: string;
  pricing: {
    solo: number;
    duo?: number;
    group?: number;
  };
  totalSeats: number;
  notes?: string;
}
