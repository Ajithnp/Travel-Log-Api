export interface IEmailUtils {
  sendEmail(to: string, subject: string, link: string, matter: string): Promise<void>;
}
