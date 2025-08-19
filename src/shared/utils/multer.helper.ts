import { Request } from "express";

// get a single uploaded file when using multer.fields

export function getFile(req: Request, fieldName: string): Express.Multer.File | null {
  if (req.files && !Array.isArray(req.files)) {
    return req.files[fieldName]?.[0] || null;
  }
  return null;
}

// get multiple uploaded files when using multer.fields
export function getFiles(req: Request, fieldName: string): Express.Multer.File[] {
  if (req.files && !Array.isArray(req.files)) {
    return req.files[fieldName] || [];
  }
  return [];
}