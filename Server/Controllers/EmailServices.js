import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import * as dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendOTPEmail = async (req, res) => {
  const { name, email, otp } = req.body;
  try {
    const templatePath = path.join(__dirname, "../views", "SignupOTP.hbs");
    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const template = Handlebars.compile(templateSource);
    const htmlContent = template({ name, email, otp });

    const mailOptions = {
      from: `QuickQuill <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your OTP Verification Code",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).json({  error });
  }
};

export const sendSignUpSuccessfulEmail = async (req, res) => {
  const { name, email } = req.body;
  try {
    // Build the absolute path for the template file
    const templatePath = path.join(__dirname, "../views", "SignupSuccess.hbs");
    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const template = Handlebars.compile(templateSource);
    const htmlContent = template({ name });

    const mailOptions = {
      from: `QuickQuill <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Welcome to Our Platform",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Sign up successful email sent" });
  } catch (error) {
    console.error("Error sending sign-up email:", error);
    res.status(500).json({ error: "Failed to send sign-up email" });
  }
};
