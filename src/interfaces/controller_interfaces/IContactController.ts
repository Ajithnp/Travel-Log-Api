import { RequestHandler } from "express";

export interface IContactController {
   createContact:RequestHandler;
   contactEnquiries:RequestHandler;
   updateEnquiry:RequestHandler;
}