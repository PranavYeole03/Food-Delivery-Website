// import React from "react";
// import Nav from "./Nav";
// import { useSelector } from "react-redux";
// import { FaUtensils } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { FaHotel } from "react-icons/fa";
// import { FaPen } from "react-icons/fa";
// import OwnerItemCard from "./OwnerItemCard";

// const OwnerDashboard = () => {
//   const { myShopData } = useSelector((state) => state.owner);
//   const navigate = useNavigate();

//   return (
//     <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
//       <Nav />

//       {!myShopData && (
//         <div className="flex justify-center items-center p-4 sm:p-6">
//           <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-x1 transition-shadow duration-300">
//             <div className="flex flex-col items-center text-center">
//               <FaUtensils className="text-[#ff4d2d] w-16 h-16 mb:4" />
//               <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
//                 Add Your Restaruant
//               </h2>
//               <p className="text-gray-600 mb-4 text-sm sm:text-base">
//                 Join our food delivery platform and reach thousands of hungry
//                 customers every day.
//               </p>
//               <button
//                 className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200"
//                 onClick={() => navigate("/create-edit-shop")}
//               >
//                 Get Started
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {myShopData && (
//         <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-6">
//           <h1 className="text-2xl sm:text-3xl text-gray-900 flex items-center gap-3 mt-8 text-center">
//             <FaHotel className="text-[#ff4d2d] w-10 h-10" />
//             Welcome to {myShopData.name}
//           </h1>
//           <div className="bg-white shadow-lg rounded-x1 overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative">
//             <div
//               className="absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors cursor-pointer"
//               onClick={() => navigate("/create-edit-shop")}
//             >
//               <FaPen size={20} />
//             </div>
//             <img
//               src={myShopData.image}
//               alt={myShopData.name}
//               className="w-full h-52 sm:h-72 object-contain rounded-lg border border-gray-200 bg-white hover:shadow-md transition"
//             />
//             <div className="p-4 sm:p-6">
//               <h1 className="text-x1 sm:text-2xl font-bold text-gray-800 mb-2">
//                 {myShopData.name}
//               </h1>
//               <p className="text-gray-500">
//                 {myShopData.city},{myShopData.state}
//               </p>
//               <p className="text-gray-500">{myShopData.address}</p>
//             </div>
//           </div>

//           {myShopData?.items?.length === 0 && (
//             <div className="flex justify-center items-center p-4 sm:p-6">
//               <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-x1 transition-shadow duration-300">
//                 <div className="flex flex-col items-center text-center">
//                   <FaUtensils className="text-[#ff4d2d] w-16 sm:w-20 sm:h-20 mb:4" />
//                   <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
//                     Add Your Food Item
//                   </h2>
//                   <p className="text-gray-600 mb-4 text-sm sm:text-base">
//                     Share your delicious creations with our customers by adding
//                     them to the menu.
//                   </p>
//                   <button
//                     className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200"
//                     onClick={() => navigate("/add-items")}
//                   >
//                     Add Food
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {myShopData?.items?.length > 0 && (
//             <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
//               {myShopData.items.map((item, index) => (
//                 <OwnerItemCard data={item} key={index} />
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default OwnerDashboard;

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

