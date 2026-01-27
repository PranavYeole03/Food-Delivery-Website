// import React, { useEffect, useRef, useState } from "react";
// import Nav from "./Nav";
// import { categories } from "../category";
// import CategoryCard from "./CategoryCard";
// import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
// import { useSelector } from "react-redux";
// import FoodCard from "./FoodCard";
// import { useNavigate } from "react-router-dom";

// const userDashboard = () => {
//   const cateScrollRef = useRef();
//   const shopScrollRef = useRef();
//   const { currentCity, shopInMyCity, itemsInMyCity, searchItems } = useSelector(
//     (state) => state.user,
//   );
//   const [showLeftCateButton, setShowLeftCateButton] = useState(false);
//   const [showRightCateButton, setShowRightCateButton] = useState(false);
//   const [showLeftShopButton, setShowLeftShopButton] = useState(false);
//   const [showRightShopButton, setShowRightShopButton] = useState(false);
//   const [updatedItemList, setUpdatedItemList] = useState([]);
//   const navigate = useNavigate();

//   const handleFilterByCategory = (category) => {
//     if (category == "All") {
//       setUpdatedItemList(itemsInMyCity);
//     } else {
//       const filteredList = itemsInMyCity.filter((i) => i.category === category);
//       setUpdatedItemList(filteredList);
//     }
//   };
//   useEffect(() => {
//     setUpdatedItemList(itemsInMyCity);
//   }, [itemsInMyCity]);
//   const updateButton = (ref, setLeftButton, setRightButton) => {
//     const element = ref.current;
//     if (element) {
//       setLeftButton(element.scrollLeft > 0);
//       setRightButton(
//         element.scrollLeft + element.clientWidth < element.scrollWidth,
//       );
//     }
//   };

//   const scollHandler = (ref, direction) => {
//     if (ref.current) {
//       ref.current.scrollBy({
//         left: direction == "left" ? -200 : 200,
//         behavior: "smooth",
//       });
//     }
//   };

//   useEffect(() => {
//     if (cateScrollRef.current) {
//       updateButton(
//         cateScrollRef,
//         setShowLeftCateButton,
//         setShowRightCateButton,
//       );
//       updateButton(
//         shopScrollRef,
//         setShowLeftShopButton,
//         setShowRightShopButton,
//       );
//       cateScrollRef.current.addEventListener("scroll", () => {
//         updateButton(
//           cateScrollRef,
//           setShowLeftCateButton,
//           setShowRightCateButton,
//         );
//       });
//       shopScrollRef.current.addEventListener("scroll", () => {
//         updateButton(
//           shopScrollRef,
//           setShowLeftShopButton,
//           setShowRightShopButton,
//         );
//       });
//     }
//     return () => {
//       cateScrollRef?.current?.removedEventListener("scroll", () => {
//         updateButton(
//           cateScrollRef,
//           setShowLeftCateButton,
//           setShowRightCateButton,
//         );
//       });
//       shopScrollRef?.current?.removedEventListener("scroll", () => {
//         updateButton(
//           shopScrollRef,
//           setShowLeftShopButton,
//           setShowRightShopButton,
//         );
//       });
//     };
//   }, [categories]);

//   return (
//     <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
//       <Nav />

//       {searchItems && searchItems.length > 0 && (
//         <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-2xl mt-4">
//           <h1 className="text-gray-900 text-2xl sm:text-3xl font-semibold border-b border-gray-200 pb-2">
//             Search Results:
//           </h1>
//           <div className="w-full h-auto flex flex-wrap gap-6 justify-center">
//             {searchItems.map((item) => (
//               <FoodCard data={item} key={item._id} />
//             ))}
//           </div>
//         </div>
//       )}
//       {/* Category */}
//       <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
//         <h1 className="text-gray-800 text-2xl sm:text-3xl">
//           Inspiration For First Order
//         </h1>
//         <div className="w-full relative">
//           {showLeftCateButton && (
//             <button
//               className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shado-lg hover:bg-[#e64528] z-10"
//               onClick={() => scollHandler(cateScrollRef, "left")}
//             >
//               <FaChevronCircleLeft />
//             </button>
//           )}

