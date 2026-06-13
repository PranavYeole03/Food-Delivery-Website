// import React from "react";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api/axios";
// import { serverUrl } from "../App";
// const UserOrderCard = ({ data }) => {
//   const navigate = useNavigate();
//   const [selectedRating, setSelectedRating] = useState({}); //itemId:rating

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const handleRating = async (itemId, rating) => {
//     try {
//       const result = await api.post(
//         `${serverUrl}/api/item/rating-items`,
//         { itemId, rating },
//         { withCredentials: true },
//       );
//       setSelectedRating((prev) => ({ ...prev, [itemId]: rating }));
//     } catch (error) {
//       
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow p-4 space-y-4">
//       <div className="flex justify-between border-b pb-2">
//         {/* Left */}
//         <div>
//           <p className="font-semibold">order #{data._id.slice(-6)}</p>
//           <p className="text-sm text-gray-500">
//             Date:{formatDate(data.createdAt)}
//           </p>
//         </div>
//         {/* Right */}
//         <div className="text-right">
//           {data.paymentMethod == "cod" ? (
//             <p className="text-sm text-gray-500">
//               {data.paymentMethod?.toUpperCase()}
//             </p>
//           ) : (
//             <p className="text-sm text-gray-500 font-semibold">
//               Payment:{data.payment ? "Success" : "Failed"}
//             </p>
//           )}
//           <p className="font-medium text-blue-600">
//             {data.shopOrders?.[0].status}
//           </p>
//         </div>
//       </div>
//       {data.shopOrders.map((shopOrder, index) => (
//         <div
//           className="border rounded-lg p-3 bg-[#fffaf7] space-y-3"
//           key={index}
//         >
//           <p>{shopOrder.shop.name}</p>
//           <div className="flex space-x-4 overflow-x-auto pb-2">
//             {shopOrder.shopOrderItems.map((item, index) => (
//               <div
//                 key={index}
//                 className="shrink-0 w-40 border rounded-lg p-2 bg-white"
//               >
//                 <img
//                   src={item.item.image}
//                   alt=""
//                   className="w-full h-24 object-cover rounded"
//                 />
//                 <p className="text-sm font-semibold mt-1">{item.name}</p>
//                 <p className="text-xs">
//                   Qty:{item.quantity} x ₨.{item.price}
//                 </p>
//                 <p className="text-sm font-bold">
//                   ₨.{item.price * item.quantity}
//                 </p>

//                 {shopOrder.status == "delivered" && (
//                   <div className="flex space-x-1 mt-2">
//                     {[1, 2, 3, 4, 5].map((star) => (
//                       <button
//                         className={`text-lg ${selectedRating[item.item._id] >= star ? "text-yellow-400" : "text-gray-400"}`}
//                         onClick={() => handleRating(item.item._id, star)}
//                       >
//                         ☆
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//           <div className="flex justify-between items-center border-t pt-2">
//             <p className="font-semibold">SubTotal: ₨.{shopOrder.subtotal}</p>
//             <span className="text-sm font-medium text-blue-600">
//               {shopOrder.status}
//             </span>
//           </div>
//         </div>
//       ))}

//       <div className="flex justify-between items-center border-t pt-2">
//         <p className="font-semibold">Total: ₨.{data.totalAmount}</p>
//         <button
//           className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm"
//           onClick={() => navigate(`/track-order/${data._id}`)}
//         >
//           Track Order
//         </button>
//       </div>
//     </div>
//   );
// };
// export default UserOrderCard;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { serverUrl } from "../App";
import { motion, AnimatePresence } from "framer-motion";
import { FaStore, FaMotorcycle, FaWallet, FaCheckCircle, FaMoneyBillWave, FaRegCreditCard, FaClock, FaTimes, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/userSlice";

const UserOrderCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedRating, setSelectedRating] = useState({}); // itemId: rating
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [cancelReasonType, setCancelReasonType] = useState("Restaurant taking too long");
  const [customReason, setCustomReason] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleRating = async (itemId, rating) => {
    try {
      await api.post(
        `${serverUrl}/api/item/rating-items`,
        { itemId, rating },
        { withCredentials: true }
      );

      setSelectedRating((prev) => ({
        ...prev,
        [itemId]: rating,
      }));
    } catch (error) {
      console.error("Rating error:", error);
    }
  };

  /* 🔒 SAFETY FIX */
  const shopOrdersArray = Array.isArray(data?.shopOrders)
    ? data.shopOrders
    : [data?.shopOrders];

  const firstShopOrder = shopOrdersArray[0];
  const orderStatus = firstShopOrder?.status || data.status;

  const getPaymentMethodMeta = (method) => {
    switch (method) {
      case "cod":
      case "pay_at_restaurant":
        return { label: "COD", icon: <FaMoneyBillWave className="text-emerald-600" />, badge: "bg-emerald-50 text-emerald-700 border-emerald-100" };
      case "online":
      case "wallet_razorpay":
      case "pickup_advance":
      case "pickup_full":
        return { label: "Online Payment", icon: <FaRegCreditCard className="text-blue-600" />, badge: "bg-blue-50 text-blue-700 border-blue-100" };
      case "wallet":
        return { label: "Wallet Payment", icon: <FaWallet className="text-purple-600" />, badge: "bg-purple-50 text-purple-700 border-purple-100" };
      default:
        return { label: "Payment", icon: <FaRegCreditCard className="text-gray-600" />, badge: "bg-gray-50 text-gray-700 border-gray-100" };
    }
  };

  const paymentMeta = getPaymentMethodMeta(data.paymentMethod);

  // Status styling configurations
  const getStatusStyle = (statusStr) => {
    const s = statusStr?.toLowerCase();
    if (s === "delivered" || s === "collected") {
      return { bg: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500", label: s === "collected" ? "Collected" : "Delivered" };
    }
    if (s === "cancelled") {
      return { bg: "bg-rose-50 text-rose-700 border-rose-100", dot: "bg-rose-500", label: "Cancelled" };
    }
    if (s === "preparing") {
      return { bg: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-500", label: "Preparing" };
    }
    if (s === "out of delivery") {
      return { bg: "bg-blue-50 text-blue-700 border-blue-100", dot: "bg-blue-500", label: data.orderType === "selfPickup" ? "Ready for Pickup" : "Out for Delivery" };
    }
    return { bg: "bg-orange-50 text-orange-700 border-orange-100", dot: "bg-orange-500", label: "Placed" };
  };

  const statusStyle = getStatusStyle(orderStatus);

  // Timeline Step calculation
  const getTimelineSteps = () => {
    const isPickup = data.orderType === "selfPickup";
    const status = orderStatus?.toLowerCase();

    if (isPickup) {
      // Pickup Timeline: Placed ➔ Accepted ➔ Preparing ➔ Ready For Pickup ➔ Collected
      const steps = [
        { label: "Order Placed", desc: "We have received your order", active: false, completed: false },
        { label: "Accepted", desc: "Restaurant has approved your order", active: false, completed: false },
        { label: "Preparing", desc: "Your food is being cooked fresh", active: false, completed: false },
        { label: "Ready For Pickup", desc: "Head over to the restaurant to collect", active: false, completed: false },
        { label: "Collected", desc: "Order collected successfully", active: false, completed: false }
      ];

      steps[0].completed = true; // Placed is always completed

      if (status === "pending") {
        steps[0].active = true;
      } else if (status === "preparing") {
        steps[0].completed = true;
        steps[1].completed = true;
        steps[2].active = true;
      } else if (status === "out of delivery") {
        steps[0].completed = true;
        steps[1].completed = true;
        steps[2].completed = true;
        steps[3].active = true;
      } else if (status === "delivered" || status === "collected" || data.otpVerified) {
        steps[0].completed = true;
        steps[1].completed = true;
        steps[2].completed = true;
        steps[3].completed = true;
        steps[4].completed = true;
        steps[4].active = true;
      } else {
        // Fallback for preparing or placing stage
        steps[1].active = true;
      }
      return steps;
    } else {
      // Home Delivery Timeline: Placed ➔ Accepted ➔ Preparing ➔ Out For Delivery ➔ Delivered
      const steps = [
        { label: "Order Placed", desc: "Order placed successfully", active: false, completed: false },
        { label: "Accepted", desc: "Restaurant accepted your order", active: false, completed: false },
        { label: "Preparing", desc: "Chef is cooking your delicious meal", active: false, completed: false },
        { label: "Out For Delivery", desc: "Rider is heading to your location", active: false, completed: false },
        { label: "Delivered", desc: "Order delivered! Enjoy your food", active: false, completed: false }
      ];

      steps[0].completed = true;

      if (status === "pending") {
        steps[0].active = true;
      } else if (status === "preparing") {
        steps[0].completed = true;
        steps[1].completed = true;
        steps[2].active = true;
      } else if (status === "out of delivery") {
        steps[0].completed = true;
        steps[1].completed = true;
        steps[2].completed = true;
        steps[3].active = true;
      } else if (status === "delivered") {
        steps[0].completed = true;
        steps[1].completed = true;
        steps[2].completed = true;
        steps[3].completed = true;
        steps[4].completed = true;
        steps[4].active = true;
      } else {
        steps[1].active = true;
      }
      return steps;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 p-6 space-y-6">
      
      {/* SECTION 1: HEADER (REST IMAGE, NAME, ORDER ID, DATE, TYPE BADGES) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-50 pb-5">
        <div className="flex gap-4 items-center">
          <img
            src={firstShopOrder?.shop?.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&fit=crop&q=60"}
            alt={firstShopOrder?.shop?.name || "Restaurant"}
            className="w-14 h-14 object-cover rounded-2xl border border-gray-50 shadow-xs shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-gray-800 tracking-tight hover:text-orange-500 cursor-pointer transition-colors"
                  onClick={() => navigate(`/shop-items/${firstShopOrder?.shop?._id || firstShopOrder?.shop}`)}>
                {firstShopOrder?.shop?.name || "Restaurant"}
              </h3>
              
              {/* Order Type Badge */}
              {data.orderType === "selfPickup" ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <FaStore size={9} />
                  Self Pickup
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <FaMotorcycle size={9} />
                  Home Delivery
                </span>
              )}
            </div>
            
            <p className="text-xs text-gray-400 font-semibold mt-0.5">
              Order #{data?._id?.slice(-8).toUpperCase()} • {formatDate(data?.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-2">
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full border ${statusStyle.bg}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot} animate-pulse`}></span>
            {statusStyle.label}
          </span>
          
          {/* Payment Badge */}
          <span className={`inline-flex items-center gap-1 text-[10px] font-black border px-2.5 py-0.5 rounded-full ${paymentMeta.badge}`}>
            {paymentMeta.icon}
            {paymentMeta.label}
          </span>
        </div>
      </div>

      {/* SECTION 2: ITEMS PREVIEW CAROUSEL */}
      <div className="space-y-2">
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin">
          {shopOrdersArray.map((shopOrder) => 
            shopOrder?.shopOrderItems?.map((item, i) => (
              <div
                key={`${shopOrder._id}-${i}`}
                className="shrink-0 w-44 border border-gray-50 rounded-2xl p-3 bg-gray-50/20 hover:bg-white hover:border-gray-150 transition-all duration-200"
              >
                <img
                  src={item?.item?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&fit=crop&q=60"}
                  alt={item?.name}
                  className="w-full h-24 object-cover rounded-xl shadow-xs"
                />
                
                <p className="text-sm font-black text-gray-800 mt-2 truncate">
                  {item?.name}
                </p>
                
                <div className="flex justify-between items-center mt-1 text-xs text-gray-400 font-bold">
                  <span>Qty: {item?.quantity}</span>
                  <span className="text-gray-700 font-extrabold">₹{item?.price}</span>
                </div>

                <p className="text-sm font-black text-gray-800 text-right mt-1.5 border-t border-gray-100/60 pt-1.5">
                  ₹{item?.price * item?.quantity}
                </p>

                {/* ⭐ ITEM RATING */}
                {shopOrder?.status === "delivered" && (
                  <div className="flex items-center justify-center gap-1.5 mt-2 bg-amber-50/50 border border-amber-100 rounded-lg py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`text-sm transition-transform active:scale-125 ${
                          selectedRating[item?.item?._id] >= star
                            ? "text-amber-400"
                            : "text-gray-300 hover:text-amber-300"
                        }`}
                        onClick={() => handleRating(item?.item?._id, star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 3: WALLET REFUND BANNER */}
      {data?.refundAmount > 0 && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 text-indigo-700 font-bold text-xs animate-fadeIn">
          <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
            <FaWallet size={16} className="animate-bounce" />
          </div>
          <div>
            <p className="font-black text-indigo-800 text-sm">Refund Added To Wallet</p>
            <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
              ₹{data.refundAmount} Credited Instantly
            </p>
          </div>
        </div>
      )}

      {/* SECTION 4: CANCELLED DETAILS INFO */}
      {(data?.status === "cancelled" || shopOrdersArray.some(so => so.status === "cancelled")) && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs font-bold text-gray-500 space-y-2 animate-fadeIn">
          <p className="font-black text-rose-700 flex items-center gap-1.5 text-sm">
            <span>❌ Order Cancelled</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
            <p>Reason: <span className="font-extrabold text-gray-800">{data.cancelReasonType} {data.cancelReason && data.cancelReason !== data.cancelReasonType ? `(${data.cancelReason})` : ""}</span></p>
            <p>Refund: <span className="text-emerald-700 font-extrabold">{data.refundAmount > 0 ? `₹${data.refundAmount} refunded` : "No payment collected"}</span></p>
            <p className="sm:col-span-2 text-[10px] text-gray-400 font-semibold">Cancelled At: {new Date(data.cancelledAt || Date.now()).toLocaleString("en-IN")}</p>
          </div>
        </div>
      )}

      {/* SECTION 5: TOTAL & ACTIONS BUTTONS */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-4 border-t border-gray-50">
        <div className="flex justify-between sm:block">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Total Amount Paid</span>
          <span className="text-lg font-black text-gray-800">
            ₹{data?.totalAmount}
          </span>
        </div>

        <div className="flex items-center gap-2.5 justify-end">
          {/* View Details Button */}
          <button
            type="button"
            className="flex-1 sm:flex-none bg-gray-50 hover:bg-gray-100 text-gray-700 font-black px-4 py-2.5 rounded-xl text-xs border border-gray-150 transition active:scale-95 duration-100"
            onClick={() => setShowDetailsModal(true)}
          >
            View Details
          </button>

          {/* Cancellation Trigger Button */}
          {data?.cancellationAllowedUntil && 
           new Date(data.cancellationAllowedUntil) > currentTime && 
           orderStatus?.toLowerCase() !== "cancelled" && 
           orderStatus?.toLowerCase() !== "out of delivery" &&
           orderStatus?.toLowerCase() !== "delivered" &&
           orderStatus?.toLowerCase() !== "collected" &&
           !shopOrdersArray.some(so => ["cancelled", "out of delivery", "delivered", "collected"].includes(so.status?.toLowerCase())) && (
            <button
              type="button"
              className="flex-1 sm:flex-none bg-rose-50 hover:bg-rose-100 text-rose-600 font-black px-4 py-2.5 rounded-xl text-xs border border-rose-100 transition active:scale-95 duration-100"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Order
            </button>
          )}

          {/* Reorder Action buttons */}
          {["delivered", "collected"].includes(orderStatus?.toLowerCase()) && (
            <div className="flex gap-2.5 items-center flex-wrap">
              {/* Reorder Items Button */}
              <button
                type="button"
                className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-xs transition active:scale-95 duration-100"
                onClick={() => {
                  shopOrdersArray.forEach((shopOrder) => {
                    shopOrder?.shopOrderItems?.forEach((item) => {
                      dispatch(
                        addToCart({
                          id: item.item?._id || item.item,
                          name: item.name,
                          price: item.price,
                          image: item.item?.image || "",
                          shop: shopOrder.shop?._id || shopOrder.shop,
                          quantity: item.quantity,
                          foodType: item.item?.foodType || "veg",
                        })
                      );
                    });
                  });
                  navigate("/cart");
                }}
              >
                Reorder Items
              </button>

              {/* See More Items Button */}
              <button
                type="button"
                className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 font-black px-4 py-2.5 rounded-xl text-xs border border-gray-150 transition active:scale-95 duration-100"
                onClick={() => navigate(`/shop-items/${firstShopOrder?.shop?._id || firstShopOrder?.shop}`)}
              >
                See More Items
              </button>
            </div>
          )}

          {/* Track Order Button */}
          {(data?.status?.toLowerCase() === "out of delivery" || 
            shopOrdersArray.some(so => so.status?.toLowerCase() === "out of delivery")) && (
            <button
              type="button"
              className="flex-1 sm:flex-none bg-[#ff4d2d] hover:bg-[#e64526] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-xs transition active:scale-95 duration-100"
              onClick={() => navigate(`/track-order/${data?._id}`)}
            >
              Track Order
            </button>
          )}
        </div>
      </div>

      {/* ================= DETAILED TIMELINE MODAL (PART 3) ================= */}
      <AnimatePresence>
        {showDetailsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-6"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <div>
                  <h3 className="text-base font-black text-gray-800 tracking-tight flex items-center gap-1.5">
                    Order Details
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                    Order ID: #{data._id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-gray-50 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition duration-150"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Order Timeline step tracker */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Tracking Timeline</h4>
                
                <div className="relative pl-7 space-y-6">
                  {/* Visual Connector Line */}
                  <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 bg-gray-200">
                    <div 
                      className="w-full bg-emerald-500 transition-all duration-500"
                      style={{ 
                        height: `${Math.max(0, (getTimelineSteps().filter(s => s.completed).length - 1) / (getTimelineSteps().length - 1)) * 100}%` 
                      }}
                    ></div>
                  </div>

                  {getTimelineSteps().map((step, idx) => (
                    <div key={idx} className="relative flex flex-col gap-0.5">
                      {/* Milestone Dot Indicator */}
                      <span className={`absolute -left-[23px] top-0.5 h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
                        step.completed 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : step.active 
                            ? "bg-white border-amber-500 text-amber-500 animate-pulse" 
                            : "bg-white border-gray-200 text-gray-300"
                      }`}>
                        {step.completed && <span className="text-[8px] font-black">✓</span>}
                        {step.active && <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>}
                      </span>

                      <span className={`text-xs font-black tracking-tight ${
                        step.completed ? "text-gray-800" : step.active ? "text-amber-600 font-black" : "text-gray-400"
                      }`}>
                        {step.label}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold leading-normal">
                        {step.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items in Details Modal */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Order Summary</h4>
                <div className="border border-gray-100 rounded-2xl p-4 bg-white divide-y divide-gray-50">
                  {shopOrdersArray.map((shopOrder) =>
                    shopOrder?.shopOrderItems?.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between items-center text-xs font-bold text-gray-700">
                        <div>
                          <p className="font-black text-gray-800">{item.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <span className="font-extrabold text-gray-800">₹{item.price * item.quantity}</span>
                      </div>
                    ))
                  )}

                  {/* Subtotal & Delivery details */}
                  <div className="pt-3 mt-1 space-y-1.5 text-xs font-bold text-gray-500">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="text-gray-800">₹{firstShopOrder?.subtotal}</span>
                    </div>
                    {data.orderType === "delivery" ? (
                      <div className="flex justify-between">
                        <span>Delivery Fee:</span>
                        <span className="text-emerald-600 font-extrabold">FREE</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-amber-600">
                        <span>Delivery Fee:</span>
                        <span>🏪 Self Pickup</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-gray-800 pt-2 border-t border-gray-50">
                      <span>Total Paid:</span>
                      <span>₹{data.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal footer close */}
              <button
                type="button"
                className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-2xl text-xs font-black transition duration-150"
                onClick={() => setShowDetailsModal(false)}
              >
                Close Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= CANCELLATION MODAL ================= */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#f0f0f0]">
            <h3 className="text-lg font-black text-gray-800">Why are you cancelling this order?</h3>
            
            {cancelError && (
              <p className="text-xs text-red-600 bg-red-50 border-l-4 border-red-500 px-3 py-2 rounded font-semibold">{cancelError}</p>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (cancelReasonType === "Other" && !customReason.trim()) {
                setCancelError("Please specify your reason.");
                return;
              }
              try {
                setSubmittingCancel(true);
                setCancelError("");
                await api.post(
                  `${serverUrl}/api/order/cancel`,
                  {
                    orderId: data._id,
                    cancelReasonType,
                    cancelReason: cancelReasonType === "Other" ? customReason : cancelReasonType,
                  },
                  { withCredentials: true }
                );
                setShowCancelModal(false);
                setTimeout(() => {
                  window.location.reload();
                }, 1200);
              } catch (err) {
                setCancelError(err?.response?.data?.message || "Failed to cancel order.");
              } finally {
                setSubmittingCancel(false);
              }
            }} className="space-y-4">
              <div className="space-y-2">
                {[
                  "Restaurant taking too long",
                  "Ordered by mistake",
                  "Found better option",
                  "Changed my mind",
                  "Need different items",
                  "Other"
                ].map((option) => (
                  <label key={option} className="flex items-center gap-3 text-sm text-gray-700 font-medium cursor-pointer p-2.5 rounded-xl hover:bg-gray-50 transition">
                    <input
                      type="radio"
                      name="cancelReason"
                      value={option}
                      checked={cancelReasonType === option}
                      onChange={(e) => {
                        setCancelReasonType(e.target.value);
                        setCancelError("");
                      }}
                      className="text-[#ff4d2d] focus:ring-[#ff4d2d] h-4 w-4 border-gray-300"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>

              {cancelReasonType === "Other" && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please enter your reason here..."
                  rows={3}
                  className="w-full border rounded-xl p-3 text-sm outline-none focus:border-[#ff4d2d] resize-none"
                  required
                />
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition"
                  disabled={submittingCancel}
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-500 text-white rounded-xl text-sm font-black hover:bg-red-600 transition disabled:opacity-50"
                  disabled={submittingCancel}
                >
                  {submittingCancel ? "Cancelling..." : "Confirm Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrderCard;
