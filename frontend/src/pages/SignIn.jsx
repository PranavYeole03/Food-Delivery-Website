import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners";
import { setUserData } from "../redux/userSlice";
import { useDispatch } from "react-redux";

const SignIn = () => {
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data));
      setErr("");
      setLoading(false);
    } catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const hangleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          email: result.user.email,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(data));
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#fff5f1] to-[white]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md sm:max-w-lg mx-4 p-6 sm:p-8">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-1 text-[#ff4d2d]">
          Fletto
        </h1>
        <p className="text-gray-600 text-center mb-6 text-sm sm:text-base">
          Sign to your account to get started with delicious food deliveries
        </p>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
        </div>
        {/* Forgot Password */}
        <div
          className="text-right mb-4 text-[#ff4d2d] font-medium cursor-pointer hover:text-[#0ed1c7]"
          onClick={() => navigate("/forgot-password")}
        >
          Forget Password ?
        </div>

        {/* SignIn Button */}
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-[#ff4d2d] text-white font-semibold hover:bg-[#e64323] transition"
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Sign In"}
        </button>
        {err && <p className="text-red-500 text-center my-2.5">*{err}</p>}

        {/* Google */}
        <button
          className="w-full mt-3 py-2.5 rounded-lg border border-gray-300 flex items-center justify-center gap-2 hover:bg-gray-100 transition"
          onClick={hangleGoogleAuth}
        >
          <FcGoogle size={20} />
          Sign In with Google
        </button>

        {/* Footer */}
        <p
          className="text-center mt-4 text-sm cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Want to create a new account?
          <span className="text-[#ff4d2d] font-medium">Sign Up</span>
        </p>
      </div>
    </div>
  );
};
export default SignIn;
