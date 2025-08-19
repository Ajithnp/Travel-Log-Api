import nodemailer from "nodemailer";
import { IEmailUtils } from "types/common/IEmailUtils";
import { injectable } from "tsyringe";
import { config } from "../../config/env";
import { ACCOUNT_VERIFICATION } from "../templates/email_templates";

@injectable()
export class EmailUtils implements IEmailUtils {
    private _transporter;

    constructor(){
        this._transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // TLS
            auth: {
                user:config.nodeMailer.EMAIL_HOST,
                pass:config.nodeMailer.EMAIL_PASSWORD
            },
        });
    }

    

    async sendEmail(to: string, subject: string, otp: string, matter:string ): Promise<void> {
        const mailOptions = {
            from: `"MyApp" <${config.nodeMailer.EMAIL_HOST}>`,
            to,
            subject,
            html: ACCOUNT_VERIFICATION(otp, matter),
        }
        
        await this._transporter.sendMail(mailOptions)
    }

}
