// import React from "react";
// import Nav from "./Nav";
// import { useSelector } from "react-redux";
// import { FaUtensils, FaHotel, FaPen } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import OwnerItemCard from "./OwnerItemCard";
// import Footer from "./Footer";

// const OwnerDashboard = () => {
//   const { myShopData } = useSelector((state) => state.owner);
//   const navigate = useNavigate();

//   return (
//     <div className="w-full min-h-screen bg-white flex flex-col">
//       <Nav />


//       {/* PAGE CONTENT */}
//       <div className="flex-1 pt-4 px-4 sm:px-6 lg:px-12 pb-24 flex flex-col items-center">
//         {/* dashboard content */}

//         {/* ================= NO SHOP ================= */}
//         {!myShopData && (
//           <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-6 sm:p-8 text-center">
//             <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4" />
//             <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
//               Add Your Restaurant
//             </h2>
//             <p className="text-gray-600 mb-6 text-sm sm:text-base">
//               Join our food delivery platform and reach thousands of hungry
//               customers every day.
//             </p>
//             <button
//               className="bg-[#ff4d2d] text-white px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition"
//               onClick={() => navigate("/create-edit-shop")}
//             >
//               Get Started
//             </button>
//           </div>
//         )}

//         {/* ================= SHOP EXISTS ================= */}
//         {myShopData && (
//           <div className="w-full max-w-5xl lg:max-w-7xl flex flex-col items-center gap-8">

//             {/* HEADER */}
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
//               <FaHotel className="text-[#ff4d2d]" />
//               Welcome to {myShopData.name}
//             </h1>

//             {/* SHOP CARD */}
//             <div className="relative w-full max-w-3xl lg:max-w-5xl bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
//               <button
//                 className="absolute top-4 right-4 bg-[#ff4d2d] text-white p-3 rounded-full shadow-md hover:bg-orange-600 transition"
//                 onClick={() => navigate("/create-edit-shop")}
//               >
//                 <FaPen size={18} />
//               </button>

//               <img
//                 src={myShopData.image}
//                 alt={myShopData.name}
//                 className="w-full h-52 sm:h-72 object-cover bg-white"
//               />

//               <div className="p-5 sm:p-6">
//                 <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
//                   {myShopData.name}
//                 </h2>
//                 <p className="text-gray-500">
//                   {myShopData.city}, {myShopData.state}
//                 </p>
//                 <p className="text-gray-500">{myShopData.address}</p>
//               </div>
//             </div>

//             {/* ================= NO ITEMS ================= */}
//             {myShopData.items?.length === 0 && (
//               <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-6 sm:p-8 text-center">
//                 <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4" />
//                 <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
//                   Add Your Food Items
//                 </h2>
//                 <p className="text-gray-600 mb-6 text-sm sm:text-base">
//                   Share your delicious creations with customers by adding them
//                   to your menu.
//                 </p>
//                 <button
//                   className="bg-[#ff4d2d] text-white px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition"
//                   onClick={() => navigate("/add-items")}
//                 >
//                   Add Food
//                 </button>
//               </div>
//             )}

//             {/* ================= ITEMS LIST ================= */}
//             {myShopData.items?.length > 0 && (
//               <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//                 {myShopData.items.map((item, index) => (
//                   <OwnerItemCard key={index} data={item} />
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default OwnerDashboard;

