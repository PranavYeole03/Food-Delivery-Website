import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { setAuthToken } from "../utils/authToken";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const [fullName, setFullName] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [mobile, setmobile] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const validateSignUp = () => {
    if (!fullName.trim()) return "Full name is required";
    if (!email.trim()) return "Email is required";
    if (!emailRegex.test(email.trim())) return "Please enter a valid email";
    if (mobile.length !== 10) return "Mobile number must be 10 digits";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleSignUp = async () => {
    const validationError = validateSignUp();
    if (validationError) {
      return setErr(validationError);
    }

    setLoading(true);
    try {
      const result = await api.post(
        "/api/auth/signup",
        {
          fullName: fullName.trim(),
          email: email.trim(),
          mobile,
          password,
          role,
        }
      );
      setAuthToken(result.data.token);
      dispatch(setUserData(result.data.user));
      setErr("");
      setLoading(false);
    } catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const hangleGoogleAuth = async () => {
    if (mobile.length !== 10) {
      return setErr("Mobile number must be 10 digits");
    }
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    try {
      const { data } = await api.post(
        "/api/auth/google-auth",
        {
          fullName: result.user.displayName,
          email: result.user.email,
          role,
          mobile,
        }
      );
      setAuthToken(data.token);
      dispatch(setUserData(data.user));
    } catch (error) {
      setErr(error?.response?.data?.message || error.message || "Google sign up failed");
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
          Create your account to get started with delicious food deliveries
        </p>

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Full Name
          </label>
          <input
            type="text"
            className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
            placeholder="Enter your Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setemail(e.target.value.trim())}
            required
          />
        </div>

        {/* Mobile */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Mobile</label>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
            placeholder="Enter your Mobile Number"
            value={mobile}
            onChange={(e) => setmobile(e.target.value.replace(/[^0-9]/g, ""))}
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
              minLength={6}
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

        {/* Role */}
        <div className="mb-5">
          <label className="block text-gray-700 font-medium mb-1">Role</label>
          <div className="flex gap-2">
            {["user", "owner", "deliveryBoy"].map((r) => (
              <button
                key={r}
                type="button"
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition
              ${
                role === r
                  ? "bg-[#ff4d2d] text-white"
                  : "border border-[#ff4d2d] text-[#ff4d2d] hover:bg-[#fff0eb]"
              }`}
                onClick={() => setRole(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Signup Button */}
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-[#ff4d2d] text-white font-semibold hover:bg-[#e64323] transition"
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Sign Up"}
        </button>
        {err && <p className="text-red-500 text-center my-2.5">*{err}</p>}
        {/* Google */}
        <button
          className="w-full mt-3 py-2.5 rounded-lg border border-gray-300 flex items-center justify-center gap-2 hover:bg-gray-100 transition cursor-pointer duration-200"
          onClick={hangleGoogleAuth}
        >
          <FcGoogle size={20} />
          Sign up with Google
        </button>

        {/* Footer */}
        <p
          className="text-center mt-4 text-sm cursor-pointer"
          onClick={() => navigate("/signin")}
        >
          Already have an account?{" "}
          <span className="text-[#ff4d2d] font-medium">Sign In</span>
        </p>
      </div>
    </div>
  );
};
export default SignUp;
