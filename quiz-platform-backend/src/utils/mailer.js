import dotenv from 'dotenv';
import nodemailer from "nodemailer";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER,
    pass: process.env.PASSWORD
  },
  logger: true, 
  debug: true 
});

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"Quiz Platform" <${process.env.USER}>`,
    to,
    subject,
    html
  });
};

export default sendEmail;