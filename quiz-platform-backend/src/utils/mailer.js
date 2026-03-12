import dotenv from 'dotenv';
import nodemailer from "nodemailer";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER,
    pass: process.env.PASSWORD
  }
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