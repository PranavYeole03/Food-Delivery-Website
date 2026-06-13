// import React, { useEffect, useState } from "react";
// import Nav from "./Nav";
// import Footer from "./Footer";
// import { categories } from "../category";
// import CategoryCard from "./CategoryCard";
// import FoodCard from "./FoodCard";
// import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";

// import banner from "../assets/banner.png";
// import banner2 from "../assets/banner2.png";
// import banner3 from "../assets/banner3.png";
// const banners = [banner, banner2, banner3];
// const UserDashboard = () => {
//   const { currentCity, shopInMyCity, itemsInMyCity, searchItems } = useSelector(
//     (state) => state.user,
//   );

//   const [filteredItems, setFilteredItems] = useState([]);
//   const [centerIndex, setCenterIndex] = useState(0);

//   const navigate = useNavigate();

//   const [bannerIndex, setBannerIndex] = useState(0);

//   /* ================= AUTO BANNER ROTATE ================= */
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setBannerIndex((prev) => (prev + 1) % banners.length);
//     }, 5000);

//     return () => clearInterval(interval);
//   }, []);


//   /* ================= INITIAL ITEMS ================= */
//   useEffect(() => {
//     if (Array.isArray(itemsInMyCity)) {
//       setFilteredItems(itemsInMyCity);
//     }
//   }, [itemsInMyCity]);

//   /* ================= CATEGORY AUTO ROTATE ================= */
//   useEffect(() => {
//     if (!categories?.length) return;

//     const interval = setInterval(() => {
//       setCenterIndex((prev) => (prev + 1) % categories.length);
//     }, 2600);

//     return () => clearInterval(interval);
//   }, []);

//   /* ================= CATEGORY FILTER ================= */
//   const handleFilterByCategory = (category) => {
//     if (category === "All") {
//       setFilteredItems(itemsInMyCity || []);
//     } else {
//       setFilteredItems(
//         (itemsInMyCity || []).filter((item) => item.category === category),
//       );
//     }
//   };

//   const moveLeft = () => {
//     if (!categories?.length) return;
//     setCenterIndex(
//       (prev) => (prev - 1 + categories.length) % categories.length,
//     );
//   };

//   const moveRight = () => {
//     if (!categories?.length) return;
//     setCenterIndex((prev) => (prev + 1) % categories.length);
//   };

//   const total = categories?.length || 0;
//   const half = Math.floor(total / 2);

//   return (
//     <div className="w-screen min-h-screen flex flex-col bg-[#fbfbfb00]">
//       <Nav />
//       {/* ================= AUTO SLIDER BANNER ================= */}
//       <div className="mx-4 sm:mx-6 lg:mx-12 mt-4">
//         <div
//           className="
//       relative
//       w-full
//       h-48 sm:h-60 md:h-72 lg:h-96
//       rounded-2xl
//       overflow-hidden
//       shadow-md
//       bg-cover bg-center
//       transition-all duration-700
//     "
//           style={{ backgroundImage: `url(${banners[bannerIndex]})` }}
//         >
//           {/* overlay */}
//           <div className="absolute inset-0 bg-black/20" />

//           {/* text */}
//           <div className="absolute inset-0 flex items-center">
//             <div className="pl-5 sm:pl-10 lg:pl-14 max-w-[60%]">
//               <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
//                 Fletto
//               </h1>

//               <p className="mt-2 text-sm sm:text-base lg:text-lg text-white/90">
//                 Fresh food, delivered daily.
//               </p>

//               <button
//                 className="
//             mt-4 px-6 py-2 rounded-full
//             bg-green-500 text-white font-semibold
//             hover:bg-green-600 transition
//           "
//               >
//                 Shop Now
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>


//       <div className="flex-1 w-full px-4 sm:px-6 lg:px-12 pt-4 pb-24">
//         {/* ================= SEARCH RESULTS ================= */}
//         {Array.isArray(searchItems) && searchItems.length > 0 && (
//           <>
//             <h1 className="text-2xl sm:text-3xl mb-3">Search Results</h1>
//             <div className="flex flex-wrap gap-4 justify-center">
//               {searchItems.map((item) => (
//                 <FoodCard key={item._id} data={item} />
//               ))}
//             </div>
//           </>
//         )}

//         {/* ================= MAIN DASHBOARD ================= */}
//         {(!Array.isArray(searchItems) || searchItems.length === 0) && (
//           <>
//             {/* ================= CATEGORIES ================= */}
//             <h1 className="text-2xl sm:text-3xl mb-4 mt-4">
//               Inspiration For First Order
//             </h1>

