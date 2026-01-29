import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { ClipLoader } from "react-spinners";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // STEP 1: SEND OTP
  const handleSendOtp = async () => {
    if (!email) return setErr("Email is required");

    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );
      setErr("");
      setStep(2);
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return setErr("Enter valid 6-digit OTP");

    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      setErr("");
      setStep(3);
    } catch (error) {
      setErr(error?.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: RESET PASSWORD
  const handleResetPassword = async () => {
    if (newPassword.length < 6)
      return setErr("Password must be at least 6 characters");

    if (newPassword !== confirmPassword)
      return setErr("Passwords do not match");

    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        {
          email,
          newpassword: newPassword,
          confirmpassword: confirmPassword,
        },
        { withCredentials: true }
      );
      navigate("/signin");
    } catch (error) {
      setErr(error?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fff9f6] p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <IoIosArrowRoundBack
            size={28}
            className="text-[#ff4d2d] cursor-pointer"
            onClick={() => navigate("/signin")}
          />
          <h2 className="text-xl font-bold text-[#ff4d2d]">Forgot Password</h2>
        </div>

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full mb-4 p-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-[#ff4d2d] text-white py-2 rounded"
            >
              {loading ? <ClipLoader size={20} color="white" /> : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit OTP"
              className="w-full mb-4 p-2 border rounded"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-[#ff4d2d] text-white py-2 rounded"
            >
              {loading ? <ClipLoader size={20} color="white" /> : "Verify OTP"}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <input
              type="password"
              placeholder="New password"
              className="w-full mb-3 p-2 border rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full mb-4 p-2 border rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-[#ff4d2d] text-white py-2 rounded"
            >
              {loading ? <ClipLoader size={20} color="white" /> : "Reset Password"}
            </button>
          </>
        )}

        {err && <p className="text-red-500 text-center mt-3">*{err}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
