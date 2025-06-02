// sử dụng dịch vụ bên thứ 3
const SibApiV3Sdk = require("@getbrevo/brevo");
import { env } from "../config/environment";

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
let apiKey = apiInstance.authentications["apiKey"];
apiKey.apiKey = env.BREVO_API_KEY;

const sendEmail = async (recipientEmail, customSubject, customHtmlContent) => {
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
        email: env.ADMIN_EMAIL_ADDRESS,
        name: env.ADMIN_EMAIL_NAME,
    };
    sendSmtpEmail.to = [{ email: recipientEmail }];
    sendSmtpEmail.subject = customSubject;
    sendSmtpEmail.htmlContent = customHtmlContent;
    return apiInstance.sendTransacEmail(sendSmtpEmail);
};

export const BrevoProvider = {
    sendEmail,
};
