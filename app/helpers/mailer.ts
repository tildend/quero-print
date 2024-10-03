import { createTransport } from "nodemailer";

if (
  !process.env.MAIL_HOST ||
  !process.env.MAIL_PORT ||
  !process.env.MAIL_SECURE ||
  !process.env.MAIL_USER ||
  !process.env.MAIL_PASS
) {
  console.error('Missing MAIL_* environment variables');
  throw new Error('Erro interno');
}

export const mailer = createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  }
})