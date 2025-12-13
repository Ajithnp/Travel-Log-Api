import { RequestHandler } from "express";
export interface IS3Controller {

  generateUploadURL:RequestHandler;
  generateDownloadURL:RequestHandler;
}
