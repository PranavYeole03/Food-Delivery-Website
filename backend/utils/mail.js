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
export const sendDeliveryOtpMail = async (user, orderId, restaurantName, otp) => {
  try {
    let finalOrderId = orderId;
    let finalRestaurantName = restaurantName;
    let finalOtp = otp;

    if (otp === undefined && restaurantName === undefined) {
      finalOtp = orderId;
      finalOrderId = null;
      finalRestaurantName = null;
    }

    const orderIdDisplay = finalOrderId ? String(finalOrderId).slice(-6).toUpperCase() : null;

    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: "Fletto Home Delivery Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ececec; rounded: 12px; background-color: #fff;">
          <h2 style="color: #ff5a36; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">Fletto Home Delivery Verification</h2>
          <div style="background-color: #fff8f4; border-left: 4px solid #ff5a36; padding: 15px; margin-bottom: 20px;">
            ${orderIdDisplay ? `<p style="margin: 4px 0; font-size: 16px;"><strong>Order ID:</strong> #${orderIdDisplay}</p>` : ""}
            ${finalRestaurantName ? `<p style="margin: 4px 0; font-size: 16px;"><strong>Restaurant:</strong> ${finalRestaurantName}</p>` : ""}
            <p style="margin: 4px 0; font-size: 18px; color: #ff5a36;"><strong>Delivery OTP:</strong> <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${finalOtp}</span></p>
          </div>
          <p style="font-size: 15px; line-height: 1.5; color: #555;">Please share this 6-digit OTP code with your delivery boy to verify and complete the order delivery.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">Thank you for ordering with Fletto!</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Send delivery OTP failed:", error);
    return false; // ✅ DO NOT THROW
  }
};

// 🛍️ Self Pickup Verification OTP
export const sendSelfPickupOtpMail = async (user, orderId, restaurantName, otp) => {
  try {
    const orderIdDisplay = String(orderId).slice(-6).toUpperCase();
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: "Fletto Self Pickup Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ececec; rounded: 12px; background-color: #fff;">
          <h2 style="color: #ff5a36; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">Fletto Self Pickup Verification</h2>
          <div style="background-color: #fff8f4; border-left: 4px solid #ff5a36; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 4px 0; font-size: 16px;"><strong>Order ID:</strong> #${orderIdDisplay}</p>
            <p style="margin: 4px 0; font-size: 16px;"><strong>Restaurant:</strong> ${restaurantName}</p>
            <p style="margin: 4px 0; font-size: 18px; color: #ff5a36;"><strong>Pickup OTP:</strong> <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${otp}</span></p>
          </div>
          <p style="font-size: 15px; line-height: 1.5; color: #555;">Show this OTP at the restaurant while collecting your order.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">Thank you for ordering with Fletto!</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Send self pickup OTP email failed:", error);
    return false;
  }
};

// ❌ Order Cancelled Email
export const sendOrderCancelledMail = async (user, orderId, reason) => {
  try {
    const orderIdDisplay = String(orderId).slice(-6).toUpperCase();
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: "Fletto Order Cancelled",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ececec; rounded: 12px; background-color: #fff;">
          <h2 style="color: #ff3b30; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">Order Cancelled</h2>
          <div style="background-color: #fff5f5; border-left: 4px solid #ff3b30; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 4px 0; font-size: 16px;"><strong>Order ID:</strong> #${orderIdDisplay}</p>
            <p style="margin: 4px 0; font-size: 16px;"><strong>Cancellation Reason:</strong> ${reason}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #777;"><strong>Cancelled At:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="font-size: 15px; line-height: 1.5; color: #555;">We are sorry to see your order cancelled. If it was a prepaid order, the refund has been automatically credited back to your Fletto Wallet.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">Need help? Please reach out to Fletto Customer Support.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Send order cancelled email failed:", error);
    return false;
  }
};

// 💳 Refund Added To Wallet Email
export const sendRefundAddedMail = async (user, orderId, amount, balance) => {
  try {
    const orderIdDisplay = String(orderId).slice(-6).toUpperCase();
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: "Refund Added To Wallet",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ececec; rounded: 12px; background-color: #fff;">
          <h2 style="color: #34c759; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">Refund Added to Wallet</h2>
          <div style="background-color: #f2fbf4; border-left: 4px solid #34c759; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 4px 0; font-size: 16px;"><strong>Refund Amount:</strong> ₹${amount}</p>
            <p style="margin: 4px 0; font-size: 16px;"><strong>Source Order ID:</strong> #${orderIdDisplay}</p>
            <p style="margin: 4px 0; font-size: 18px; color: #34c759;"><strong>New Wallet Balance:</strong> ₹${balance}</p>
          </div>
          <p style="font-size: 15px; line-height: 1.5; color: #555;">The refund for your cancelled order has been successfully credited to your Fletto Wallet balance. You can use this balance to pay for your next order instantly!</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">Fletto - Fresh Food, Delivered Daily.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Send refund added email failed:", error);
    return false;
  }
};

// 🪙 Wallet Credited Email
export const sendWalletCreditedMail = async (user, amount, reason, balance) => {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: "Fletto Wallet Credited",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ececec; rounded: 12px; background-color: #fff;">
          <h2 style="color: #34c759; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">Fletto Wallet Credited</h2>
          <div style="background-color: #f2fbf4; border-left: 4px solid #34c759; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 4px 0; font-size: 16px;"><strong>Amount Credited:</strong> ₹${amount}</p>
            <p style="margin: 4px 0; font-size: 16px;"><strong>Transaction Type:</strong> Credit</p>
            <p style="margin: 4px 0; font-size: 16px;"><strong>Reason:</strong> ${reason}</p>
            <p style="margin: 4px 0; font-size: 18px; color: #34c759;"><strong>Current Wallet Balance:</strong> ₹${balance}</p>
          </div>
          <p style="font-size: 15px; line-height: 1.5; color: #555;">Your Fletto Wallet has been successfully credited with the above amount. Use your wallet balance at checkout for lightning fast orders!</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">Fletto Wallet System</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Send wallet credited email failed:", error);
    return false;
  }
};
