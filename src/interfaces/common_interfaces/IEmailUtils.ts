export interface IEmailUtils {
  sendEmail(options: { to: string; subject: string; html?: string; text?: string }): Promise<void>;
}
