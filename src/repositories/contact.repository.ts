import ContactModel from "../models/contact.model";
import { BaseRepository } from "./base.repository";
import { IContact } from "../types/entities/contact.entity";
import { IContactRepository } from "../interfaces/repository_interfaces/IContactRepository";
import { injectable } from "tsyringe";


@injectable()
export class ContactRepository extends BaseRepository<IContact> implements IContactRepository {
    constructor() {
        super(ContactModel);
    }
}