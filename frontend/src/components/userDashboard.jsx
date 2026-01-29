import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import Footer from "./Footer";
import { categories } from "../category";
import CategoryCard from "./CategoryCard";
import FoodCard from "./FoodCard";
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import banner from "../assets/banner.png";

const UserDashboard = () => {
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems } = useSelector(
    (state) => state.user,
  );

  const [filteredItems, setFilteredItems] = useState([]);
  const [centerIndex, setCenterIndex] = useState(0);

  const navigate = useNavigate();

  /* ================= INITIAL ITEMS ================= */
  useEffect(() => {
    if (Array.isArray(itemsInMyCity)) {
      setFilteredItems(itemsInMyCity);
    }
  }, [itemsInMyCity]);

  /* ================= CATEGORY AUTO ROTATE ================= */
  useEffect(() => {
    if (!categories?.length) return;

    const interval = setInterval(() => {
      setCenterIndex((prev) => (prev + 1) % categories.length);
    }, 2600);

    return () => clearInterval(interval);
  }, []);

  /* ================= CATEGORY FILTER ================= */
  const handleFilterByCategory = (category) => {
    if (category === "All") {
      setFilteredItems(itemsInMyCity || []);
    } else {
      setFilteredItems(
        (itemsInMyCity || []).filter((item) => item.category === category),
      );
    }
  };

  const moveLeft = () => {
    if (!categories?.length) return;
    setCenterIndex(
      (prev) => (prev - 1 + categories.length) % categories.length,
    );
  };

  const moveRight = () => {
    if (!categories?.length) return;
    setCenterIndex((prev) => (prev + 1) % categories.length);
  };

  const total = categories?.length || 0;
  const half = Math.floor(total / 2);

  return (
    <div className="w-screen min-h-screen flex flex-col bg-[#fbfbfb00]">
      <Nav />
      {/* ================= BANNER (ONE DIV ONLY) ================= */}
      <div className="mx-4 sm:mx-6 lg:mx-12 mt-4">
        <div
          className="
      relative
      w-full
      h-40 sm:h-50 md:h-65 lg:h-80
      rounded-2xl overflow-hidden shadow-md
      bg-cover bg-center
    "
          style={{ backgroundImage: `url(${banner})` }}
        >
          {/* soft overlay so text is readable */}
          <div className="absolute inset-0 bg-black/10" />

          {/* text content */}
          <div className="absolute inset-0 flex items-center">
            <div className="pl-5 sm:pl-10 lg:pl-14 max-w-[55%]">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Fletto
              </h1>

              <p className="mt-2 text-sm sm:text-base lg:text-lg text-white/90">
                Fresh food, delivered daily.
              </p>

              <button
                className="
            mt-4
            px-6 py-2
            rounded-full
            bg-green-500
            text-white
            font-semibold
            hover:bg-green-600
            transition
          "
              >
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full px-4 sm:px-6 lg:px-12 pt-4 pb-24">
        {/* ================= SEARCH RESULTS ================= */}
        {Array.isArray(searchItems) && searchItems.length > 0 && (
          <>
            <h1 className="text-2xl sm:text-3xl mb-3">Search Results</h1>
            <div className="flex flex-wrap gap-4 justify-center">
              {searchItems.map((item) => (
                <FoodCard key={item._id} data={item} />
              ))}
            </div>
          </>
        )}

        {/* ================= MAIN DASHBOARD ================= */}
        {(!Array.isArray(searchItems) || searchItems.length === 0) && (
          <>
            {/* ================= CATEGORIES ================= */}
            <h1 className="text-2xl sm:text-3xl mb-4 mt-4">
              Inspiration For First Order
            </h1>

            {/* ================= MOBILE ================= */}
            <div className="lg:hidden relative w-full h-50 flex items-center justify-center">
              <button
                className="absolute left-1 top-1/2 -translate-y-1/2 z-30 text-[#ff4d2d]"
                onClick={moveLeft}
              >
                <FaChevronCircleLeft size={30} />
              </button>

              <button
                className="absolute right-1 top-1/2 -translate-y-1/2 z-30 text-[#ff4d2d]"
                onClick={moveRight}
              >
                <FaChevronCircleRight size={30} />
              </button>

              <div className="flex items-center justify-center gap-4 w-full">
                {categories?.length > 0 &&
                  [-1, 0, 1].map((offset) => {
                    const index =
                      (centerIndex + offset + categories.length) %
                      categories.length;

                    return (
                      <div
                        key={index}
                        className="transition-transform duration-500"
                        style={{
                          transform: offset === 0 ? "scale(1.15)" : "scale(1)",
                        }}
                      >
                        <CategoryCard
                          name={categories[index].category}
                          image={categories[index].image}
                          onClick={() =>
                            handleFilterByCategory(categories[index].category)
                          }
                        />
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* ================= DESKTOP ================= */}
            <div className="hidden lg:block relative w-full h-70 mt-6">
              {/* LEFT BUTTON */}
              <button
                onClick={moveLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20"
              >
                <FaChevronCircleLeft size={30} className="text-[#ff4d2d]" />
              </button>

              {/* RIGHT BUTTON */}
              <button
                onClick={moveRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20"
              >
                <FaChevronCircleRight size={30} className="text-[#ff4d2d]" />
              </button>

              {/* CATEGORY CARDS */}
              <div className="absolute inset-0 flex items-center justify-center">
                {categories.map((cate, index) => {
                  let pos = index - centerIndex;
                  if (pos > half) pos -= total;
                  if (pos < -half) pos += total;

                  return (
                    <div
                      key={index}
                      className="absolute transition-all duration-700"
                      style={{
                        transform: `translateX(${pos * 260}px) scale(${
                          pos === 0 ? 1.25 : 0.9
                        })`,
                        opacity: Math.abs(pos) <= 2 ? 1 : 0,
                        zIndex: pos === 0 ? 10 : 1,
                      }}
                    >
                      <CategoryCard
                        name={cate.category}
                        image={cate.image}
                        onClick={() => handleFilterByCategory(cate.category)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ================= SHOPS ================= */}
            <h1 className="text-2xl sm:text-3xl mb-3 mt-6">
              Best Shop In {currentCity}
            </h1>

            {shopInMyCity?.length === 1 && (
              <div
                className="max-w-3xl mx-auto cursor-pointer"
                onClick={() => navigate(`/shop-items/${shopInMyCity[0]._id}`)}
              >
                <img
                  src={shopInMyCity[0].image}
                  alt={shopInMyCity[0].name}
                  className="w-full h-64 object-cover rounded-xl"
                />
                <h2 className="text-xl font-semibold text-center mt-3">
                  {shopInMyCity[0].name}
                </h2>
              </div>
            )}

            {shopInMyCity?.length > 1 && (
              <div className="flex overflow-x-auto gap-4">
                {shopInMyCity.map((shop) => (
                  <CategoryCard
                    key={shop._id}
                    name={shop.name}
                    image={shop.image}
                    onClick={() => navigate(`/shop-items/${shop._id}`)}
                  />
                ))}
              </div>
            )}

            {/* ================= ITEMS ================= */}
            <h1 className="text-2xl sm:text-3xl mb-3 mt-6">
              Suggested Food Items
            </h1>

            <div className="flex flex-wrap gap-4 justify-center">
              {filteredItems.map((item) => (
                <FoodCard key={item._id} data={item} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default UserDashboard;
