export interface UploadedFile {
  fieldName: string;
  fileUrl: string;
}
export function hasFile(files: UploadedFile[], fieldName: string): boolean {
  return files.some((f) => f.fieldName === fieldName);
}
