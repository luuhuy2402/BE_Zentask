// sử dụng dịch vụ bên thứ 3

//Chú ý: Brevo là tên thương hiệu mới của sib - Sendinablue
const SibApiV3Sdk = require("@getbrevo/brevo");
import { env } from "../config/environment";

/**
 * Có
 */

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
let apiKey = apiInstance.authentications["apiKey"];
apiKey.apiKey = env.BREVO_API_KEY;

const sendEmail = async (recipientEmail, customSubject, customHtmlContent) => {
    //Khởi tạo một cái sendSmtpEmail với nhưng thông tin cần thiết
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    //Cấu hình tài khoản gửi mail: là tài khoản email đăng kí trên Brevo
    sendSmtpEmail.sender = {
        email: env.ADMIN_EMAIL_ADDRESS,
        name: env.ADMIN_EMAIL_NAME,
    };
    //Những tài khoản nhận email
    //'to' laf 1 Array để có thể tùy biến gửi 1 email tới nhiều user tùy theo tính năng dự án
    sendSmtpEmail.to = [{ email: recipientEmail }];
    //Tiêu đề của email
    sendSmtpEmail.subject = customSubject;

    //Nội dung email dạng HTML
    sendSmtpEmail.htmlContent = customHtmlContent;

    //Gọi hành động gửi mail
    return apiInstance.sendTransacEmail(sendSmtpEmail);
};

export const BrevoProvider = {
    sendEmail,
};
