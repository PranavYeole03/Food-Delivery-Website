// import React, { useState } from "react";
// import Nav from "./Nav";
// import { useSelector } from "react-redux";
// import axios from "axios";
// import { serverUrl } from "../App";
// import { useEffect } from "react";
// import noOrders from "../assets/No order.png";
// import DeliveryBoyTracking from "./DeliveryBoyTracking";
// import { ClipLoader } from "react-spinners";
// import { CiCircleChevUp, CiCircleChevDown } from "react-icons/ci";
// import { useNavigate } from "react-router-dom";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import Footer from "./Footer";

// const DeliveryBoy = () => {
//   const navigate = useNavigate();

//   const { userData, socket } = useSelector((state) => state.user);
//   const [currentOrder, setCurrentOrder] = useState();
//   const [showOtpBox, setShowOtpBox] = useState(false);
//   const [availableAssignment, setAvailableAssignment] = useState([]);
//   const [otp, setOtp] = useState("");
//   const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
//   const [todayDeliveries, setTodayDeliveries] = useState([]);
//   const [showTodayStats, setShowTodayStats] = useState(true);
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!socket || userData.role !== "deliveryBoy") return;

//     let watchId;
//     if (navigator.geolocation) {
//       ((watchId = navigator.geolocation.watchPosition((position) => {
//         const latitude = position.coords.latitude;
//         const longitude = position.coords.longitude;
//         setDeliveryBoyLocation({ lat: latitude, lon: longitude });
//         socket.emit("updateLocation", {
//           latitude,
//           longitude,
//           userId: userData._id,
//         });
//       })),
//         (error) => {
//           console.log(error);
//         },
//         {
//           enableHighAccurancy: true,
//         });
//       return () => {
//         if (watchId) navigator.geolocation.clearWatch(watchId);
//       };
//     }
//   }, [socket, userData]);

//   const ratePerDelivery = 50;
//   const totalEarning = todayDeliveries.reduce(
//     (sum, d) => sum + d.count * ratePerDelivery,
//     0,
//   );

//   const getAssignment = async () => {
//     try {
//       const result = await axios.get(`${serverUrl}/api/order/get-assignments`, {
//         withCredentials: true,
//       });
//       setAvailableAssignment(result.data);
//       // console.log(result.data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const getCurrentOrder = async () => {
//     try {
//       const result = await axios.get(
//         `${serverUrl}/api/order/get-current-order`,
//         {
//           withCredentials: true,
//         },
//       );
//       setCurrentOrder(result.data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const acceptOrder = async (assignmentId) => {
//     try {
//       const result = await axios.get(
//         `${serverUrl}/api/order/accept-order/${assignmentId}`,
//         {
//           withCredentials: true,
//         },
//       );
//       console.log(result.data);
//       await getCurrentOrder();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const sendOtp = async () => {
//     setLoading(true);
//     try {
//       const result = await axios.post(
//         `${serverUrl}/api/order/send-delivery-otp`,
//         { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id },
//         {
//           withCredentials: true,
//         },
//       );
//       setLoading(false);
//       setShowOtpBox(true);
//       console.log(result.data);
//     } catch (error) {
//       console.log(error);
//       setLoading(false);
//     }
//   };

