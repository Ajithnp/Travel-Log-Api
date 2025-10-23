import nodemailer from 'nodemailer';
import { IEmailUtils } from 'interfaces/common_interfaces/IEmailUtils';
import { injectable } from 'tsyringe';
import { config } from '../../config/env';

@injectable()
export class EmailUtils implements IEmailUtils {
  private _transporter;

  constructor() {
    this._transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS
      auth: {
        user: config.nodeMailer.EMAIL_HOST,
        pass: config.nodeMailer.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html?: string;
    // otp: string,
    text?: string;
    // matter: string
  }): Promise<void> {
    const mailOptions = {
      from: `"TravelLog" <${config.nodeMailer.EMAIL_HOST}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    await this._transporter.sendMail(mailOptions);
  }
}
