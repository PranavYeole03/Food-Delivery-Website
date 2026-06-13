import api from "../api/axios";
import React, { useEffect, useState } from "react";
import { serverUrl } from "../App";
import { useNavigate, useParams } from "react-router-dom";
import { FaLocationDot, FaStore } from "react-icons/fa6";
import { FaUtensils } from "react-icons/fa";
import FoodCard from "../components/FoodCard";
import { FaArrowLeft } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { useSelector } from "react-redux";

const ShopItems = () => {
  const { shopId } = useParams();

  const { userData, cartItems } = useSelector((state) => state.user);

  const [items, setItems] = useState([]);
  const [shop, setShop] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const handleShop = async () => {
    try {
      setLoading(true);
      const result = await api.get(
        `${serverUrl}/api/item/get-by-shop/${shopId}`,
        { withCredentials: true }
      );
      setShop(result.data.shop);
      setItems(result.data.items);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleShop();
  }, [shopId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BACK BUTTON */}
      <button
        className="fixed top-4 left-4 z-20 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-full shadow-md transition"
        onClick={() => navigate("/")}
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>

      {/* CART ICON (USER ONLY) */}
      {userData?.role === "user" && (
        <div
          className="fixed top-4 right-4 z-20 cursor-pointer"
          onClick={() => navigate("/cart")}
        >
          <div className="relative">
            <IoCartOutline size={26} className="text-[#ff4d2d]" />
            <span className="absolute -top-2 -right-2 text-[#ff4d2d] text-sm font-semibold">
              {cartItems.length}
            </span>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <p className="text-center mt-20 text-xl font-semibold">
          Loading menu...
        </p>
      )}

      {/* SHOP HEADER */}
      {!loading && shop && (
        <div className="relative w-full h-64 md-h-80 md-w-90 lg:h-96">
          <img src={shop.image} alt="" className="w-full h-full object-cover" />

          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center
            bg-linear-to-b from-black/80 via-black/50 to-black/30"
          >
            <FaStore className="text-white text-4xl mb-3" />

            <h1 className="text-3xl md:text-5xl font-extrabold text-white">
              {shop.name}
            </h1>

            <div className="flex items-center gap-2">
              <FaLocationDot size={22} color="red" />
              <p className="text-lg font-medium text-gray-200 mt-2.5">
                {shop.address}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ITEMS */}
      {!loading && (
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h2 className="flex items-center justify-center gap-3 text-3xl font-bold mb-2 text-gray-800">
            <FaUtensils color="red" /> Our Menu
          </h2>

          <p className="text-center text-gray-500 mb-8">
            Freshly prepared items from this shop
          </p>

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search food..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-96 mx-auto block mb-6 px-4 py-2 border rounded-full shadow"
          />

          {items.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-8">
              {items
                .filter((i) =>
                  i.name.toLowerCase().includes(search.toLowerCase())
                )
                .map((item) => (
                  <FoodCard key={item._id} data={item} />
                ))}
            </div>
          ) : (
            <div className="text-center mt-10">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076503.png"
                className="w-40 mx-auto opacity-70"
                alt="No items"
              />
              <p className="mt-4 text-gray-500 text-lg">
                No items found in this shop
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopItems;

