// import React, { useState } from "react";

// import { FaPhoneAlt } from "react-icons/fa";
// import api from "../api/axios";
// import { serverUrl } from "../App";
// import { updateOrderStatus } from "../redux/userSlice";
// import { useDispatch } from "react-redux";

// const OwnerOrderCard = ({ data }) => {
//   const [availableBoys, setAvailableBoys] = useState([]);
//   const dispatch = useDispatch();

//   // 🔒 Guard clause (prevents crash)
//   if (!data || !data.user || !data.shopOrders) return null;

//   const handleUpdateStatus = async (orderId, shopId, status) => {
//     if (!orderId || !shopId || !status) return;

//     try {
//       const result = await api.post(
//         `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
//         { status },
//         { withCredentials: true }
//       );

//       dispatch(updateOrderStatus({ orderId, shopId, status }));
//       setAvailableBoys(result.data?.availableBoys || []);
//     } catch (error) {
//       
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow p-4 space-y-4">
//       {/* USER INFO */}
//       <div>
//         <h2 className="text-lg font-semibold text-gray-800">
//           {data.user?.fullName}
//         </h2>

//         <p className="text-sm text-gray-500">{data.user?.email}</p>

//         <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
//           <FaPhoneAlt size={13} />
//           <span>{data.user?.mobile}</span>
//         </p>

//         {data.paymentMethod === "online" ? (
//           <p className="text-sm text-gray-600 mt-1">
//             Payment: {data.payment ? "Success" : "Failed"}
//           </p>
//         ) : (
//           <p className="text-sm text-gray-600 mt-1">
//             Payment Method: {data.paymentMethod}
//           </p>
//         )}
//       </div>

//       {/* ADDRESS */}
//       <div className="flex items-start gap-2 flex-col text-gray-600 text-sm">
//         <p className="font-bold">
//           {data?.deliveryAddress?.text}
//         </p>

//         <p className="text-xs text-gray-500">
//           Lat: {data?.deliveryAddress?.latitude}, Lon:{" "}
//           {data?.deliveryAddress?.longitude}
//         </p>
//       </div>

//       {/* ORDER ITEMS */}
//       <div className="flex space-x-4 overflow-x-auto pb-2">
//         {data.shopOrders.shopOrderItems?.map((item, index) => (
//           <div
//             key={index}
//             className="shrink-0 w-40 border rounded-lg p-2 bg-white"
//           >
//             <img
//               src={item?.item?.image}
//               alt={item?.name}
//               className="w-full h-24 object-cover rounded"
//             />

//             <p className="text-sm font-semibold mt-1">
//               {item?.name}
//             </p>

//             <p className="text-xs">
//               Qty: {item?.quantity} × ₨.{item?.price}
//             </p>

//             <p className="text-sm font-bold">
//               ₨.{item?.price * item?.quantity}
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* STATUS */}
//       <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
//         <span className="text-sm">
//           Status:{" "}
//           <span className="font-semibold capitalize text-[#ff4d2d]">
//             {data.shopOrders?.status}
//           </span>
//         </span>

//         {data.shopOrders?.status === "delivered" ? (
//           <span className="text-green-600 font-semibold text-sm">
//             ✅ Order Completed
//           </span>
//         ) : (
//           <select
//             className="rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 border-[#ff4d2d] text-[#ff4d2d]"
//             onChange={(e) =>
//               handleUpdateStatus(
//                 data?._id,
//                 data?.shopOrders?.shop?._id,
//                 e.target.value
//               )
//             }
//           >
//             <option value="">Change</option>
//             <option value="pending">Pending</option>
//             <option value="preparing">Preparing</option>
//             <option value="out of delivery">Out Of Delivery</option>
//           </select>
//         )}
//       </div>

//       {/* DELIVERY BOY INFO */}
//       {data.shopOrders?.status === "out of delivery" && (
//         <div className="mt-3 p-2 border rounded-lg text-sm bg-orange-50 gap-4">
//           {data.shopOrders?.assignedDeliveryBoy ? (
//             <p>Assigned Delivery Boys:</p>
//           ) : (
//             <p>Available Delivery Boys:</p>
//           )}

//           {availableBoys?.length > 0 ? (
//             availableBoys.map((b, index) => (
//               <div key={index} className="text-gray-600">
//                 {b?.fullName} - {b?.mobile}
//               </div>
//             ))
//           ) : data.shopOrders?.assignedDeliveryBoy ? (
//             <div>
//               {data.shopOrders.assignedDeliveryBoy?.fullName} -{" "}
//               {data.shopOrders.assignedDeliveryBoy?.mobile}
//             </div>
//           ) : (
//             <div>Waiting for delivery boy to accept order</div>
//           )}
//         </div>
//       )}

