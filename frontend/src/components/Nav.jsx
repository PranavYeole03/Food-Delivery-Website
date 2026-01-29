import React, { useEffect, useState } from "react";
import { FaLocationDot, FaUtensils } from "react-icons/fa6";
import { IoSearch, IoCartOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { setSearchItems, setUserData } from "../redux/userSlice";
import { HiOutlineClipboardList } from "react-icons/hi";


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

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearchItems = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,
        { withCredentials: true }
      );
      dispatch(setSearchItems(result.data));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (query.trim()) {
      handleSearchItems();
    } else {
      dispatch(setSearchItems(null));
    }
  }, [query]);

  return (
<div className="w-full h-20 fixed top-0 z-50 bg-white shadow-md px-7 flex items-center justify-between">

      {/* ================= MOBILE SEARCH BAR (USER ONLY) ================= */}
      {showSearch && userData?.role === "user" && (
        <div className="w-[90%] bg-white shadow-xl rounded-lg flex items-center gap-4 px-4 fixed top-20 left-[5%] md:hidden">
          <div className="flex items-center w-[30%] border-r pr-2">
            <FaLocationDot className="text-[#ff4d2d]" />
            <span className="ml-2 truncate text-gray-600">{currentCity}</span>
          </div>

          <div className="flex items-center w-[70%] gap-2">
            <IoSearch className="text-[#ff4d2d]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search delicious food..."
              className="w-full outline-none"
            />
          </div>
        </div>
      )}

      {/* ================= LOGO ================= */}
      <button
        className="text-3xl font-bold text-[#ff4d2d]"
        onClick={() => {
          setQuery("");
          dispatch(setSearchItems(null));
          navigate("/");
        }}
      >
        Fletto
      </button>

      {/* ================= DESKTOP SEARCH (USER ONLY) ================= */}
      {userData?.role === "user" && (
        <div className="hidden md:flex md:w-[60%] lg:w-[40%] h-17.5 bg-white shadow-xl rounded-lg px-4 items-center gap-5">
          <div className="flex items-center w-[30%] border-r pr-2">
            <FaLocationDot className="text-[#ff4d2d]" />
            <span className="ml-2 truncate text-gray-600">{currentCity}</span>
          </div>

          <div className="flex items-center w-[70%] gap-2">
            <IoSearch className="text-[#ff4d2d]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search delicious food..."
              className="w-full outline-none"
            />
          </div>
        </div>
      )}

      {/* ================= RIGHT ACTIONS ================= */}
      <div className="flex items-center gap-4">

        {/* MOBILE SEARCH TOGGLE (USER ONLY) */}
        {userData?.role === "user" &&
          (showSearch ? (
            <IoMdClose
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

        {/* ================= OWNER (FIXED) ================= */}
        {userData?.role === "owner" && (
          <>
            {myShopData && (
              <>
                {/* DESKTOP */}
                <button
                  className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d]"
                  onClick={() => navigate("/add-items")}
                >
                  <FaUtensils className="text-[#ff4d2d]" />
                  <span>Add Food Item</span>
                </button>

                {/* MOBILE */}
                <button
                  className="md:hidden p-2 rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]"
                  onClick={() => navigate("/add-items")}
                >
                  <FaUtensils className="text-[#ff4d2d]" />
                </button>
              </>
            )}

            {/* MY ORDERS */}
            <button
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d]"
              onClick={() => navigate("/my-order")}
            >
              <HiOutlineClipboardList size={20} />
              <span className="hidden md:block">My Orders</span>
            </button>
          </>
        )}

        {/* ================= USER ================= */}
        {userData?.role === "user" && (
          <>
            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/cart")}
            >
              <IoCartOutline size={25} className="text-[#ff4d2d]" />
              <span className="absolute -top-3 -right-2 text-[#ff4d2d]">
                {cartItems.length}
              </span>
            </div>

            <button
              className="hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d]"
              onClick={() => navigate("/my-order")}
            >
              My Order
            </button>
          </>
        )}

        {/* ================= PROFILE ================= */}
        <div
          className="w-10 h-10 rounded-full bg-[#ff4d2d] text-white flex items-center justify-center cursor-pointer"
          onClick={() => setShowInfo((prev) => !prev)}
        >
          {userData?.fullName?.slice(0, 1)}
        </div>

        {showInfo && (
          <div className="fixed top-20 right-3 w-44 bg-white shadow-xl rounded-xl p-4 flex flex-col gap-2">
            <div className="font-semibold">{userData?.fullName}</div>
                {userData.role == "user" && (
              <div
                className="md:hidden text-[#ff4d2d] font-semibold cursor-pointer"
                onClick={() => navigate("/my-order")}
              >
                My Order
              </div>
            )}
            <button
              className="text-[#ff4d2d] font-semibold text-left"
              onClick={handleLogOut}
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>

  );
};

export default Nav;

