import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User Already Exist." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password atleast 6 characters." });
    }
    if (mobile.length < 10) {
      return res
        .status(400)
        .json({ message: "mobile number must be 10 digits." });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      fullName,
      email,
      mobile,
      role,
      password: hashPassword,
    });

    const token = await genToken(user._id);
    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json(`Sign up error${error}`);
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Signin successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ message: "Signin error" });
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json("Log Out Successfully");
  } catch (error) {
    return res.status(500).json(`Sign Out error${error}`);
  }
};

// export const sendOtp = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "User Does not exist." });
//     }
//     const otp = Math.floor(1000 + Math.random() * 9000).toString();
//     user.resetOtp = otp;
//     user.otpExpires = Date.now() + 5 * 60 * 1000;
//     user.isOtpVerified = false;
//     await user.save();
//     await sendOtpMail(email, otp);
//     return res.status(200).json({ message: "Otp send Successfully" });
//   } catch (error) {
//     return res.status(500).json(`Send Otp error${error}`);
//   }
// };

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // ✅ 6-digit OTP (recommended)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.isOtpVerified = false;

    await user.save();

    // 📧 EMAIL (FAIL-SAFE)
    try {
      await sendOtpMail(email, otp);
    } catch (mailError) {
      console.error("OTP email failed:", mailError);
      // ❗ DO NOT throw error
    }

    return res.status(200).json({
      message: "OTP generated successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({
      message: "Failed to generate OTP",
    });
  }
};


// export const verifyOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const user = await User.findOne({ email });
//     if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
//       return res.status(400).json({ message: "invalid/expired otp" });
//     }
//     user.isOtpVerified = true;
//     user.resetOtp = undefined;
//     user.otpExpires = undefined;
//     await user.save();
//     return res.status(200).json({ message: "Otp Verified Successfully" });
//   } catch (error) {
//     return res.status(500).json(`Verify Otp error${error}`);
//   }
// };

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ email });

    if (
      !user ||
      user.resetOtp !== otp ||
      !user.otpExpires ||
      user.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isOtpVerified = true;
    user.resetOtp = null;
    user.otpExpires = null;

    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newpassword, confirmpassword } = req.body;
    if (newpassword !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const user = await User.findOne({ email });
    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "Otp verification required." });
    }
    const hashedPassword = await bcrypt.hash(newpassword, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false;
    await user.save();
    return res.status(200).json({ message: "Password reset Successfully" });
  } catch (error) {
    return res.status(500).json(`Reset password error${error}`);
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { fullName, email, mobile, role } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fullName,
        email,
        mobile,
        role,
      });
    }
    const token = await genToken(user._id);
    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json(`Google auth error${error}`);
  }
};
