import React, { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import api from "../api/axios";
import { serverUrl } from "../App";
import { setmyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

const EditItem = () => {
  // const { myShopData } = useSelector((state) => state.owner);
  const { itemId } = useParams();
  // const [currentItem, setCurrentItem] = useState(null);
  const [frontendImage, setFrontendImage] = useState("");
  const [backendImage, setBackendImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("");

  const categories = [
    "Snacks",
    "Main Course",
    "Desserts",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "South Indian",
    "North Indian",
    "Chinese",
    "Fast Food",
    "Others",
  ];

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("price", price);

      if (backendImage) {
        formData.append("image", backendImage);
      }
      const result = await api.post(
        `${serverUrl}/api/item/edit-items/${itemId}`,
        formData,
        { withCredentials: true }
      );
      dispatch(setmyShopData(result.data));
      
      setLoading(false);
      navigate("/");
    } catch (error) {
      
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   const handleGetById = async () => {
  //     try {
  //       const result = await api.get(
  //         `${serverUrl}/api/item/get-by-id/${itemId}`,
  //         { withCredentials: true }
  //       );
  //       setCurrentItem(result.data);
  //     } catch (error) {
  //       
  //     }
  //   };
  //   handleGetById();
  // }, [itemId]);

  // useEffect(() => {
  //   setName(currentItem?.name || "");
  //   setPrice(currentItem?.price || 0);
  //   setCategory(currentItem?.category || "");
  //   setFoodType(currentItem?.foodType || "");
  //   setFrontendImage(currentItem?.image || "");
  // }, [currentItem]);

  useEffect(() => {
  const handleGetById = async () => {
    try {
      const result = await api.get(
        `${serverUrl}/api/item/get-by-id/${itemId}`,
        { withCredentials: true }
      );

      const item = result.data;

      setName(item.name || "");
      setPrice(item.price || 0);
      setCategory(item.category || "");
      setFoodType(item.foodType || "");
      setFrontendImage(item.image || "");
    } catch (error) {
      
    }
  };

  handleGetById();
}, [itemId]);

  // return (
  //   <div className="flex justify-center flex-col items-center p-6 bg-linear-to-br from-orange-50 relative to-white min-h-screen">
  //     <div
  //       className="absolute top-5 left-5 z-10 mb-2.5"
  //       onClick={() => navigate("/")}
  //     >
  //       <IoArrowBack size={35} className="text-[#ff4d2d]" />
  //     </div>
  //     <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">
  //       <div className="flex flex-col items-center mb-6">
  //         <div className="bg-orange-100 p-4 rounded-full mb-4">
  //           <FaUtensils className="text-[#ff4d2d] w-16 h-16" />
  //         </div>
  //         <div className="text-3xl font-extrabold text-gray-900">
  //           Edit Food Item
  //         </div>
  //       </div>
  //       <form className="space-y-5" onSubmit={handleSubmit}>
  //         <div className="">
  //           <label className="block text-sm font-medium text-gray-700 mb-1">
  //             Name
  //           </label>
  //           <input
  //             type="text"
  //             placeholder="Enter Food Name"
  //             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
  //             onChange={(e) => setName(e.target.value)}
  //             value={name || ""}
  //           />
  //         </div>
  //         <div className="">
  //           <label className="block text-sm font-medium text-gray-700 mb-1">
  //             Food Image
  //           </label>
  //           <input
  //             type="file"
  //             accept="image/*"
  //             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
  //             onChange={handleImage}
  //           />
  //           {frontendImage && (
  //             <div className="mt-4">
  //               <img
  //                 src={frontendImage}
  //                 alt=""
  //                 className="w-full h-48 object-cover rounded-lg border"
  //               />
  //             </div>
  //           )}
  //         </div>

  //         <div>
  //           <label className="block text-sm font-medium text-gray-700 mb-1">
  //             Price
  //           </label>
  //           <input
  //             type="number"
  //             placeholder="0"
  //             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
  //             onChange={(e) => setPrice(Number(e.target.value))}
  //             value={price}
  //           />
  //         </div>
  //         <div>
  //           <label className="block text-sm font-medium text-gray-700 mb-1">
  //             Select Category
  //           </label>
  //           <select
  //             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
  //             onChange={(e) => setCategory(e.target.value)}
  //             value={category}
  //           >
  //             <option value="">select Category</option>
  //             {categories.map((cate, index) => (
  //               <option value={cate} key={index}>
  //                 {cate}
  //               </option>
  //             ))}
  //           </select>
  //         </div>
  //         <div>
  //           <label className="block text-sm font-medium text-gray-700 mb-1">
  //             Select Food Type
  //           </label>
  //           <select
  //             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
  //             onChange={(e) => setFoodType(e.target.value)}
  //             value={foodType}
  //           >
  //             <option value="veg">Veg</option>
  //             <option value="nonveg">Non-veg</option>
  //           </select>
  //         </div>

  //         <button
  //           className="w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer"
  //           disabled={loading}
  //         >
  //           {loading ? <ClipLoader size={20} color="white" /> : "Save"}
  //         </button>
  //       </form>
  //     </div>
  //   </div>
  // );
return (
  <div className="relative min-h-screen flex items-center justify-center px-4 py-10
  bg-linear-to-br bg-slate-50">

    {/* Back */}
    <div
      className="absolute top-5 left-5 z-10 cursor-pointer"
      onClick={() => navigate("/")}
    >
      <IoArrowBack size={32} className="text-orange-500 hover:scale-110 transition" />
    </div>

    {/* Card */}
    <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl
    rounded-2xl shadow-xl border border-orange-100 p-6 md:p-8">

      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-orange-100 p-4 rounded-full mb-4 shadow">
          <FaUtensils className="text-orange-500 w-12 h-12" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
          Edit Food Item
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Update your food details
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>

        {/* Name */}
        <div>
          <label className="text-sm text-gray-600">Food Name</label>
          <input
            type="text"
            placeholder="Pizza, Burger..."
            className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200
            bg-white/70 focus:ring-2 focus:ring-orange-400 outline-none"
            onChange={(e) => setName(e.target.value)}
            value={name || ""}
          />
        </div>

        {/* Image */}
        <div>
          <label className="text-sm text-gray-600">Food Image</label>
          <input
            type="file"
            accept="image/*"
            className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-200 bg-white/70"
            onChange={handleImage}
          />

          {frontendImage && (
            <img
              src={frontendImage}
              alt=""
              className="mt-4 w-full h-48 object-cover rounded-xl shadow-sm"
            />
          )}
        </div>

        {/* Price */}
        <div>
          <label className="text-sm text-gray-600">Price</label>
          <input
            type="number"
            placeholder="₹0"
            className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200
            bg-white/70 focus:ring-2 focus:ring-orange-400 outline-none"
            onChange={(e) => setPrice(Number(e.target.value))}
            value={price}
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm text-gray-600">Category</label>
          <select
            className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200
            bg-white/70 focus:ring-2 focus:ring-orange-400 outline-none"
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          >
            <option value="">Select Category</option>
            {categories.map((cate, index) => (
              <option value={cate} key={index}>
                {cate}
              </option>
            ))}
          </select>
        </div>

        {/* Food Type */}
        <div>
          <label className="text-sm text-gray-600">Food Type</label>
          <select
            className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200
            bg-white/70 focus:ring-2 focus:ring-orange-400 outline-none"
            onChange={(e) => setFoodType(e.target.value)}
            value={foodType}
          >
            <option value="veg">Veg</option>
            <option value="nonveg">Non-Veg</option>
          </select>
        </div>

        {/* Button */}
        <button
          disabled={loading}
          className="w-full mt-4 py-3 rounded-xl font-semibold text-white
          bg-linear-to-r from-orange-500 to-[#ff4d2d]
          shadow-lg hover:shadow-xl hover:scale-[1.02]
          transition-all duration-200"
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Update Food"}
        </button>

      </form>
    </div>
  </div>
);
};

export default EditItem;

