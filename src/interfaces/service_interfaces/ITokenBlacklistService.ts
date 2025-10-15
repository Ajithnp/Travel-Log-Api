export interface ITokenBlackListService {

    blackListToken(token: string, tokenExp: string): Promise<void>;

    isBlackListed(token: string): Promise<boolean>
}