import React from "react";
import { useSelector } from "react-redux";
import {
  FaUtensils,
  FaHotel,
  FaPen,
  FaHome,
  FaPlus,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import OwnerItemCard from "./OwnerItemCard";
import { FiBarChart2 } from "react-icons/fi";
import { useEffect } from "react";
import { socket } from "../socket";
import useSocket from "../hooks/useSocket";

const OwnerDashboard = () => {
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();

  // 👉 SAFE DATA
  const totalItems = myShopData?.items?.length || 0;
  // These listeners can trigger Redux actions or local state updates as needed
  useSocket("orderDelivered", (data) => {
    // Handle order delivered
  });

  useSocket("orderAccepted", (data) => {
    // Handle order accepted
  });

  useSocket("readyForPickup", (data) => {
    // Handle status update
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">

      {/* ================= NO SHOP ================= */}
      {!myShopData && (
        <div className="flex justify-center mt-10">
          <div className="bg-white p-6 rounded-2xl shadow text-center max-w-md">
            <FaUtensils className="text-[#ff4d2d] text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Add Your Restaurant</h2>
            <button
              className="bg-[#ff4d2d] text-white px-6 py-2 rounded-full"
              onClick={() => navigate("/owner/create-shop")}
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* ================= DASHBOARD ================= */}
      {myShopData && (
        <div className="flex flex-col gap-6">

          {/* ================= HEADER ================= */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FaHotel className="text-[#ff4d2d]" />
              {myShopData.name}
            </h1>

            <div className="flex gap-2">
              <button
                onClick={() => navigate("/owner/create-shop")}
                className="bg-white border px-4 py-2 rounded-lg shadow hover:bg-gray-50 transition"
              >
                Edit Shop
              </button>

              <button
                onClick={() => navigate("/owner/add-items")}
                className="bg-[#ff4d2d] text-white px-4 py-2 rounded-lg shadow hover:bg-orange-600 transition"
              >
                + Add Item
              </button>
            </div>
          </div>

          {/* ================= STATS ================= */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
              <p className="text-gray-500 text-sm">Total Items</p>
              <h2 className="text-xl font-bold">{totalItems}</h2>
            </div>

            <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
              <p className="text-gray-500 text-sm">City</p>
              <h2 className="text-xl font-bold">{myShopData.city}</h2>
            </div>

            <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
              <p className="text-gray-500 text-sm">State</p>
              <h2 className="text-xl font-bold">{myShopData.state}</h2>
            </div>
          </div>

          {/* ================= SHOP CARD (PRO) ================= */}
          <div className="relative rounded-2xl overflow-hidden shadow group">

            {/* IMAGE */}
            <img
              src={myShopData.image}
              alt="shop"
              className="w-full h-56 object-cover"
            />

            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />

            {/* OVERLAY ACTIONS */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">

              <button
                onClick={() => navigate("/owner/create-shop")}
                className="bg-white text-[#ff4d2d] p-2 rounded-full shadow hover:scale-110 transition"
              >
                <FaPen size={14} />
              </button>

              <button
                onClick={() => navigate("/owner/add-items")}
                className="bg-[#ff4d2d] text-white p-2 rounded-full shadow hover:scale-110 transition"
              >
                <FaPlus size={14} />
              </button>

            </div>

            {/* TEXT OVER IMAGE */}
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-lg font-semibold">{myShopData.name}</h2>
              <p className="text-sm opacity-90">
                {myShopData.city}, {myShopData.state}
              </p>
            </div>
          </div>

          {/* ================= ITEMS ================= */}
          {totalItems > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Your Items</h2>

                <button
                  onClick={() => navigate("/owner/add-items")}
                  className="text-sm text-[#ff4d2d] font-medium"
                >
                  + Add More
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myShopData.items.map((item, i) => (
                  <div className="hover:scale-[1.02] transition" key={i}>
                    <OwnerItemCard data={item} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl text-center shadow">

              <FaUtensils className="text-[#ff4d2d] text-5xl mx-auto mb-4" />

              <h2 className="text-lg font-semibold mb-2">
                No items added yet
              </h2>

              <p className="text-gray-500 mb-4 text-sm">
                Start adding your menu to attract customers
              </p>

              <button
                className="bg-[#ff4d2d] text-white px-6 py-2 rounded-lg shadow hover:bg-orange-600 transition"
                onClick={() => navigate("/owner/add-items")}
              >
                Add First Item
              </button>
            </div>
          )}

        </div>
      )}
      {/* ================= FOOTER ================= */}
      <div className="mt-10 w-full bg-black border-t shadow px-4 md:px-10 py-6 md:mb-0 mb-6 rounded-xl ">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">

          {/* LEFT */}
          <div className="text-center md:text-left">
            <h2 className="font-semibold text-gray-300">Fletto Owner Panel</h2>
            <p className="text-sm text-gray-500">
              Manage your shop, orders and growth easily.
            </p>
          </div>

          {/* CENTER */}
          <div className="flex gap-4 text-sm text-gray-300">
            <span className="cursor-pointer hover:text-white">Help</span>
            <span className="cursor-pointer hover:text-white">Privacy</span>
            <span className="cursor-pointer hover:text-white">Terms</span>
          </div>

          {/* RIGHT */}
          <div className="text-sm text-gray-300">
            © {new Date().getFullYear()} Fletto
          </div>

        </div>

      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow md:hidden z-50">

        <div className="flex justify-around py-2">

          <button
            onClick={() => navigate("/owner")}
            className="flex flex-col items-center text-xs"
          >
            <FaHome size={16} />
            Home
          </button>

          <button
            onClick={() => navigate("/owner/add-items")}
            className="flex flex-col items-center text-xs"
          >
            <FaUtensils size={16} />
            Add
          </button>

          <button
            onClick={() => navigate("/owner/analytics")}
            className="flex flex-col items-center text-xs"
          >
            <FiBarChart2 size={16} />
            Analytics
          </button>

          <button
            onClick={() => navigate("/owner/app-info")}
            className="flex flex-col items-center text-xs"
          >
            <FaPen size={16} />
            Info
          </button>

        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;