//           <div
//             className="w-full flex overflow-x-auto gap-4 pb-2"
//             ref={cateScrollRef}
//           >
//             {categories.map((cate, index) => (
//               <CategoryCard
//                 name={cate.category}
//                 image={cate.image}
//                 key={index}
//                 onClick={() => handleFilterByCategory(cate.category)}
//               />
//             ))}
//           </div>
//           {showRightCateButton && (
//             <button
//               className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shado-lg hover:bg-[#e64528] z-10"
//               onClick={() => scollHandler(cateScrollRef, "right")}
//             >
//               <FaChevronCircleRight />
//             </button>
//           )}
//         </div>
//       </div>
//       {/* Shop Show */}
//       <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
//         <h1 className="text-gray-800 text-2xl sm:text-3xl">
//           Best Shop In {currentCity}
//         </h1>
//         <div className="w-full relative">
//           {showLeftShopButton && (
//             <button
//               className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shado-lg hover:bg-[#e64528] z-10"
//               onClick={() => scollHandler(shopScrollRef, "left")}
//             >
//               <FaChevronCircleLeft />
//             </button>
//           )}

//           <div
//             className="w-full flex overflow-x-auto gap-4 pb-2"
//             ref={shopScrollRef}
//           >
//             {shopInMyCity?.map((shop, index) => (
//               <CategoryCard
//                 name={shop.name}
//                 image={shop.image}
//                 key={index}
//                 onClick={() => navigate(`/shop-items/${shop._id}`)}
//               />
//             ))}
//           </div>
//           {showRightShopButton && (
//             <button
//               className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shado-lg hover:bg-[#e64528] z-10"
//               onClick={() => scollHandler(shopScrollRef, "right")}
//             >
//               <FaChevronCircleRight />
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Product show */}
//       <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
//         <h1 className="text-gray-800 text-2xl sm:text-3xl">
//           Suggested Food Items
//         </h1>
//         <div className="w-full h-auto flex flex-wrap gap-5 justify-center">
//           {updatedItemList?.map((item, index) => (
//             <FoodCard key={index} data={item} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default userDashboard;

import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import { categories } from "../category";
import CategoryCard from "./CategoryCard";
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import FoodCard from "./FoodCard";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

