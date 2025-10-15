import { injectable } from 'tsyringe';
import { IBcryptUtils } from 'interfaces/common_interfaces/IBcryptUtils';
import bcrypt from 'bcrypt';
import { config } from '../../config/env';

@injectable()
export class BcryptUtils implements IBcryptUtils {
  private readonly saltRounds: number;
  private readonly secretKey: string;

  constructor() {
    this.saltRounds = Number(config.password.SALT_ROUNDS);
    this.secretKey = config.password.PASSWORD_HASH_SECRET;
  }

  async hashPassword(password: string): Promise<string> {
    const passwordWithKey = password + this.secretKey;
    return await bcrypt.hash(passwordWithKey, this.saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    const passwordWithKey = password + this.secretKey;
    return await bcrypt.compare(passwordWithKey, hashedPassword);
  }
}
