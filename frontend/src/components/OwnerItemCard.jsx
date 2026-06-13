import api from "../api/axios";
import React from "react";
import { FaPen } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setmyShopData } from "../redux/ownerSlice";
import { optimizeCloudinaryUrl } from "../utils/cloudinary";

const OwnerItemCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDelete = async () => {
    try {
      const result = await api.get(
        `${serverUrl}/api/item/delete/${data._id}`,
        { withCredentials: true },
      );
      dispatch(setmyShopData(result.data));
    } catch (error) {
      
    }
  };

  return (
    <div
      className="group relative flex bg-white/80 backdrop-blur
             rounded-2xl border border-orange-200/60
             w-full max-w-2xl overflow-hidden
             shadow-sm hover:shadow-xl
             transition-all duration-300 hover:-translate-y-1"
    >
      {/* IMAGE */}
      <div className="relative w-32 sm:w-40 shrink-0 overflow-hidden">
        <img
          src={optimizeCloudinaryUrl(data.image, 300)}
          alt={data.name}
          loading="lazy"
          className="w-full h-full object-cover
                 group-hover:scale-110 transition duration-500"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
      </div>

      {/* CONTENT */}
      <div className="flex flex-col justify-between p-4 flex-1">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
            {data.name}
          </h2>

          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-600">
              {data.category}
            </span>

            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
              {data.foodType}
            </span>
          </div>
        </div>

        {/* PRICE + ACTIONS */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-xl font-bold text-[#ff4d2d]">₨.{data.price}</div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/owner/edit-items/${data._id}`)}
              className="h-9 w-9 rounded-full bg-orange-50 text-[#ff4d2d]
                     hover:bg-[#ff4d2d] hover:text-white
                     flex items-center justify-center
                     transition"
            >
              <FaPen size={14} />
            </button>

            <button
              onClick={handleDelete}
              className="h-9 w-9 rounded-full bg-red-50 text-red-500
                     hover:bg-red-500 hover:text-white
                     flex items-center justify-center
                     transition"
            >
              <MdDelete size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerItemCard;

