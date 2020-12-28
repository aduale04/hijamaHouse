import * as nodemailer from "nodemailer";

const sendEmailNotification=(to:string, bodyHtml:string, subject:string)=>{
    const emailConfigOption={
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || "465"),
        secure: true,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    }
    const transporter = nodemailer.createTransport(emailConfigOption);

    const mailOptions={
        from: `Hijama <${process.env.EMAIL_USERNAME}>`, // sender address
        to: to, // list of receivers
        cc: process.env.EMAIL_DEFAULT_TO,
        subject: subject, // Subject line
        html: bodyHtml,
    }
    transporter.sendMail(mailOptions, (error: any, info: { messageId: any; response: any; }) => {
        if (error) {
            return console.log(error);
        }
    });
}
export default sendEmailNotification