//       {/* TOTAL */}
//       <div className="text-right font-bold text-gray-800 text-sm">
//         Total: ₨.{data.shopOrders?.subtotal}
//       </div>
//     </div>
//   );
// };

// export default OwnerOrderCard;

import React, { useState } from "react";
import { FaPhoneAlt, FaStore, FaMotorcycle, FaCheckCircle, FaMoneyBillWave, FaRegCreditCard, FaWallet, FaMapMarkerAlt } from "react-icons/fa";
import api from "../api/axios";
import { serverUrl } from "../App";
import { updateOrderStatus } from "../redux/userSlice";
import { useDispatch } from "react-redux";

const OwnerOrderCard = ({ data }) => {
  const [availableBoys, setAvailableBoys] = useState([]);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const dispatch = useDispatch();

  // 🔒 Guard clause (prevents crash)
  if (!data || !data.user || !data.shopOrders) return null;

  const handleUpdateStatus = async (orderId, shopId, status) => {
    if (!orderId || !shopId || !status) return;

    try {
      const result = await api.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      );

      dispatch(updateOrderStatus({ orderId, shopId, status }));
      setAvailableBoys(result.data?.availableBoys || []);
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "cod":
      case "pay_at_restaurant":
        return { label: "Cash on Delivery", icon: <FaMoneyBillWave className="text-emerald-600" />, badge: "bg-emerald-50 text-emerald-700 border-emerald-100" };
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

  const paymentMeta = getPaymentMethodLabel(data.paymentMethod);

  // Status mapping colors
  const getStatusMeta = (statusStr) => {
    const s = statusStr?.toLowerCase();
    if (s === "delivered" || s === "collected") {
      return { bg: "bg-emerald-500", text: "text-emerald-500", lightBg: "bg-emerald-50", label: "Completed" };
    }
    if (s === "cancelled") {
      return { bg: "bg-rose-500", text: "text-rose-500", lightBg: "bg-rose-50", label: "Restaurant Cancelled" };
    }
    if (s === "preparing") {
      return { bg: "bg-amber-500", text: "text-amber-600", lightBg: "bg-amber-50", label: "Preparing" };
    }
    if (s === "out of delivery") {
      return { bg: "bg-blue-500", text: "text-blue-600", lightBg: "bg-blue-50", label: "Out For Delivery" };
    }
    return { bg: "bg-orange-500", text: "text-orange-600", lightBg: "bg-orange-50", label: "Pending" };
  };

  const currentStatus = data.shopOrders?.status || data.status;
  const statusMeta = getStatusMeta(currentStatus);

  // Self Pickup Completed validation
  const isCompletedPickup = 
    data.orderType === "selfPickup" &&
    data.otpVerified === true &&
    (currentStatus === "delivered" || currentStatus === "collected");

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-6 space-y-6">
      {/* HEADER SECTION: USER INFO & BADGES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-black text-gray-800 tracking-tight">
              {data.user?.fullName}
            </h2>
            {/* Order Type Badge */}
            {data.orderType === "selfPickup" ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                <FaStore size={10} />
                🏪 Self Pickup
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                <FaMotorcycle size={10} />
                🛵 Home Delivery
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 font-semibold">{data.user?.email}</p>
          <p className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
            <FaPhoneAlt size={11} className="text-gray-400" />
            <span>{data.user?.mobile}</span>
          </p>
        </div>

        <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-2">
          {/* Payment Method Badge */}
          <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${paymentMeta.badge}`}>
            {paymentMeta.icon}
            <span>{paymentMeta.label}</span>
          </div>

          <div className="text-xs text-gray-400 font-bold">
            ID: <span className="text-gray-600 font-black">#{data._id?.slice(-8).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* ADDRESS SECTION (Only for Delivery Orders) */}
      {data.orderType !== "selfPickup" && (
        <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex gap-3 items-start">
          <FaMapMarkerAlt className="text-gray-400 mt-1 shrink-0" size={16} />
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase font-black tracking-wider">Delivery Address</p>
            <p className="text-sm font-bold text-gray-700 leading-snug">
              {data?.deliveryAddress?.text}
            </p>
            {data?.deliveryAddress?.latitude && (
              <p className="text-[10px] text-gray-400 font-semibold">
                Lat: {data?.deliveryAddress?.latitude}, Lon: {data?.deliveryAddress?.longitude}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ORDER ITEMS PREVIEW */}
      <div className="space-y-3">
        <h4 className="text-xs text-gray-400 uppercase font-black tracking-wider">Order Items</h4>
        <div className="flex space-x-4 overflow-x-auto pb-3 scrollbar-thin">
          {data.shopOrders.shopOrderItems?.map((item, index) => (
            <div
              key={index}
              className="shrink-0 w-44 border border-gray-100 rounded-2xl p-3 bg-white hover:border-gray-200 transition-colors duration-200"
            >
              <img
                src={item?.item?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&fit=crop&q=60"}
                alt={item?.name}
                className="w-full h-24 object-cover rounded-xl shadow-xs"
              />
              <p className="text-sm font-black text-gray-800 mt-2 truncate">
                {item?.name}
              </p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400 font-bold">Qty: {item?.quantity}</span>
                <span className="text-xs font-black text-gray-700">₹{item?.price}</span>
              </div>
              <p className="text-sm font-extrabold text-gray-800 text-right mt-1 border-t border-gray-50 pt-1.5">
                ₹{item?.price * item?.quantity}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CANCELLED DETAILS BANNER */}
      {(data?.status === "cancelled" || data.shopOrders?.status === "cancelled") && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 space-y-3 animate-fadeIn">
          <p className="font-black flex items-center gap-2 text-rose-700 text-sm">
            <span>❌ Restaurant Cancelled</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600 font-bold">
            <div>
              <span className="text-gray-400 block uppercase text-[10px] tracking-wider">Order Type</span>
              <span className="capitalize text-gray-700">{data.orderType === "selfPickup" ? "Self Pickup" : "Home Delivery"}</span>
            </div>
            <div>
              <span className="text-gray-400 block uppercase text-[10px] tracking-wider">Cancellation Reason</span>
              <span className="text-gray-700">{data.cancelReasonType || "User Cancelled"} {data.cancelReason && data.cancelReason !== data.cancelReasonType ? `(${data.cancelReason})` : ""}</span>
            </div>
            <div>
              <span className="text-gray-400 block uppercase text-[10px] tracking-wider">Refund Status</span>
              <span className="text-emerald-700 font-black">
                {data.refundAmount > 0 ? `₹${data.refundAmount} Credited to Wallet` : "No refund (COD)"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block uppercase text-[10px] tracking-wider">Cancelled At</span>
              <span className="text-gray-700">{new Date(data.cancelledAt || Date.now()).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      )}

      {/* PART 1 - SELF PICKUP COMPLETED SUCCESS CARD */}
      {isCompletedPickup && (
        <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-5 space-y-4 shadow-xs animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-250">
              <FaStore size={11} />
              Self Pickup
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-black bg-emerald-600 text-white px-3 py-1 rounded-full border border-emerald-650">
              ✓ Completed
            </span>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-base font-black text-emerald-900 flex items-center gap-2">
              <FaCheckCircle size={16} />
              Self Pickup Completed
            </h3>
            <ul className="text-sm font-bold text-emerald-700 space-y-1 ml-1">
              <li className="flex items-center gap-2">✓ OTP Verified</li>
              <li className="flex items-center gap-2">✓ Payment Collected</li>
              <li className="flex items-center gap-2">✓ Order Collected Successfully</li>
            </ul>
          </div>

          <div className="border-t border-emerald-200/60 pt-3 flex flex-col gap-0.5">
            <span className="text-[10px] text-emerald-600/70 uppercase font-black tracking-wider">Collected Date & Time</span>
            <span className="text-sm font-black text-emerald-800">
              {new Date(data.deliveredAt || data.updatedAt || Date.now()).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
        </div>
      )}

      {/* SELF PICKUP ACTIVE VERIFICATION & PAYMENT FLOW */}
      {data.orderType === "selfPickup" && !isCompletedPickup && currentStatus !== "cancelled" && (
        <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Self Pickup Processing
            </span>
            <span className="text-xs font-bold text-amber-600">
              🏪 Collect at Restaurant
            </span>
          </div>

          {!data.otpVerified ? (
            <div className="space-y-3">
              <h4 className="text-sm font-black text-gray-800">Verify Customer OTP</h4>
              <p className="text-xs text-gray-500 font-semibold">Ask the customer for their 4-digit pickup OTP to verify order collection.</p>
              
              {otpError && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl font-bold">{otpError}</p>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setOtpError("");
                  }}
                  placeholder="Enter 4-Digit OTP"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-orange-500 transition-colors"
                  disabled={verifying}
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (otp.length !== 4) {
                      setOtpError("Enter valid 4-digit OTP code");
                      return;
                    }
                    try {
                      setVerifying(true);
                      setOtpError("");
                      await api.post(
                        `${serverUrl}/api/order/verify-otp-pickup`,
                        { orderId: data._id, otp },
                        { withCredentials: true }
                      );
                      setTimeout(() => {
                        window.location.reload();
                      }, 1200);
                    } catch (err) {
                      setOtpError(err?.response?.data?.message || "OTP verification failed.");
                    } finally {
                      setVerifying(false);
                    }
                  }}
                  className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-5 py-2.5 rounded-xl text-sm font-black transition disabled:opacity-50 shadow-xs active:scale-95 duration-150"
                  disabled={verifying}
                >
                  {verifying ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-3 border-t border-dashed border-amber-200">
              <span className="text-emerald-600 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full w-fit">
                ✓ OTP Verified successfully
              </span>

              {/* PAYMENT COLLECTION DETAILS */}
              <div className="bg-white border border-amber-100 rounded-xl p-4 text-xs space-y-2.5 font-bold text-gray-600">
                <h5 className="font-black text-gray-400 text-[10px] uppercase tracking-wider">Payment Collection Details</h5>
                
                {data.paymentMethod === "pickup_advance" ? (
                  <div className="space-y-1.5">
                    <p className="flex justify-between">
                      <span>20% Advance Paid Online:</span>
                      <span className="font-extrabold text-gray-800">₹{Math.round(data.shopOrders.subtotal * 0.2)}</span>
                    </p>
                    <p className="flex justify-between text-sm font-black border-t border-gray-50 pt-2 text-[#ff4d2d]">
                      <span>Collect Cash at Restaurant:</span>
                      <span>₹{Math.round(data.shopOrders.subtotal - Math.round(data.shopOrders.subtotal * 0.2))}</span>
                    </p>
                  </div>
                ) : data.paymentMethod === "pay_at_restaurant" ? (
                  <p className="flex justify-between text-sm font-black text-[#ff4d2d]">
                    <span>Collect Cash at Restaurant:</span>
                    <span>₹{data.shopOrders.subtotal}</span>
                  </p>
                ) : (
                  <p className="text-emerald-600 font-black text-xs">
                    Order Paid Fully Online/Wallet (₹0 to Collect)
                  </p>
                )}
              </div>

              {currentStatus !== "delivered" && currentStatus !== "collected" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(data._id, data.shopOrders.shop?._id, "delivered")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-sm transition-all shadow-xs active:scale-98"
                >
                  Mark as Collected & Completed
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* FOOTER & CONTROLS SECTION */}
      {currentStatus !== "cancelled" && (
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Status:</span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-0.5 rounded-full capitalize ${statusMeta.lightBg} ${statusMeta.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.bg} animate-pulse`}></span>
              {statusMeta.label}
            </span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            {/* Dropdown status update only for delivery OR non-completed pickups */}
            {(data.orderType !== "selfPickup" && currentStatus !== "delivered") && (
              <select
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-xs"
                value={currentStatus || ""}
                onChange={(e) =>
                  handleUpdateStatus(
                    data?._id,
                    data?.shopOrders?.shop?._id,
                    e.target.value
                  )
                }
              >
                <option value="" disabled>Change Status</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="out of delivery">Out Of Delivery</option>
              </select>
            )}

            {currentStatus === "delivered" && (
              <span className="text-emerald-600 font-black text-xs flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                ✓ Order Completed
              </span>
            )}
          </div>
        </div>
      )}

      {/* DELIVERY BOY ASSIGNMENT SECTION (Only for Delivery Orders) */}
      {data.orderType !== "selfPickup" && currentStatus === "out of delivery" && (
        <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 space-y-3 animate-fadeIn text-xs font-bold text-gray-600">
          <p className="font-black text-gray-800 uppercase tracking-wider text-[10px] text-gray-400">Rider Assignment Details</p>

          {data.shopOrders?.assignedDeliveryBoy ? (
            <div className="flex items-center justify-between bg-white border border-orange-100 rounded-xl p-3">
              <div>
                <p className="text-sm font-black text-gray-800">{data.shopOrders.assignedDeliveryBoy?.fullName}</p>
                <p className="text-xs text-gray-400 mt-0.5">Mobile: {data.shopOrders.assignedDeliveryBoy?.mobile}</p>
              </div>
              <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                Assigned
              </span>
            </div>
          ) : availableBoys?.length > 0 ? (
            <div className="space-y-2">
              <p className="text-amber-700">Waiting for local riders to accept assignment. Broadcasted to:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableBoys.map((b, index) => (
                  <div key={index} className="bg-white border border-gray-150 p-2.5 rounded-xl">
                    <p className="text-gray-800 font-extrabold">{b?.fullName}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">Mobile: {b?.mobile}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-100 p-3 rounded-xl">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>Waiting for local riders to accept the delivery request...</span>
            </div>
          )}
        </div>
      )}

      {/* BOTTOM TOTAL SUMMARY */}
      <div className="flex justify-between items-center border-t border-gray-50 pt-4 mt-2">
        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Subtotal:</span>
        <span className="text-lg font-black text-gray-800">
          ₹{data.shopOrders?.subtotal}
        </span>
      </div>
    </div>
  );
};

export default OwnerOrderCard;
