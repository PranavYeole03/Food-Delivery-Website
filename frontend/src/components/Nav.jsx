// import React, { useEffect, useState } from "react";
// import { FaLocationDot, FaUtensils } from "react-icons/fa6";
// import { IoSearch, IoCartOutline } from "react-icons/io5";
// import { IoMdClose } from "react-icons/io";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import api from "../api/axios";
// import { serverUrl } from "../App";
// import { setSearchItems, setUserData } from "../redux/userSlice";
// import { HiOutlineClipboardList } from "react-icons/hi";

// const Nav = () => {
//   const { userData, currentCity, cartItems } = useSelector(
//     (state) => state.user
//   );
//   const { myShopData } = useSelector((state) => state.owner);

//   const [showInfo, setShowInfo] = useState(false);
//   const [showSearch, setShowSearch] = useState(false);
//   const [query, setQuery] = useState("");

//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const handleLogOut = async () => {
//     try {
//       await api.get(`${serverUrl}/api/auth/signout`, {
//         withCredentials: true,
//       });
//       dispatch(setUserData(null));
//     } catch (error) {
//       
//     }
//   };

//   const handleSearchItems = async () => {
//     try {
//       const result = await api.get(
//         `${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,
//         { withCredentials: true }
//       );
//       dispatch(setSearchItems(result.data));
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   useEffect(() => {
//     if (query.trim()) {
//       handleSearchItems();
//     } else {
//       dispatch(setSearchItems(null));
//     }
//   }, [query]);

//   return (
// <div className="w-full h-20 fixed top-0 z-50 bg-white shadow-md px-7 flex items-center justify-between">

//       {/* ================= MOBILE SEARCH BAR (USER ONLY) ================= */}
//       {showSearch && userData?.role === "user" && (
//         <div className="w-[90%] bg-white shadow-xl rounded-lg flex items-center gap-4 px-4 fixed top-20 left-[5%] md:hidden">
//           <div className="flex items-center w-[30%] border-r pr-2">
//             <FaLocationDot className="text-[#ff4d2d]" />
//             <span className="ml-2 truncate text-gray-600">{currentCity}</span>
//           </div>

//           <div className="flex items-center w-[70%] gap-2">
//             <IoSearch className="text-[#ff4d2d]" />
//             <input
//               autoFocus
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="search delicious food..."
//               className="w-full outline-none"
//             />
//           </div>
//         </div>
//       )}

//       {/* ================= LOGO ================= */}
//       <button
//         className="text-3xl font-bold text-[#ff4d2d]"
//         onClick={() => {
//           setQuery("");
//           dispatch(setSearchItems(null));
//           navigate("/");
//         }}
//       >
//         Fletto
//       </button>

//       {/* ================= DESKTOP SEARCH (USER ONLY) ================= */}
//       {userData?.role === "user" && (
//         <div className="hidden md:flex md:w-[60%] lg:w-[40%] h-17.5 bg-white shadow-xl rounded-lg px-4 items-center gap-5">
//           <div className="flex items-center w-[30%] border-r pr-2">
//             <FaLocationDot className="text-[#ff4d2d]" />
//             <span className="ml-2 truncate text-gray-600">{currentCity}</span>
//           </div>

//           <div className="flex items-center w-[70%] gap-2">
//             <IoSearch className="text-[#ff4d2d]" />
//             <input
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="search delicious food..."
//               className="w-full outline-none"
//             />
//           </div>
//         </div>
//       )}

//       {/* ================= RIGHT ACTIONS ================= */}
//       <div className="flex items-center gap-4">

//         {/* MOBILE SEARCH TOGGLE (USER ONLY) */}
//         {userData?.role === "user" &&
//           (showSearch ? (
//             <IoMdClose
//               size={20}
//               className="md:hidden text-[#ff4d2d]"
//               onClick={() => setShowSearch(false)}
//             />
//           ) : (
//             <IoSearch
//               size={20}
//               className="md:hidden text-[#ff4d2d]"
//               onClick={() => setShowSearch(true)}
//             />
//           ))}

//         {/* ================= OWNER (FIXED) ================= */}
//         {userData?.role === "owner" && (
//           <>
//             {myShopData && (
//               <>
//                 {/* DESKTOP */}
//                 <button
//                   className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d]"
//                   onClick={() => navigate("/add-items")}
//                 >
//                   <FaUtensils className="text-[#ff4d2d]" />
//                   <span>Add Food Item</span>
//                 </button>

//                 {/* MOBILE */}
//                 <button
//                   className="md:hidden p-2 rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]"
//                   onClick={() => navigate("/add-items")}
//                 >
//                   <FaUtensils className="text-[#ff4d2d]" />
//                 </button>
//               </>
//             )}

//             {/* MY ORDERS */}
//             <button
//               className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d]"
//               onClick={() => navigate("/my-order")}
//             >
//               <HiOutlineClipboardList size={20} />
//               <span className="hidden md:block">My Orders</span>
//             </button>
//           </>
//         )}

//         {/* ================= USER ================= */}
//         {userData?.role === "user" && (
//           <>
//             <div
//               className="relative cursor-pointer"
//               onClick={() => navigate("/cart")}
//             >
//               <IoCartOutline size={25} className="text-[#ff4d2d]" />
//               <span className="absolute -top-3 -right-2 text-[#ff4d2d]">
//                 {cartItems.length}
//               </span>
//             </div>

//             <button
//               className="hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d]"
//               onClick={() => navigate("/my-order")}
//             >
//               My Order
//             </button>
//           </>
//         )}

//         {/* ================= PROFILE ================= */}
//         <div
//           className="w-10 h-10 rounded-full bg-[#ff4d2d] text-white flex items-center justify-center cursor-pointer"
//           onClick={() => setShowInfo((prev) => !prev)}
//         >
//           {userData?.fullName?.slice(0, 1)}
//         </div>

//         {showInfo && (
//           <div className="fixed top-20 right-3 w-44 bg-white shadow-xl rounded-xl p-4 flex flex-col gap-2">
//             <div className="font-semibold">{userData?.fullName}</div>
//                 {userData.role == "user" && (
//               <div
//                 className="md:hidden text-[#ff4d2d] font-semibold cursor-pointer"
//                 onClick={() => navigate("/my-order")}
//               >
//                 My Order
//               </div>
//             )}
//             <button
//               className="text-[#ff4d2d] font-semibold text-left"
//               onClick={handleLogOut}
//             >
//               Log Out
//             </button>
//           </div>
//         )}
//       </div>
//     </div>

//   );
// };

// export default Nav;

import React, { useEffect, useState } from "react";
import { FaLocationDot, FaUtensils } from "react-icons/fa6";
import { IoSearch, IoCartOutline, IoClose } from "react-icons/io5"; // ✅ fixed
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { FiMenu } from "react-icons/fi";
import { serverUrl } from "../App";
import { setSearchItems, setUserData } from "../redux/userSlice";
import { HiOutlineClipboardList } from "react-icons/hi";
import { clearAuthStorage } from "../utils/authToken";

const Nav = () => {
  const { userData, currentCity, cartItems } = useSelector(
    (state) => state.user
  );
  const { myShopData } = useSelector((state) => state.owner);

  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const role = userData?.role;
  const isOwnerDashboard = location.pathname.startsWith("/owner");
  const handleLogOut = async () => {
    try {
      await api.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      clearAuthStorage();
      dispatch(setUserData(null));
      navigate("/signin");
    } catch (error) {
      clearAuthStorage();
      dispatch(setUserData(null));
      navigate("/signin");
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const result = await api.get(
          `${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,
          { withCredentials: true }
        );
        dispatch(setSearchItems(result.data));
      } catch (err) {

      }
    };

    if (!query.trim()) {
      dispatch(setSearchItems(null));
      return;
    }

    const handler = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query, currentCity, dispatch]);

  return (
    <div className="fixed top-0 left-0 right-0 h-16 z-50 bg-white border-b-2 px-4 md:px-8 flex items-center">

      {/* LEFT */}
      <div className="flex items-center gap-4">
        {isOwnerDashboard && (
          <button
            className="md:hidden"
            onClick={() => window.dispatchEvent(new Event("toggleSidebar"))}
          >
            <FiMenu size={22} />
          </button>
        )}

        <button
          className="text-xl md:text-2xl font-bold text-[#ff4d2d]"
          onClick={() => {
            setQuery("");
            dispatch(setSearchItems(null));
            navigate("/");
          }}
        >
          Fletto
        </button>
      </div>

      {/* SEARCH (USER ONLY) */}
      {role === "user" && (
        <div className="hidden md:flex flex-1 justify-center px-6">
          <div className="w-full max-w-lg flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border focus-within:border-[#ff4d2d] transition">

            <FaLocationDot className="text-[#ff4d2d]" />

            <span className="text-sm text-gray-600">
              {currentCity}
            </span>

            <div className="w-px h-5 bg-gray-300"></div>

            <IoSearch className="text-gray-400" />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search delicious food..."
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>
        </div>
      )}

      {/* RIGHT */}
      <div className="flex items-center gap-3 ml-auto">

        {/* MOBILE SEARCH */}
        {role === "user" &&
          (showSearch ? (
            <IoClose
              size={20}
              className="md:hidden text-[#ff4d2d]"
              onClick={() => setShowSearch(false)}
            />
          ) : (
            <IoSearch
              size={20}
              className="md:hidden text-[#ff4d2d]"
              onClick={() => setShowSearch(true)}
            />
          ))}

        {/* OWNER */}
        {role === "owner" && (
          <>
            {myShopData && (
              <button
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] hover:bg-[#ff4d2d]/20 transition"
                onClick={() => navigate("/owner/add-items")}
              >
                <FaUtensils />
                Add Item
              </button>
            )}

            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] hover:bg-[#ff4d2d]/20 transition"
              onClick={() => navigate("/my-order")}
            >
              <HiOutlineClipboardList />
              <span className="hidden md:block">Orders</span>
            </button>
          </>
        )}

        {/* DELIVERY */}
        {role === "delivery" && (
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-100 text-green-600"
            onClick={() => navigate("/delivery/orders")}
          >
            <HiOutlineClipboardList />
            <span className="hidden md:block">Deliveries</span>
          </button>
        )}

        {/* USER */}
        {role === "user" && (
          <div className="flex items-center gap-3 md:gap-4">
            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/cart")}
            >
              <IoCartOutline size={22} className="text-[#ff4d2d]" />
              <span className="absolute -top-2 -right-2 text-xs font-bold text-[#ff4d2d]">
                {cartItems.length}
              </span>
            </div>

            <button
              className="hidden md:block px-3 py-1.5 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d]"
              onClick={() => navigate("/my-order")}
            >
              My Order
            </button>
          </div>
        )}

        {/* PROFILE */}
        <div
          className="w-9 h-9 rounded-full bg-[#ff4d2d] text-white flex items-center justify-center cursor-pointer font-semibold"
          onClick={() => setShowInfo((prev) => !prev)}
        >
          {userData?.fullName?.charAt(0)?.toUpperCase()}
        </div>

        {/* DROPDOWN */}
        {showInfo && (
          <div className="absolute top-14 right-4 bg-white shadow-lg rounded-lg p-3 w-44 z-50 border border-gray-100">

            <p className="font-semibold text-sm mb-2 pb-1.5 border-b border-gray-100 text-gray-800">
              {userData?.fullName}
            </p>

            {role === "user" && (
              <div className="flex flex-col gap-2">
                <button
                  className="w-full text-left text-sm text-gray-600 hover:text-[#ff4d2d] transition-colors"
                  onClick={() => { setShowInfo(false); alert(`Profile Info:\nName: ${userData.fullName}\nEmail: ${userData.email}`); }}
                >
                  My Profile
                </button>
                <button
                  className="w-full text-left text-sm text-gray-600 hover:text-[#ff4d2d] transition-colors"
                  onClick={() => { setShowInfo(false); navigate("/my-order"); }}
                >
                  My Orders
                </button>
                <button
                  className="w-full text-left text-sm text-green-600 font-semibold hover:text-green-700 transition-colors"
                  onClick={() => { setShowInfo(false); navigate("/wallet"); }}
                >
                  My Wallet
                </button>
              </div>
            )}

            {role === "owner" && (
              <button
                className="block w-full text-left text-sm text-[#ff4d2d]"
                onClick={() => navigate("/owner")}
              >
                Dashboard
              </button>
            )}

            {role === "delivery" && (
              <button
                className="block w-full text-left text-sm text-green-600"
                onClick={() => navigate("/delivery")}
              >
                Dashboard
              </button>
            )}

            <button
              className="text-red-500 text-sm mt-2"
              onClick={handleLogOut}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* MOBILE SEARCH */}
      {showSearch && role === "user" && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md p-3 md:hidden flex items-center gap-2">
          <FaLocationDot className="text-[#ff4d2d]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search food..."
            className="w-full outline-none"
          />
        </div>
      )}
    </div>
  );
};

export default Nav;