//             {/* ================= MOBILE ================= */}
//             <div className="lg:hidden relative w-full h-50 flex items-center justify-center">
//               <button
//                 className="absolute left-1 top-1/2 -translate-y-1/2 z-30 text-[#ff4d2d]"
//                 onClick={moveLeft}
//               >
//                 <FaChevronCircleLeft size={30} />
//               </button>

//               <button
//                 className="absolute right-1 top-1/2 -translate-y-1/2 z-30 text-[#ff4d2d]"
//                 onClick={moveRight}
//               >
//                 <FaChevronCircleRight size={30} />
//               </button>

//               <div className="flex items-center justify-center gap-4 w-full">
//                 {categories?.length > 0 &&
//                   [-1, 0, 1].map((offset) => {
//                     const index =
//                       (centerIndex + offset + categories.length) %
//                       categories.length;

//                     return (
//                       <div
//                         key={index}
//                         className="transition-transform duration-500"
//                         style={{
//                           transform: offset === 0 ? "scale(1.15)" : "scale(1)",
//                         }}
//                       >
//                         <CategoryCard
//                           name={categories[index].category}
//                           image={categories[index].image}
//                           onClick={() =>
//                             handleFilterByCategory(categories[index].category)
//                           }
//                         />
//                       </div>
//                     );
//                   })}
//               </div>
//             </div>

//             {/* ================= DESKTOP ================= */}
//             <div className="hidden lg:block relative w-full h-70 mt-6">
//               {/* LEFT BUTTON */}
//               <button
//                 onClick={moveLeft}
//                 className="absolute left-0 top-1/2 -translate-y-1/2 z-20"
//               >
//                 <FaChevronCircleLeft size={30} className="text-[#ff4d2d]" />
//               </button>

//               {/* RIGHT BUTTON */}
//               <button
//                 onClick={moveRight}
//                 className="absolute right-0 top-1/2 -translate-y-1/2 z-20"
//               >
//                 <FaChevronCircleRight size={30} className="text-[#ff4d2d]" />
//               </button>

//               {/* CATEGORY CARDS */}
//               <div className="absolute inset-0 flex items-center justify-center">
//                 {categories.map((cate, index) => {
//                   let pos = index - centerIndex;
//                   if (pos > half) pos -= total;
//                   if (pos < -half) pos += total;

//                   return (
//                     <div
//                       key={index}
//                       className="absolute transition-all duration-700"
//                       style={{
//                         transform: `translateX(${pos * 260}px) scale(${pos === 0 ? 1.25 : 0.9
//                           })`,
//                         opacity: Math.abs(pos) <= 2 ? 1 : 0,
//                         zIndex: pos === 0 ? 10 : 1,
//                       }}
//                     >
//                       <CategoryCard
//                         name={cate.category}
//                         image={cate.image}
//                         onClick={() => handleFilterByCategory(cate.category)}
//                       />
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* ================= SHOPS ================= */}
//             <h1 className="text-2xl sm:text-3xl mb-3 mt-6">
//               Best Shop In {currentCity}
//             </h1>

//             {shopInMyCity?.length === 1 && (
//               <div
//                 className="max-w-3xl mx-auto cursor-pointer"
//                 onClick={() => navigate(`/shop-items/${shopInMyCity[0]._id}`)}
//               >
//                 <img
//                   src={shopInMyCity[0].image}
//                   alt={shopInMyCity[0].name}
//                   className="w-full h-64 object-cover rounded-xl"
//                 />
//                 <h2 className="text-xl font-semibold text-center mt-3">
//                   {shopInMyCity[0].name}
//                 </h2>
//               </div>
//             )}

//             {shopInMyCity?.length > 1 && (
//               <div className="flex overflow-x-auto gap-4">
//                 {shopInMyCity.map((shop) => (
//                   <CategoryCard
//                     key={shop._id}
//                     name={shop.name}
//                     image={shop.image}
//                     onClick={() => navigate(`/shop-items/${shop._id}`)}
//                   />
//                 ))}
//               </div>
//             )}

//             {/* ================= ITEMS ================= */}
//             <h1 className="text-2xl sm:text-3xl mb-3 mt-6">
//               Suggested Food Items
//             </h1>

//             <div className="flex flex-wrap gap-4 justify-center">
//               {filteredItems.map((item) => (
//                 <FoodCard key={item._id} data={item} />
//               ))}
//             </div>
//           </>
//         )}
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default UserDashboard;

import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import Footer from "./Footer";
import { categories } from "../category";
import CategoryCard from "./CategoryCard";
import FoodCard from "./FoodCard";
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { optimizeCloudinaryUrl } from "../utils/cloudinary";

