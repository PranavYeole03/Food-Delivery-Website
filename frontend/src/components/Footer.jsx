import React from "react";
import { useSelector } from "react-redux";
import {
  FaInstagram,
  FaLinkedinIn,
  FaFacebookF,
  FaTwitter,
  FaApple,
} from "react-icons/fa";
import { IoLogoGooglePlaystore } from "react-icons/io5";

const Footer = () => {
  const { userData } = useSelector((state) => state.user);

  /* ================= DELIVERY BOY SHORT FOOTER ================= */
  if (userData?.role === "deliveryBoy") {
    return (
      <footer className="w-full border-t bg-slate-900 text-gray-400">
        <div className="h-12 flex items-center justify-center text-sm">
          © {new Date().getFullYear()} Fletto · Delivery Partner Panel
        </div>
      </footer>
    );
  }

  /* ================= FULL FOOTER (USERS / OTHERS) ================= */
  return (
    <footer className="w-full bg-slate-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        {/* LOGO */}
        <h1 className="text-3xl font-bold text-white mb-10 text-center sm:text-left">
          Fletto
        </h1>

        {/* GRID */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4 text-sm">
          {/* COMPANY */}
          <div>
            <h2 className="text-white font-semibold mb-4">Company</h2>
            <ul className="space-y-2">
              <li className="hover:text-orange-400 cursor-pointer">
                About Fletto
              </li>
              <li className="hover:text-orange-400 cursor-pointer">Careers</li>
              <li className="hover:text-orange-400 cursor-pointer">Press</li>
              <li className="hover:text-orange-400 cursor-pointer">Contact</li>
            </ul>
          </div>

          {/* FOR USERS */}
          <div>
            <h2 className="text-white font-semibold mb-4">For Users</h2>
            <ul className="space-y-2">
              <li className="hover:text-orange-400 cursor-pointer">
                Browse Restaurants
              </li>
              <li className="hover:text-orange-400 cursor-pointer">
                Track Orders
              </li>
              <li className="hover:text-orange-400 cursor-pointer">
                Offers & Deals
              </li>
              <li className="hover:text-orange-400 cursor-pointer">
                Help Center
              </li>
            </ul>
          </div>

          {/* FOR RESTAURANTS */}
          <div>
            <h2 className="text-white font-semibold mb-4">For Restaurants</h2>
            <ul className="space-y-2">
              <li className="hover:text-orange-400 cursor-pointer">
                List Your Restaurant
              </li>
              <li className="hover:text-orange-400 cursor-pointer">
                Restaurant Dashboard
              </li>
              <li className="hover:text-orange-400 cursor-pointer">
                Business Support
              </li>
            </ul>
          </div>

          {/* DELIVERY + SOCIAL */}
          <div>
            <h2 className="text-white font-semibold mb-4">Delivery Partners</h2>
            <ul className="space-y-2 mb-6">
              <li className="hover:text-orange-400 cursor-pointer">
                Join as Delivery Partner
              </li>
              <li className="hover:text-orange-400 cursor-pointer">
                Delivery App
              </li>
              <li className="hover:text-orange-400 cursor-pointer">
                Earnings & Incentives
              </li>
            </ul>

            <div className="flex gap-4 text-lg text-gray-300">
              <FaInstagram className="hover:text-orange-400 cursor-pointer" />
              <FaLinkedinIn className="hover:text-orange-400 cursor-pointer" />
              <FaFacebookF className="hover:text-orange-400 cursor-pointer" />
              <FaTwitter className="hover:text-orange-400 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* APP BUTTONS */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          {/* APP STORE */}
          <button
            className="
      w-full sm:w-auto
      flex items-center justify-center gap-3
      px-6 py-3
      rounded-xl
      border border-gray-600
      text-gray-200
      hover:bg-slate-800
      transition
    "
          >
            <FaApple className="text-xl" />
            <div className="flex flex-col leading-tight text-left">
              <span className="text-xs text-gray-400">Download on the</span>
              <span className="text-sm font-semibold">App Store</span>
            </div>
          </button>

          {/* GOOGLE PLAY */}
          <button
            className="
      w-full sm:w-auto
      flex items-center justify-center gap-3
      px-6 py-3
      rounded-xl
      border border-gray-600
      text-gray-200
      hover:bg-slate-800
      transition
    "
          >
            <IoLogoGooglePlaystore className="text-xl text-emerald-400" />
            <div className="flex flex-col leading-tight text-left">
              <span className="text-xs text-gray-400">Get it on</span>
              <span className="text-sm font-semibold">Google Play</span>
            </div>
          </button>
        </div>

        <p className="mt-10 text-xs text-gray-500">
          © 2026 Fletto Pvt. Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
