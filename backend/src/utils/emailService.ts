import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create the transporter inside the function or globally depending on preference,
// but globally is standard if the env variables are present on startup.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

export interface EmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
    try {
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            console.warn("Email service is disabled: SMTP_EMAIL or SMTP_PASSWORD is not set in environment variables.");
            return false;
        }

        const mailOptions = {
            from: `"Bohuroopi India" <${process.env.SMTP_EMAIL}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};