const userDashboard = () => {
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems } = useSelector(
    (state) => state.user,
  );

  // ✅ FIX 1: safe initial state
  const [updatedItemList, setUpdatedItemList] = useState([]);
  const [centerIndex, setCenterIndex] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (itemsInMyCity) setUpdatedItemList(itemsInMyCity);
  }, [itemsInMyCity]);

  /* 🔁 MOBILE AUTO ROTATE — SAFE */
  useEffect(() => {
    if (!categories || categories.length === 0) return;

    const interval = setInterval(() => {
      setCenterIndex((prev) => (prev + 1) % categories.length);
    }, 2600);

    return () => clearInterval(interval);
  }, []);

  const handleFilterByCategory = (category) => {
    if (category === "All") {
      setUpdatedItemList(itemsInMyCity || []);
    } else {
      setUpdatedItemList(
        (itemsInMyCity || []).filter((i) => i.category === category),
      );
    }
  };

  const moveLeft = () => {
    if (!categories || categories.length === 0) return;
    setCenterIndex(
      (prev) => (prev - 1 + categories.length) % categories.length,
    );
  };

  const moveRight = () => {
    if (!categories || categories.length === 0) return;
    setCenterIndex((prev) => (prev + 1) % categories.length);
  };

  const total = categories?.length || 0;
  const half = Math.floor(total / 2);

  return (
    <div className="w-screen min-h-screen flex flex-col bg-white overflow-y-auto">
      <Nav />
      <div
        className="flex-1 w-full flex flex-col items-center
             pt-4 px-4 sm:px-6 lg:px-12
             pb-16 sm:pb-20 lg:pb-24"
      >
        {/* ================= SEARCH RESULTS ================= */}
        {Array.isArray(searchItems) && searchItems.length > 0 && (
          <div className="w-full px-4 sm:px-6 lg:px-10 mt-4">
            <h1 className="text-2xl sm:text-3xl mb-3">Search Results</h1>

            <div className="w-full flex flex-wrap gap-4 justify-center">
              {searchItems.map((item) => (
                <FoodCard key={item._id} data={item} />
              ))}
            </div>
          </div>
        )}

        {/* ================= REST UI ================= */}
        {(!Array.isArray(searchItems) || searchItems.length === 0) && (
          <>
            {/* ================= CATEGORY ================= */}
            <div className="w-full px-4 sm:px-6 lg:px-10 mt-4">
              <h1 className="text-2xl sm:text-3xl mb-3">
                Inspiration For First Order
              </h1>

              {/* 📱 MOBILE */}
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
                            transform:
                              offset === 0 ? "scale(1.15)" : "scale(1)",
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

              {/* 💻 LAPTOP */}
              <div className="hidden lg:block relative h-65 overflow-hidden mt-2">
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-[#ff4d2d]"
                  onClick={moveLeft}
                >
                  <FaChevronCircleLeft size={25} />
                </button>

                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-[#ff4d2d]"
                  onClick={moveRight}
                >
                  <FaChevronCircleRight size={25} />
                </button>

                <div className="absolute inset-0 flex items-center justify-center">
                  {categories?.map((cate, index) => {
                    let position = index - centerIndex;
                    if (position > half) position -= total;
                    if (position < -half) position += total;

                    const isCenter = position === 0;

                    return (
                      <div
                        key={index}
                        className="absolute transition-all duration-700"
                        style={{
                          transform: `translateX(${position * 260}px) scale(${
                            isCenter ? 1.25 : 0.9
                          })`,
                          opacity: Math.abs(position) <= 2 ? 1 : 0,
                          zIndex: isCenter ? 10 : 1,
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
            </div>

            {/* ================= SHOPS ================= */}
            {/* <div className="w-full px-4 sm:px-6 lg:px-10 mt-4">
            <h1 className="text-2xl sm:text-3xl mb-3">
              Best Shop In {currentCity}
            </h1>

            <div className="w-full flex overflow-x-auto gap-4 pb-2">
              {shopInMyCity?.map((shop) => (
                <CategoryCard
                  key={shop._id}
                  name={shop.name}
                  image={shop.image}
                  onClick={() => navigate(`/shop-items/${shop._id}`)}
                />
              ))}
            </div>
          </div> */}
            <div className="w-full px-4 sm:px-6 lg:px-10 mt-4">
              <h1 className="text-2xl sm:text-3xl mb-3">
                Best Shop In {currentCity}
              </h1>

              {/* CASE 1: Only one shop */}
              {shopInMyCity?.length === 1 && (
                <div className="w-full flex justify-center">
                  <div
                    onClick={() =>
                      navigate(`/shop-items/${shopInMyCity[0]._id}`)
                    }
                    className="w-full max-w-3xl bg-white rounded-xl shadow-md cursor-pointer overflow-hidden"
                  >
                    <img
                      src={shopInMyCity[0].image}
                      alt={shopInMyCity[0].name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-4 text-center">
                      <h2 className="text-xl font-semibold">
                        {shopInMyCity[0].name}
                      </h2>
                    </div>
                  </div>
                </div>
              )}

              {/* CASE 2: Two or more shops */}
              {shopInMyCity?.length > 1 && (
                <div className="w-full flex overflow-x-auto gap-4 pb-2">
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
            </div>

            {/* ================= PRODUCTS ================= */}
            <div className="w-full px-4 sm:px-6 lg:px-10 mt-4">
              <h1 className="text-2xl sm:text-3xl mb-3">
                Suggested Food Items
              </h1>

              <div className="w-full flex flex-wrap gap-4 justify-center">
                {updatedItemList.map((item) => (
                  <FoodCard key={item._id} data={item} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default userDashboard;