import banner from "../assets/banner.png";
import banner2 from "../assets/banner2.png";
import banner3 from "../assets/banner3.png";
const banners = [banner, banner2, banner3];
const UserDashboard = () => {
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems } = useSelector(
    (state) => state.user,
  );

  const [filteredItems, setFilteredItems] = useState([]);
  const [centerIndex, setCenterIndex] = useState(0);

  const navigate = useNavigate();

  const [bannerIndex, setBannerIndex] = useState(0);

  /* ================= AUTO BANNER ROTATE ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);


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
  const hasLocation = Boolean(currentCity?.trim());

  return (
    <div className="w-screen min-h-screen flex flex-col bg-white">
      <Nav />
      {/* ================= AUTO SLIDER BANNER ================= */}
      <div className="mx-4 sm:mx-6 lg:mx-12 mt-4">
        <div
          className="
      relative
      w-full
      h-48 sm:h-60 md:h-72 lg:h-96
      rounded-2xl
      overflow-hidden
      shadow-md
      bg-cover bg-center
      transition-all duration-700
    "
          style={{ backgroundImage: `url(${banners[bannerIndex]})` }}
        >
          {/* overlay */}
          <div className="absolute inset-0 bg-black/20" />

          {/* text */}
          <div className="absolute inset-0 flex items-center">
            <div className="pl-5 sm:pl-10 lg:pl-14 max-w-[60%]">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Fletto
              </h1>

              <p className="mt-2 text-sm sm:text-base lg:text-lg text-white/90">
                Fresh food, delivered daily.
              </p>

              <button
                className="
            mt-4 px-6 py-2 rounded-full
            bg-green-500 text-white font-semibold
            hover:bg-green-600 transition
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
              Explore Delicious Options
            </h1>


            {/* ================= MOBILE ================= */}
            <div className="lg:hidden w-full px-4 mt-4">

              <div className="relative flex items-center justify-center h-45 bg-white rounded-xl shadow-sm">

                {/* LEFT */}
                <button
                  onClick={moveLeft}
                  className="absolute left-2 z-20 bg-white shadow rounded-full p-1 "
                >
                  <FaChevronCircleLeft size={18} className="text-[#ff4d2d]" />
                </button>

                {/* RIGHT */}
                <button
                  onClick={moveRight}
                  className="absolute right-2 z-20 bg-white shadow rounded-full p-1"
                >
                  <FaChevronCircleRight size={18} className="text-[#ff4d2d]" />
                </button>

                {/* CARDS */}
                <div className="flex items-center justify-center gap-3">

                  {[-1, 0, 1].map((offset) => {
                    const index =
                      (centerIndex + offset + categories.length) %
                      categories.length;

                    return (
                      <div
                        key={index}
                        className="transition-all duration-500"
                        style={{
                          transform:
                            offset === 0
                              ? "scale(1.1)"
                              : "scale(0.9)",
                          opacity: offset === 0 ? 1 : 0.7,
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
            </div>
            {/* ================= DESKTOP ================= */}
            <div className="hidden lg:block w-full px-6 mt-6">

              <div className="relative w-full h-65 flex items-center justify-center bg-white rounded-2xl shadow-sm overflow-hidden">

                {/* LEFT */}
                <button
                  onClick={moveLeft}
                  className="absolute left-4 z-20 bg-white shadow-lg rounded-full p-2 hover:scale-110 transition"
                >
                  <FaChevronCircleLeft size={28} className="text-[#ff4d2d]" />
                </button>

                {/* RIGHT */}
                <button
                  onClick={moveRight}
                  className="absolute right-4 z-20 bg-white shadow-lg rounded-full p-2 hover:scale-110 transition"
                >
                  <FaChevronCircleRight size={28} className="text-[#ff4d2d]" />
                </button>

                {/* CAROUSEL */}
                <div className="relative w-full h-full flex items-center justify-center">

                  {categories.map((cate, index) => {
                    let pos = index - centerIndex;

                    if (pos > half) pos -= total;
                    if (pos < -half) pos += total;

                    return (
                      <div
                        key={index}
                        className="absolute transition-all duration-500 ease-in-out"
                        style={{
                          transform: `translateX(${pos * 200}px) scale(${pos === 0 ? 1.2 : 0.85
                            })`,
                          opacity: Math.abs(pos) <= 3 ? 1 : 0,
                          zIndex: pos === 0 ? 20 : 10,
                          filter: pos === 0 ? "none" : "blur(1px)",
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

            {!hasLocation ? (
              <div className="mt-8 rounded-xl border border-orange-200 bg-orange-50 px-5 py-6 text-center text-gray-800">
                <h2 className="text-xl font-semibold">Turn on location to see nearby restaurants</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Restaurants and suggested food items are shown after your city is detected.
                </p>
              </div>
            ) : (
              <>
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
                      src={optimizeCloudinaryUrl(shopInMyCity[0].image, 900)}
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
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default UserDashboard;
