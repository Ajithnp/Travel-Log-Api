import { injectable } from "tsyringe";
import { IBcryptUtils } from "types/common/IBcryptUtils";
import bcrypt from "bcrypt";

@injectable()
export class BcryptUtils implements IBcryptUtils {
    private readonly saltRounds: number;

    constructor() {
        this.saltRounds = 10; 
    }

    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltRounds);
    }

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}