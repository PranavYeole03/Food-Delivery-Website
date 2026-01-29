import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.RESEND_API_KEY) {
  console.error("RESEND_API_KEY missing in .env file");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// 🔐 Forgot Password OTP
export const sendOtpMail = async (to, otp) => {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to,
      subject: "Reset Your Password",
      html: `
        <p>Your OTP for password reset is:</p>
        <h2>${otp}</h2>
        <p>It expires in 5 minutes.</p>
      `,
    });
    return true;
  } catch (error) {
    console.error("Send OTP email failed:", error);
    return false; // ✅ DO NOT THROW
  }
};

// 🚚 Delivery OTP
export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: "Delivery OTP",
      html: `
        <p>Your OTP for delivery is:</p>
        <h2>${otp}</h2>
        <p>It expires in 5 minutes.</p>
      `,
    });
    return true;
  } catch (error) {
    console.error("Send delivery OTP failed:", error);
    return false; // ✅ DO NOT THROW
  }
};
