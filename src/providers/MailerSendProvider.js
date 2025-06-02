import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { env } from "../config/environment";

const mailerSend = new MailerSend({
    apiKey: env.MAILERSEND_API_KEY,
});
// console.log(env.MAILERSEND_API_KEY);
const sendEmail = async (recipientEmail, customSubject, customHtmlContent) => {
    const sentFrom = new Sender(
        'support@test-p7kx4xwwyxvg9yjr.mlsender.net',
        env.ADMIN_EMAIL_NAME
    );
    // console.log(env.ADMIN_EMAIL_ADDRESS, env.ADMIN_EMAIL_NAME); 
    const recipients = [new Recipient(recipientEmail, "")];

    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(customSubject)
        .setHtml(customHtmlContent);

    try {
        const response = await mailerSend.email.send(emailParams);
        // console.log("Forgot",response);
        return response;
    } catch (error) {
        console.error("MailerSend Error:", error);
        throw error;
    }
};

export const MailerSendProvider = {
    sendEmail,
};
