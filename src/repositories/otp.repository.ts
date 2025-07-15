import { OtpModel } from "../models/otp.model";
import { IOtp } from "../types/IOtp";
import { IBaseRepository } from "../interfaces/repository_interfaces/IBaseRepository";
import { BaseRepository } from "./base.repository";
import { IOtpRepository } from "../interfaces/repository_interfaces/IOtpRepository";
import { injectable } from "tsyringe";

@injectable()
export class OtpRepository extends BaseRepository<IOtp> implements OtpRepository  {

    constructor(){
        super(OtpModel)
    }

}