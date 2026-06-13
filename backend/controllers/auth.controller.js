import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : { ...user };
  delete userObject.password;
  delete userObject.resetOtp;
  delete userObject.otpExpires;
  return userObject;
};

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
};

export const signUp = async (req, res, next) => {
  try {
    const fullName = req.body.fullName?.trim();
    const email = req.body.email?.trim();
    const password = req.body.password || "";
    const mobile = req.body.mobile || "";
    const role = req.body.role;

    if (!fullName || !email || !password || !mobile || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }
    if (!/^\d{10}$/.test(mobile)) {
      return res
        .status(400)
        .json({ message: "Mobile number must be 10 digits." });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User Already Exist." });
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
 
    setTokenCookie(res, token);

    res.cookie("token", token, {
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });


    return res.status(201).json({ user: sanitizeUser(user), token });
  } catch (error) {
    return next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password || "";

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = await genToken(user._id);


    setTokenCookie(res, token);

    res.cookie("token", token, {
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });


    return res.status(200).json({
      message: "Signin successful",
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    
    return next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      httpOnly: true,
    });
    return res.status(200).json("Log Out Successfully");
  } catch (error) {
    return next(error);
  }
};

export const sendOtp = async (req, res, next) => {
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
      
      // ❗ DO NOT throw error
    }

    return res.status(200).json({
      message: "OTP generated successfully",
    });
  } catch (error) {
    
    return next(error);
  }
};


export const verifyOtp = async (req, res, next) => {
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
    
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
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
    return next(error);
  }
};

export const googleAuth = async (req, res, next) => {
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

    setTokenCookie(res, token);

    res.cookie("token", token, {
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(201).json({ user: sanitizeUser(user), token });
  } catch (error) {
    return next(error);
  }
};
