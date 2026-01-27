// import axios from "axios";
// import React from "react";
// import { FaPen } from "react-icons/fa";
// import { MdDelete } from "react-icons/md";
// import { useNavigate } from "react-router-dom";
// import { serverUrl } from "../App";
// import { useDispatch } from "react-redux";
// import { setmyShopData } from "../redux/ownerSlice";

// const OwnerItemCard = ({ data }) => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const handleDelete = async () => {
//     try {
//       const result = await axios.get(
//         `${serverUrl}/api/item/delete/${data._id}`,
//         { withCredentials: true }
//       );
//       dispatch(setmyShopData(result.data));
//     } catch (error) {
//       console.log(error);
//     }
//   };
//   return (
//     <div
//       className="flex bg-white rounded-lg shadow-md overflow-hidden border border-orange-200 w-full max-w-2xl"
//     >
//       <div className="w-36 shrink-0 bg-gray-50">
//         <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
//       </div>
//       <div className="flex flex-col justify-between p-3 flex-1">
//         <div>
//           <h2 className="text-base font-semibold text-[#ff4d2d]">
//             {data.name}
//           </h2>
//           <p>
//             <span className="font-medium text-gray-700">Category:</span>
//             {data.category}
//           </p>
//           <p>
//             <span className="font-medium text-gray-700">Food Type:</span>
//             {data.foodType}
//           </p>
//         </div>
//         <div className="flex items-center justify-between">
//           <div className="text-[#ff4d2d] font-bold">₨.{data.price}</div>
//           <div className="flex items-center gap-2">
//             <div
//               className="p-2 cursor-pointer rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d]"
//               onClick={() => navigate(`/edit-items/${data._id}`)}
//             >
//               <FaPen size={18} />
//             </div>
//             <div
//               className="p-2 cursor-pointer rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d]"
//               onClick={handleDelete}
//             >
//               <MdDelete size={18} />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OwnerItemCard;

import axios from "axios";
import React from "react";
import { FaPen } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setmyShopData } from "../redux/ownerSlice";

const OwnerItemCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDelete = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/delete/${data._id}`,
        { withCredentials: true }
      );
      dispatch(setmyShopData(result.data));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="flex bg-white rounded-xl shadow-md border border-orange-200 
                 w-full max-w-2xl overflow-hidden
                 hover:shadow-lg transition-shadow duration-300"
    >
      {/* IMAGE */}
      <div className="w-32 sm:w-36 shrink-0 overflow-hidden bg-gray-50">
        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover
                     transition-transform duration-300 ease-in-out
                     hover:scale-110"
        />
      </div>

      {/* CONTENT */}
      <div className="flex flex-col justify-between p-3 sm:p-4 flex-1">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-semibold text-[#ff4d2d]">
            {data.name}
          </h2>

          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">Category:</span>{" "}
            {data.category}
          </p>

          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">Food Type:</span>{" "}
            {data.foodType}
          </p>
        </div>

        {/* PRICE + ACTIONS */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-[#ff4d2d] font-bold text-base sm:text-lg">
            ₨.{data.price}
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-full text-[#ff4d2d]
                         hover:bg-[#ff4d2d]/10 transition"
              onClick={() => navigate(`/edit-items/${data._id}`)}
            >
              <FaPen size={18} />
            </button>

            <button
              className="p-2 rounded-full text-[#ff4d2d]
                         hover:bg-[#ff4d2d]/10 transition"
              onClick={handleDelete}
            >
              <MdDelete size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerItemCard;
