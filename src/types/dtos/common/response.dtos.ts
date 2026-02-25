export interface IGetUploadUrlResponse {
  url: string;
  key: string;
  fieldName: string;
  name: string;
}

export interface SignedUrlViewResponse {
  key: string;
  url: string;
}
