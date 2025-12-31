import { injectable } from "tsyringe";
import { IBasePackageRepository } from "../interfaces/repository_interfaces/IBasePackageRepository";
import { BaseRepository } from "./base.repository";
import { IBasePackage } from "../types/entities/base-package.entity";
import { BasePackageModel } from "../models/package.model";

@injectable()
export class BasePackageRepository extends BaseRepository<IBasePackage> implements IBasePackageRepository {
    constructor() {
        super(BasePackageModel)
    }
}