//   const verifyOtp = async () => {
//     setLoading(true);
//     setMessage("");
//     try {
//       const result = await axios.post(
//         `${serverUrl}/api/order/verify-otp-delivery`,
//         {
//           orderId: currentOrder._id,
//           shopOrderId: currentOrder.shopOrder._id,
//           otp,
//         },
//         { withCredentials: true },
//       );
//       console.log(result.data);
//       setMessage(result.data.message);
//       location.reload();
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handletodayDeliveries = async () => {
//     try {
//       const result = await axios.get(
//         `${serverUrl}/api/order/get-today-deliveries`,
//         { withCredentials: true },
//       );
//       console.log(result.data);
//       setTodayDeliveries(result.data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     socket?.on("newAssignment", (data) => {
//       if (data.sentTo == userData._id) {
//         setAvailableAssignment((prev) => [...prev, data]);
//       }
//     });
//     return () => {
//       socket?.off("newAssignment");
//     };
//   }, [socket]);

//   useEffect(() => {
//     getAssignment();
//     getCurrentOrder();
//     handletodayDeliveries();
//   }, [userData]);
//   return (
//     <div className="w-full min-h-screen bg-white flex flex-col items-center">
//       <Nav />
//       <div className="w-full max-w-200 flex flex-col gap-5 items-center">
//         <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100 text-center gap-2">
//           <h1 className="text-xl font-bold text-red-500">
//             Welcome, {userData.fullName}
//           </h1>
//           <p className="text-[#ff4d2d]">
//             <span className="font-semibold">Latitude:</span>
//             {deliveryBoyLocation?.lat},
//             <span className="font-semibold">Longitude:</span>
//             {deliveryBoyLocation?.lon}
//           </p>
//         </div>
//         <div className="w-[90%]">
//           <div className="flex items-center mb-3">
//             <h1 className="text-lg font-bold text-[#ff4d2d]">
//               Today Deliveries
//             </h1>
//             <button
//               onClick={() => setShowTodayStats((p) => !p)}
//               className="ml-auto text-[#ff4d2d]"
//             >
//               {showTodayStats ? (
//                 <CiCircleChevUp size={24} />
//               ) : (
//                 <CiCircleChevDown size={24} />
//               )}
//             </button>
//           </div>

//           {showTodayStats && (
//             <>
//               <ResponsiveContainer width="100%" height={200}>
//                 <BarChart data={todayDeliveries}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
//                   <YAxis allowDecimals={false} />
//                   <Tooltip
//                     formatter={(value) => [value, "orders"]}
//                     labelFormatter={(label) => `${label}:00`}
//                   />
//                   <Bar dataKey="count" fill="blue" />
//                 </BarChart>
//               </ResponsiveContainer>

//               <div className="max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-center">
//                 <h1 className="text-xl font-semibold text-gray-800 mb-2">
//                   Today's Earning
//                 </h1>
//                 <span className="text-3xl font-bold text-green-600">
//                   ₹{totalEarning}
//                 </span>
//               </div>
//             </>
//           )}
//         </div>

//         {!currentOrder && (
//           <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
//             <h1 className="text-lg font-bold mb-4 flex items-center gap-2">
//               Available Order
//             </h1>

//             <div className="space-y-4">
//               {availableAssignment?.length > 0 ? (
//                 availableAssignment.map((a, index) => (
//                   <div
//                     key={index}
//                     className="border rounded-lg p-4 flex justify-between items-center gap-3 bg-blue-50"
//                   >
//                     <div>
//                       <p className="text-sm font-semibold md:flex-1">
//                         {a?.shopName}
//                       </p>

//                       <p className="text-sm text-gray-500">
//                         <span className="font-semibold">Delivery Address:</span>
//                         {a?.deliveryAddress?.text}
//                       </p>

//                       <p className="text-sm font-semibold text-orange-600 ">
//                         {a?.items.length} items · ₨.{a?.subtotal}
//                       </p>
//                     </div>
//                     <button
//                       className="bg-orange-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-orange-600"
//                       onClick={() => acceptOrder(a.assignmentId)}
//                     >
//                       Accept
//                     </button>
//                   </div>
//                 ))
//               ) : (
//                 <div className="flex flex-col items-center justify-center w-full min-h-80 bg-white rounded-xl">
//                   <img
//                     src={noOrders}
//                     alt="noOrders"
//                     className="w-68 h-68 max-w-full mb-4 "
//                   />
//                   {/* <p className="text-gray-500 text-sm">
//                     No orders available right now
//                   </p> */}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {currentOrder && (
//           <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
//             <h2 className="text-lg font-bold mb-3">📦Current Order</h2>
//             <div className="border rounded-lg p-4 mb-3">
//               <p className="font-semibold text-sm">
//                 {currentOrder?.shopOrder.shop.name}
//               </p>
//               <p className="text-sm text-gray-500">
//                 {currentOrder.deliveryAddress.text}
//               </p>
//               <p className="text-sm font-semibold text-orange-600 ">
//                 {currentOrder.shopOrder.shopOrderItems.length} items · ₨.
//                 {currentOrder.shopOrder.subtotal}
//               </p>
//             </div>
//             <DeliveryBoyTracking
//               data={{
//                 deliveryBoyLocation: deliveryBoyLocation || {
//                   lat: userData.location.coordinates[1],
//                   lon: userData.location.coordinates[0],
//                 },
//                 customerLocation: {
//                   lat: currentOrder.deliveryAddress.latitude,
//                   lon: currentOrder.deliveryAddress.longitude,
//                 },
//               }}
//             />
//             {!showOtpBox ? (
//               <button
//                 className="mt-4 w-full bg-green-400 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-500 active:scale-95 transition-all duration-200 "
//                 onClick={sendOtp}
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <ClipLoader size={20} color="white" />
//                 ) : (
//                   "Mark as Delivered"
//                 )}
//               </button>
//             ) : (
//               <div className="mt-4 p-4 border rounded-xl bg-gray-50">
//                 <p className="text-sm font-semibold mb-2">
//                   Enter OTP send to:
//                   <span className="text-orange-400">
//                     {currentOrder.user.fullName}
//                   </span>
//                 </p>
//                 <input
//                   type="text"
//                   placeholder="Enter OTP"
//                   className="w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
//                   maxLength={6}
//                   onChange={(e) => setOtp(e.target.value)}
//                   value={otp}
//                   disabled={loading}
//                 />
//                 {message && (
//                   <p className="text-center text-green-400 text-2xl mb-4">
//                     {message}
//                   </p>
//                 )}
//                 <button
//                   className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all "
//                   onClick={verifyOtp}
//                 >
//                   {loading ? <ClipLoader size={20} color="white" /> : "Submit"}
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default DeliveryBoy;

import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import noOrders from "../assets/No order.png";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { ClipLoader } from "react-spinners";
import { CiCircleChevUp, CiCircleChevDown } from "react-icons/ci";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Footer from "./Footer";

const DeliveryBoy = () => {
  const { userData, socket } = useSelector((state) => state.user);

  const [currentOrder, setCurrentOrder] = useState();
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [availableAssignment, setAvailableAssignment] = useState([]);
  const [otp, setOtp] = useState("");
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [showTodayStats, setShowTodayStats] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= LOCATION ================= */
  useEffect(() => {
    if (!socket || userData.role !== "deliveryBoy") return;

    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setDeliveryBoyLocation({ lat: latitude, lon: longitude });
          socket.emit("updateLocation", {
            latitude,
            longitude,
            userId: userData._id,
          });
        },
        console.log,
        { enableHighAccuracy: true },
      );
      return () => watchId && navigator.geolocation.clearWatch(watchId);
    }
  }, [socket, userData]);

  /* ================= DATA ================= */
  const ratePerDelivery = 50;
  const totalEarning = todayDeliveries.reduce(
    (sum, d) => sum + d.count * ratePerDelivery,
    0,
  );

  const getAssignment = async () => {
    const res = await axios.get(`${serverUrl}/api/order/get-assignments`, {
      withCredentials: true,
    });
    setAvailableAssignment(res.data);
  };

  const getCurrentOrder = async () => {
    const res = await axios.get(`${serverUrl}/api/order/get-current-order`, {
      withCredentials: true,
    });
    setCurrentOrder(res.data);
  };

  const acceptOrder = async (id) => {
    await axios.get(`${serverUrl}/api/order/accept-order/${id}`, {
      withCredentials: true,
    });
    getCurrentOrder();
  };

  const sendOtp = async () => {
    setLoading(true);
    await axios.post(
      `${serverUrl}/api/order/send-delivery-otp`,
      {
        orderId: currentOrder._id,
        shopOrderId: currentOrder.shopOrder._id,
      },
      { withCredentials: true },
    );
    setShowOtpBox(true);
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
    const res = await axios.post(
      `${serverUrl}/api/order/verify-otp-delivery`,
      {
        orderId: currentOrder._id,
        shopOrderId: currentOrder.shopOrder._id,
        otp,
      },
      { withCredentials: true },
    );
    setMessage(res.data.message);
    setLoading(false);
    location.reload();
  };

  const getTodayDeliveries = async () => {
    const res = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, {
      withCredentials: true,
    });
    setTodayDeliveries(res.data);
  };

  useEffect(() => {
    getAssignment();
    getCurrentOrder();
    getTodayDeliveries();
  }, [userData]);

  /* ================= UI ================= */
  return (
    <div className="w-full min-h-screen bg-[#fdfdfd] flex flex-col">
      <Nav />

      {/* PAGE CONTENT */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-3 py-4">
        <div className="bg-white rounded-2xl shadow-md p-5 w-full border border-orange-100 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-center sm:text-left">
            {/* LEFT: WELCOME TEXT */}
            <div>
              <div className="text-xl font-bold text-red-500">
                Welcome, {userData.fullName}
              </div>
            </div>

            {/* RIGHT: LOCATION */}
            <div className="text-sm text-[#ff4d2d] font-medium">
              <span className="mr-2">Lat: {deliveryBoyLocation?.lat}</span>
              <span>|</span>
              <span className="ml-2">Lon: {deliveryBoyLocation?.lon}</span>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT – STATS */}
          <div className="bg-[#fff9f6] rounded-2xl p-4">
            <div className="flex items-center mb-3">
              <h1 className="text-lg font-bold text-[#ff4d2d]">
                Today Deliveries
              </h1>
              <button
                onClick={() => setShowTodayStats((p) => !p)}
                className="ml-auto text-[#ff4d2d]"
              >
                {showTodayStats ? (
                  <CiCircleChevUp size={24} />
                ) : (
                  <CiCircleChevDown size={24} />
                )}
              </button>
            </div>

            {showTodayStats && (
              <>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={todayDeliveries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ff4d2d" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-4 bg-white rounded-xl shadow p-4 text-center">
                  <p className="text-sm text-gray-600">Today's Earnings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{totalEarning}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* RIGHT – ORDERS */}
          <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
            {!currentOrder && (
              <>
                <h1 className="text-lg font-bold mb-3">Available Orders</h1>
                {availableAssignment.length > 0 ? (
                  availableAssignment.map((a, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 flex justify-between items-center bg-blue-50 mb-3"
                    >
                      <div>
                        <p className="font-semibold">{a.shopName}</p>
                        <p className="text-sm text-gray-500">
                          {a.deliveryAddress?.text}
                        </p>
                      </div>
                      <button
                        className="bg-orange-500 text-white px-4 py-1 rounded-lg"
                        onClick={() => acceptOrder(a.assignmentId)}
                      >
                        Accept
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center">
                    <img src={noOrders} className="w-56" />
                  </div>
                )}
              </>
            )}

            {currentOrder && (
              <>
                <h2 className="text-lg font-bold mb-3">📦 Current Order</h2>

                <DeliveryBoyTracking
                  data={{
                    deliveryBoyLocation: deliveryBoyLocation || {
                      lat: userData.location.coordinates[1],
                      lon: userData.location.coordinates[0],
                    },
                    customerLocation: {
                      lat: currentOrder.deliveryAddress.latitude,
                      lon: currentOrder.deliveryAddress.longitude,
                    },
                  }}
                />

                {!showOtpBox ? (
                  <button
                    className="mt-4 w-full bg-green-400 text-white py-2 rounded-xl"
                    onClick={sendOtp}
                    disabled={loading}
                  >
                    {loading ? <ClipLoader size={20} /> : "Mark as Delivered"}
                  </button>
                ) : (
                  <div className="mt-4">
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="w-full border px-3 py-2 rounded-lg mb-3"
                    />
                    <button
                      className="w-full bg-orange-500 text-white py-2 rounded-lg"
                      onClick={verifyOtp}
                    >
                      {loading ? <ClipLoader size={20} /> : "Submit"}
                    </button>
                    {message && (
                      <p className="text-center text-green-500 mt-2">
                        {message}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER – ALWAYS AT BOTTOM */}
      <Footer />
    </div>
  );
};

export default DeliveryBoy;
