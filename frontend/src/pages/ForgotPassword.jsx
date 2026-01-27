import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { ClipLoader } from "react-spinners";

const ForgotPassword = () => {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  const [step, setStep] = useState(1);
  const [email, setemail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setnewPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Step1
  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withcredentials: true }
      );
      console.log(result);
      setErr("");
      setStep(2);
      setLoading(false);
    } catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  // Step2
  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withcredentials: true }
      );
      console.log(result);
      setErr("");

      setStep(3);
      setLoading(false);
    } catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  // Step3
  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        {
          email,
          newpassword: newPassword,
          confirmpassword: confirmPassword,
        },
        { withCredentials: true }
      );
      setErr("");
      setLoading(false);
      console.log(result.data);
      navigate("/signin");
    } catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center gap-4 mb-4">
          <IoIosArrowRoundBack
            size={30}
            className="text-[#ff4d2d] cursor-pointer "
            onClick={() => navigate("/signin")}
          />

          <h1 className="text-2xl font-bold text-center text-[#ff4d2d]">
            Forgot Password
          </h1>
        </div>
        {/* Enter Email */}
        {step == 1 && (
          <div>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-lg px-3 py-2 border border-gray-200 focus:outline-none"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                required
              />
            </div>
            <button
              className="w-full py-2.5 rounded-lg bg-[#ff4d2d] text-white font-semibold hover:bg-[#e64323] transition cursor-pointer"
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color="white" /> : "Send OTP"}
            </button>
            {err && <p className="text-red-500 text-center my-2.5">*{err}</p>}
          </div>
        )}

        {/* Enter Otp and verify */}
        {step == 2 && (
          <div>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-1">
                OTP
              </label>
              <input
                type="email"
                className="w-full rounded-lg px-3 py-2 border border-gray-200 focus:outline-none"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button
              className="w-full py-2.5 rounded-lg bg-[#ff4d2d] text-white font-semibold hover:bg-[#e64323] transition cursor-pointer"
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color="white" /> : "Verify"}
            </button>
            {err && <p className="text-red-500 text-center my-2.5">*{err}</p>}
          </div>
        )}

        {/* Reset Password */}
        {step == 3 && (
          <div>
            <div className="mb-6">
              <label
                htmlFor="newpassword"
                className="block text-gray-700 font-medium mb-1"
              >
                New Password
              </label>
              <input
                type="password"
                className="w-full rounded-lg px-3 py-2 border border-gray-200 focus:outline-none"
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => setnewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="confirmpassword"
                className="block text-gray-700 font-medium mb-1"
              >
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full rounded-lg px-3 py-2 border border-gray-200 focus:outline-none"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setconfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              className="w-full py-2.5 rounded-lg bg-[#ff4d2d] text-white font-semibold hover:bg-[#e64323] transition cursor-pointer"
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ClipLoader size={20} color="white" />
              ) : (
                "Reset Password"
              )}
            </button>
            {err && <p className="text-red-500 text-center my-2.5">*{err}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
