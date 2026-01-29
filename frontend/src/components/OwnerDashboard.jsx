import React from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { FaUtensils, FaHotel, FaPen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import OwnerItemCard from "./OwnerItemCard";
import Footer from "./Footer";

const OwnerDashboard = () => {
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <Nav />


      {/* PAGE CONTENT */}
      <div className="flex-1 pt-4 px-4 sm:px-6 lg:px-12 pb-24 flex flex-col items-center">
    {/* dashboard content */}
        
        {/* ================= NO SHOP ================= */}
        {!myShopData && (
          <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-6 sm:p-8 text-center">
            <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Add Your Restaurant
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Join our food delivery platform and reach thousands of hungry
              customers every day.
            </p>
            <button
              className="bg-[#ff4d2d] text-white px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition"
              onClick={() => navigate("/create-edit-shop")}
            >
              Get Started
            </button>
          </div>
        )}

        {/* ================= SHOP EXISTS ================= */}
        {myShopData && (
          <div className="w-full max-w-5xl lg:max-w-7xl flex flex-col items-center gap-8">
            
            {/* HEADER */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaHotel className="text-[#ff4d2d]" />
              Welcome to {myShopData.name}
            </h1>

            {/* SHOP CARD */}
            <div className="relative w-full max-w-3xl lg:max-w-5xl bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
              <button
                className="absolute top-4 right-4 bg-[#ff4d2d] text-white p-3 rounded-full shadow-md hover:bg-orange-600 transition"
                onClick={() => navigate("/create-edit-shop")}
              >
                <FaPen size={18} />
              </button>

              <img
                src={myShopData.image}
                alt={myShopData.name}
                className="w-full h-52 sm:h-72 object-cover bg-white"
              />

              <div className="p-5 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                  {myShopData.name}
                </h2>
                <p className="text-gray-500">
                  {myShopData.city}, {myShopData.state}
                </p>
                <p className="text-gray-500">{myShopData.address}</p>
              </div>
            </div>

            {/* ================= NO ITEMS ================= */}
            {myShopData.items?.length === 0 && (
              <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-6 sm:p-8 text-center">
                <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  Add Your Food Items
                </h2>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Share your delicious creations with customers by adding them
                  to your menu.
                </p>
                <button
                  className="bg-[#ff4d2d] text-white px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition"
                  onClick={() => navigate("/add-items")}
                >
                  Add Food
                </button>
              </div>
            )}

            {/* ================= ITEMS LIST ================= */}
            {myShopData.items?.length > 0 && (
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myShopData.items.map((item, index) => (
                  <OwnerItemCard key={index} data={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OwnerDashboard;

