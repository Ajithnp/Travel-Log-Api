import { RequestHandler } from "express";

export interface IAdminCancellationPolicyController { 
    createPolicy: RequestHandler;
    getPolicies: RequestHandler;
} 