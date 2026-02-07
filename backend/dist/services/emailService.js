import nodemailer from "nodemailer";
import { env } from "../config/env.js";
const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
        user: env.ETHEREAL_USER,
        pass: env.ETHEREAL_PASS
    }
});
export const sendEmail = async (params) => {
    const info = await transporter.sendMail({
        from: params.from,
        to: params.to,
        subject: params.subject,
        html: params.body
    });
    return info;
};
