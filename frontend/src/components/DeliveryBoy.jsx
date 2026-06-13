// import React, { useState, useEffect } from "react";
// import Nav from "./Nav";
// import { useSelector } from "react-redux";
// import api from "../api/axios";
// import { serverUrl } from "../App";
// import noOrders from "../assets/no-orders.png";
// import DeliveryBoyTracking from "./DeliveryBoyTracking";
// import { ClipLoader } from "react-spinners";
// import { CiCircleChevUp, CiCircleChevDown } from "react-icons/ci";
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
//   const { userData, socket } = useSelector((state) => state.user);

//   const [currentOrder, setCurrentOrder] = useState(null);
//   const [availableAssignment, setAvailableAssignment] = useState([]);
//   const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
//   const [todayDeliveries, setTodayDeliveries] = useState([]);
//   const [showTodayStats, setShowTodayStats] = useState(true);

//   // OTP STATES
//   const [showOtpBox, setShowOtpBox] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [message, setMessage] = useState("");

//   const [loading, setLoading] = useState(false);

//   /* ================= LOCATION ================= */
//   useEffect(() => {
//     if (!socket || !userData || userData.role !== "deliveryBoy") return;

//     let watchId = null;

//     if ("geolocation" in navigator) {
//       watchId = navigator.geolocation.watchPosition(
//         ({ coords }) => {
//           const latitude = coords.latitude;
//           const longitude = coords.longitude;

//           setDeliveryBoyLocation({ lat: latitude, lon: longitude });

//           socket.emit("updateLocation", {
//             latitude,
//             longitude,
//             userId: userData._id,
//           });
//         },
//         (err) => console.error("Location error:", err),
//         { enableHighAccuracy: true }
//       );
//     }

//     return () => {
//       if (watchId) navigator.geolocation.clearWatch(watchId);
//     };
//   }, [socket, userData]);

//     useEffect(() => {
//     if (!socket) return;
//     socket.on("newAssignment", (data) => {
//       if (data.sentTo === userData._id) {
//         setAvailableAssignment((prev) => [...prev, data]);
//       }
//     });
//     return () => socket.off("newAssignment")
//   }, [socket, userData])

//   /* ================= DATA ================= */
//   const ratePerDelivery = 50;
//   const totalEarning = todayDeliveries.reduce(
//     (sum, d) => sum + (d?.count || 0) * ratePerDelivery,
//     0
//   );

//   const getAssignment = async () => {
//     try {
//       const res = await api.get(`${serverUrl}/api/order/get-assignments`, {
//         withCredentials: true,
//       });
//       setAvailableAssignment(res.data || []);
//     } catch {
//       setAvailableAssignment([]);
//     }
//   };

//   const getCurrentOrder = async () => {
//     try {
//       const res = await api.get(
//         `${serverUrl}/api/order/get-current-order`,
//         { withCredentials: true }
//       );
//       setCurrentOrder(res.data || null);
//     } catch {
//       setCurrentOrder(null);
//     }
//   };

//   const getTodayDeliveries = async () => {
//     try {
//       const res = await api.get(
//         `${serverUrl}/api/order/get-today-deliveries`,
//         { withCredentials: true }
//       );
//       setTodayDeliveries(res.data || []);
//     } catch {
//       setTodayDeliveries([]);
//     }
//   };

//   const acceptOrder = async (id) => {
//     if (loading) return;
//     try {
//       setLoading(true);
//       await api.get(`${serverUrl}/api/order/accept-order/${id}`, {
//         withCredentials: true,
//       });
//       await getCurrentOrder();
//       await getAssignment();
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= OTP FLOW ================= */

//   const sendOtp = async () => {
//     if (!currentOrder || loading) return;

//     try {
//       setLoading(true);

//       await api.post(
//         `${serverUrl}/api/order/send-delivery-otp`,
//         {
//           orderId: currentOrder._id,
//           shopOrderId: currentOrder.shopOrder._id,
//         },
//         { withCredentials: true }
//       );

//       setShowOtpBox(true);
//     } catch (err) {
//       console.error("Send OTP error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyOtp = async () => {
//     if (!otp || loading) return;

//     try {
//       setLoading(true);

//       const res = await api.post(
//         `${serverUrl}/api/order/verify-otp-delivery`,
//         {
//           orderId: currentOrder._id,
//           shopOrderId: currentOrder.shopOrder._id,
//           otp,
//         },
//         { withCredentials: true }
//       );

//       setMessage(res.data.message || "Order delivered");

//       // reset UI
//       setOtp("");
//       setShowOtpBox(false);
//       setCurrentOrder(null);

//       await Promise.all([getAssignment(), getTodayDeliveries()]);
//     } catch (err) {
//       console.error("Verify OTP error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!userData || userData.role !== "deliveryBoy") return;
//     getAssignment();
//     getCurrentOrder();
//     getTodayDeliveries();
//   }, [userData]);

//   /* ================= UI ================= */
//   return (
//     <div className="w-full min-h-screen bg-[#fdfdfd] flex flex-col">
//       <Nav />

//       <div className="flex-1 w-full max-w-7xl mx-auto px-3 py-4">
//         {/* HEADER */}
//         <div className="bg-white rounded-2xl shadow-md p-5 border border-orange-100 mb-4">
//           <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
//             <h1 className="text-xl font-bold text-red-500">
//               Welcome, {userData?.fullName}
//             </h1>
//             {deliveryBoyLocation && (
//               <p className="text-sm text-[#ff4d2d]">
//                 Lat: {deliveryBoyLocation.lat} | Lon: {deliveryBoyLocation.lon}
//               </p>
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//           {/* STATS */}
//           <div className="bg-[#fff9f6] rounded-2xl p-4">
//             <div className="flex items-center mb-3">
//               <h1 className="text-lg font-bold text-[#ff4d2d]">
//                 Today Deliveries
//               </h1>
//               <button
//                 onClick={() => setShowTodayStats((p) => !p)}
//                 className="ml-auto text-[#ff4d2d]"
//               >
//                 {showTodayStats ? (
//                   <CiCircleChevUp size={24} />
//                 ) : (
//                   <CiCircleChevDown size={24} />
//                 )}
//               </button>
//             </div>

//             {showTodayStats && (
//               <>
//                 <ResponsiveContainer width="100%" height={230}>
//                   <BarChart data={todayDeliveries}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="hour" />
//                     <YAxis allowDecimals={false} />
//                     <Tooltip />
//                     <Bar dataKey="count" fill="#ff4d2d" />
//                   </BarChart>
//                 </ResponsiveContainer>

//                 <div className="mt-4 bg-white rounded-xl shadow p-4 text-center">
//                   <p className="text-sm text-gray-600">Today's Earnings</p>
//                   <p className="text-2xl font-bold text-green-600">
//                     ₹{totalEarning}
//                   </p>
//                 </div>
//               </>
//             )}
//           </div>

//           {/* ORDERS */}
//           <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
//             {!currentOrder ? (
//               <>
//                 <h1 className="text-lg font-bold mb-3">Available Orders</h1>

//                 {availableAssignment.length ? (
//                   availableAssignment.map((a) => (
//                     <div
//                       key={a.assignmentId}
//                       className="border rounded-lg p-4 flex justify-between bg-blue-50 mb-3"
//                     >
//                       <div>
//                         <p className="font-semibold">{a.shopName}</p>
//                         <p className="text-sm text-gray-500">
//                           {a.deliveryAddress?.text}
//                         </p>
//                       </div>
//                       <button
//                         disabled={loading}
//                         className="bg-orange-500 text-white px-4 py-1 rounded-lg"
//                         onClick={() => acceptOrder(a.assignmentId)}
//                       >
//                         Accept
//                       </button>
//                     </div>
//                   ))
//                 ) : (
//                   <img src={noOrders} className="w-56 mx-auto" />
//                 )}
//               </>
//             ) : (
//               <>
//                 <h2 className="text-lg font-bold mb-3">📦 Current Order</h2>

//                 {deliveryBoyLocation && (
//                   <DeliveryBoyTracking
//                     data={{
//                       deliveryBoyLocation,
//                       customerLocation: {
//                         lat: currentOrder.deliveryAddress.latitude,
//                         lon: currentOrder.deliveryAddress.longitude,
//                       },
//                     }}
//                   />
//                 )}

//                 {!showOtpBox ? (
//                   <button
//                     disabled={loading}
//                     className="mt-4 w-full bg-green-500 text-white py-2 rounded-xl"
//                     onClick={sendOtp}
//                   >
//                     {loading ? <ClipLoader size={20} /> : "Mark as Delivered"}
//                   </button>
//                 ) : (
//                   <div className="mt-4">
//                     <input
//                       type="text"
//                       maxLength={6}
//                       value={otp}
//                       onChange={(e) => setOtp(e.target.value)}
//                       placeholder="Enter 6-digit OTP"
//                       className="w-full border px-3 py-2 rounded-lg mb-3 text-center tracking-widest"
//                     />

//                     <button
//                       disabled={loading}
//                       className="w-full bg-orange-500 text-white py-2 rounded-lg"
//                       onClick={verifyOtp}
//                     >
//                       {loading ? <ClipLoader size={20} /> : "Submit OTP"}
//                     </button>

//                     {message && (
//                       <p className="text-center text-green-600 mt-2">
//                         {message}
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default DeliveryBoy;


import React, { useState, useEffect } from "react";
import { socket } from "../socket";
import useSocket from "../hooks/useSocket";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import api from "../api/axios";
import { serverUrl } from "../App";
import noOrders from "../assets/no-orders.png";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { ClipLoader } from "react-spinners";
import { CiCircleChevUp, CiCircleChevDown } from "react-icons/ci";
import {
  FaMotorcycle,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaWallet,
  FaClipboardList,
  FaHourglassHalf,
  FaTimes,
  FaRoute,
  FaPhoneAlt,
  FaPaperPlane,
  FaTimesCircle
} from "react-icons/fa";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import Footer from "./Footer";

const DeliveryBoy = () => {
  const { userData } = useSelector((state) => state.user);

  const [currentOrder, setCurrentOrder] = useState(null);
  const [availableAssignment, setAvailableAssignment] = useState([]);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [showTodayStats, setShowTodayStats] = useState(true);

  // OTP STATES
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [loading, setLoading] = useState(false);

  /* ================= LOCATION ================= */
  useEffect(() => {
    if (!socket || !userData || userData.role !== "deliveryBoy") return;

    let watchId = null;

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        ({ coords }) => {
          const latitude = coords.latitude;
          const longitude = coords.longitude;

          setDeliveryBoyLocation({ lat: latitude, lon: longitude });

          socket.emit("delivery:update-location", {
            latitude,
            longitude,
            userId: userData._id,
          });
        },
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, userData]);

  useSocket("delivery:request", (data) => {
    if (data.sentTo === userData?._id) {
      setAvailableAssignment((prev) => {
        // Prevent duplicate assignments
        if (prev.some(a => a.assignmentId === data.assignmentId)) return prev;
        return [...prev, data];
      });
    }
  });

  /* ================= DATA ================= */
  const totalEarning = todayDeliveries.reduce(
    (sum, d) => sum + (d?.earnings || 0),
    0
  );
  const totalDeliveriesCount = todayDeliveries.reduce(
    (sum, d) => sum + (d?.count || 0),
    0
  );

  const getAssignment = async () => {
    try {
      const res = await api.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true,
      });
      setAvailableAssignment(res.data || []);
    } catch {
      setAvailableAssignment([]);
    }
  };

  const getCurrentOrder = async () => {
    try {
      const res = await api.get(
        `${serverUrl}/api/order/get-current-order`,
        { withCredentials: true }
      );
      setCurrentOrder(res.data || null);
    } catch {
      setCurrentOrder(null);
    }
  };

  const getTodayDeliveries = async () => {
    try {
      const res = await api.get(
        `${serverUrl}/api/order/get-today-deliveries`,
        { withCredentials: true }
      );
      setTodayDeliveries(res.data || []);
    } catch {
      setTodayDeliveries([]);
    }
  };

  const acceptOrder = async (id) => {
    if (loading) return;
    try {
      setLoading(true);
      setErrorMsg("");
      await api.get(`${serverUrl}/api/order/accept-order/${id}`, {
        withCredentials: true,
      });
      await getCurrentOrder();
      await getAssignment();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to accept order");
    } finally {
      setLoading(false);
    }
  };

  const rejectOrder = async (id) => {
    if (loading) return;
    try {
      setLoading(true);
      setErrorMsg("");
      await api.get(`${serverUrl}/api/order/reject-order/${id}`, {
        withCredentials: true,
      });
      await getAssignment();
    } catch (err) {
      console.error("Reject order error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= OTP FLOW ================= */

  const sendOtp = async () => {
    if (!currentOrder || loading) return;

    try {
      setLoading(true);
      setErrorMsg("");

      await api.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
        },
        { withCredentials: true }
      );

      setShowOtpBox(true);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to send delivery OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || loading) return;

    try {
      setLoading(true);
      setErrorMsg("");

      const res = await api.post(
        `${serverUrl}/api/order/verify-otp-delivery`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp,
        },
        { withCredentials: true }
      );

      setMessage(res.data.message || "Order delivered successfully!");

      // reset UI
      setOtp("");
      setShowOtpBox(false);
      setCurrentOrder(null);

      await Promise.all([getAssignment(), getTodayDeliveries()]);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userData || userData.role !== "deliveryBoy") return;
    getAssignment();
    getCurrentOrder();
    getTodayDeliveries();
  }, [userData]);

  /* ================= CUSTOM TOOLTIP ================= */
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{payload[0].payload.label}</p>
          <p className="text-sm font-black text-gray-800 mt-1">Earnings: <span className="text-[#ff4d2d]">₹{payload[0].value}</span></p>
          <p className="text-[11px] text-gray-500 font-bold mt-0.5">Deliveries: {payload[0].payload.count}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full min-h-screen bg-gray-50/50 flex flex-col">
      <Nav />

      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ================= HEADER OVERVIEW ================= */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs relative overflow-hidden">
          {/* Subtle decorative background gradient */}
          <div className="absolute right-0 top-0 h-40 w-40 bg-gradient-to-bl from-orange-500/5 to-transparent rounded-full pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gradient-to-tr from-[#ff4d2d] to-orange-400 rounded-2xl flex items-center justify-center text-white shadow-md shadow-orange-500/10 shrink-0">
                <FaMotorcycle size={28} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-black text-gray-800 tracking-tight">
                    Welcome, {userData?.fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Active & Online
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">
                  Fletto Certified Rider Partner
                </p>
              </div>
            </div>

            {deliveryBoyLocation && (
              <div className="bg-gray-50 border border-gray-150 rounded-2xl px-4 py-2.5 flex items-center gap-3">
                <div className="bg-orange-50 text-[#ff4d2d] p-2 rounded-xl">
                  <FaRoute size={16} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Rider GPS Status</span>
                  <span className="text-xs font-black text-gray-700">
                    Lat: {deliveryBoyLocation.lat.toFixed(5)} • Lon: {deliveryBoyLocation.lon.toFixed(5)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3 text-rose-700 font-bold text-xs animate-fadeIn">
            <FaTimesCircle size={18} className="text-rose-500 shrink-0" />
            <p className="flex-1">{errorMsg}</p>
            <button type="button" onClick={() => setErrorMsg("")} className="text-rose-400 hover:text-rose-600 transition">
              <FaTimes size={12} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ================= STATS & GRAPH ================= */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-base font-black text-gray-800 tracking-tight flex items-center gap-2">
                  <FaWallet size={16} className="text-[#ff4d2d]" />
                  Today's Income Analytics
                </h2>
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Hourly performance graph & statistics</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTodayStats((p) => !p)}
                className="bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 p-2 rounded-xl border border-gray-150 transition active:scale-95 duration-100 cursor-pointer"
              >
                {showTodayStats ? (
                  <CiCircleChevUp size={20} className="stroke-[1.5]" />
                ) : (
                  <CiCircleChevDown size={20} className="stroke-[1.5]" />
                )}
              </button>
            </div>

            {showTodayStats && (
              <div className="space-y-6 animate-fadeIn">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={todayDeliveries} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff4d2d" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#ff4d2d" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis dataKey="label" stroke="#667085" fontSize={9} fontWeight="900" tickLine={false} />
                      <YAxis stroke="#667085" fontSize={10} fontWeight="900" tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area name="Earnings" type="monotone" dataKey="earnings" stroke="#ff4d2d" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex items-center gap-3.5 hover:shadow-xs transition duration-200">
                    <div className="bg-orange-50 text-[#ff4d2d] p-3 rounded-xl">
                      <FaClipboardList size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Total Deliveries</p>
                      <p className="text-xl font-black text-gray-800 mt-0.5">
                        {totalDeliveriesCount}
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50/20 border border-emerald-100/50 rounded-2xl p-4 flex items-center gap-3.5 hover:shadow-xs transition duration-200">
                    <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
                      <FaWallet size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Net Earnings</p>
                      <p className="text-xl font-black text-emerald-600 mt-0.5">
                        ₹{totalEarning}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= ACTIVE ORDERS & BROADCASTS ================= */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs min-h-[400px] flex flex-col">

            {/* CASE 1: NO ACTIVE ORDER IN PROGRESS */}
            {!currentOrder ? (
              <div className="flex-1 flex flex-col">
                <div className="space-y-0.5 mb-5">
                  <h2 className="text-base font-black text-gray-800 tracking-tight flex items-center gap-2">
                    <FaHourglassHalf className="text-amber-500 animate-spin" size={16} style={{ animationDuration: '3s' }} />
                    Available Order Broadcasts
                  </h2>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Accept or reject broadcasts instantly</p>
                </div>

                {availableAssignment.length ? (
                  <div className="space-y-4 flex-1">
                    {availableAssignment.map((a) => (
                      <div
                        key={a.assignmentId}
                        className="bg-blue-50/30 border border-blue-100 rounded-2xl p-5 space-y-4 hover:shadow-xs transition duration-200 animate-fadeIn"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-widest">Incoming broadcast</span>
                            <h3 className="text-sm font-black text-gray-800 mt-2 hover:text-orange-500 transition-colors">
                              {a.shopName}
                            </h3>
                            <p className="text-xs text-gray-400 font-bold mt-1.5 flex items-start gap-1">
                              <FaMapMarkerAlt size={12} className="text-gray-400 mt-0.5 shrink-0" />
                              <span>{a.deliveryAddress?.text}</span>
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Deliver Fee</span>
                            <span className="text-sm font-black text-[#ff4d2d] mt-1 block">₹{Math.round((a.subtotal || 0) * 0.045)}</span>
                          </div>
                        </div>

                        {/* Items preview in broadcast */}
                        {a.items && a.items.length > 0 && (
                          <div className="bg-white/80 border border-gray-100 rounded-xl p-3 flex gap-2 overflow-x-auto divide-x divide-gray-50">
                            {a.items.map((item, idx) => (
                              <div key={idx} className="text-[11px] font-bold text-gray-600 px-2 shrink-0">
                                <span className="font-extrabold text-gray-800">{item.name}</span> × {item.quantity}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => acceptOrder(a.assignmentId)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs shadow-xs transition active:scale-98 duration-100 cursor-pointer text-center"
                          >
                            {loading ? <ClipLoader size={12} color="#ffffff" /> : "Accept Order"}
                          </button>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => rejectOrder(a.assignmentId)}
                            className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-150 font-black py-2.5 rounded-xl text-xs transition active:scale-98 duration-100 cursor-pointer text-center"
                          >
                            {loading ? <ClipLoader size={12} color="#f43f5e" /> : "Reject Order"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/30 border border-dashed border-gray-150 rounded-3xl space-y-4">
                    <img src={noOrders} className="w-40 opacity-80" alt="No broadcasted orders" />
                    <div className="space-y-1 max-w-xs">
                      <p className="text-sm font-black text-gray-800">No broadcasts at the moment</p>
                      <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">
                        Incoming restaurant broadcasts within a 5km radius will automatically stream here. Keep GPS turned on!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (

              /* CASE 2: ACTIVE ORDER ASSIGNED AND IN PROGRESS */
              <div className="flex-1 flex flex-col space-y-5 animate-fadeIn">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Shipment in transit</span>
                  <h2 className="text-base font-black text-gray-800 tracking-tight mt-2 flex items-center gap-1.5">
                    📦 Current Delivery Shipment
                  </h2>
                </div>

                {/* Map/Tracking Panel */}
                {deliveryBoyLocation && (
                  <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-xs">
                    <DeliveryBoyTracking
                      data={{
                        deliveryBoyLocation,
                        customerLocation: {
                          lat:
                            currentOrder.deliveryAddress.lat ||
                            currentOrder.deliveryAddress.latitude,
                          lon:
                            currentOrder.deliveryAddress.lon ||
                            currentOrder.deliveryAddress.longitude,
                        },
                      }}
                    />
                  </div>
                )}

                {/* Shipment specs details card */}
                <div className="border border-gray-100 bg-gray-50/30 rounded-2xl p-4 space-y-3.5 text-xs font-bold text-gray-600">
                  <div className="flex justify-between items-center pb-2.5 border-b border-gray-200/50">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Restaurant</p>
                      <p className="text-sm font-black text-gray-800 mt-0.5">{currentOrder.shopOrder?.shop?.name || "Fletto Partner Store"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Est. Earnings</p>
                      <p className="text-sm font-black text-emerald-600 mt-0.5">₹{Math.round((currentOrder.shopOrder?.subtotal || 0) * 0.045)}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-0.5">Delivery Destination</p>
                      <p className="text-xs text-gray-700 leading-normal font-extrabold">{currentOrder.deliveryAddress?.text}</p>
                    </div>
                    {currentOrder.user?.mobile && (
                      <div className="shrink-0 flex items-center">
                        <a
                          href={`tel:${currentOrder.user.mobile}`}
                          className="bg-white hover:bg-gray-100 text-gray-700 p-2.5 rounded-xl border border-gray-200 shadow-xs transition active:scale-95 duration-100 flex items-center justify-center gap-1.5"
                        >
                          <FaPhoneAlt size={12} className="text-orange-500" />
                          <span className="text-[11px] font-black">Call</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* OTP Action flow */}
                {!showOtpBox ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={sendOtp}
                    className="w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white font-black py-3 rounded-2xl text-sm transition-all shadow-md shadow-orange-500/10 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? <ClipLoader size={16} color="#ffffff" /> : (
                      <>
                        <FaCheckCircle size={16} />
                        Mark as Delivered
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-5 space-y-4 animate-fadeIn">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-gray-800">Submit Customer Verification OTP</h4>
                      <p className="text-xs text-gray-500 font-semibold leading-relaxed">Ask the customer for the 6-digit verification code to complete delivery collection.</p>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP code"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-center tracking-widest text-base font-black outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/10 transition-all duration-200"
                        disabled={loading}
                      />

                      <button
                        type="button"
                        disabled={loading}
                        onClick={verifyOtp}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-xs transition active:scale-98 duration-100 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? <ClipLoader size={14} color="#ffffff" /> : (
                          <>
                            <FaPaperPlane size={12} />
                            Verify & Submit Shipment
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {message && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-black animate-fadeIn">
                    <FaCheckCircle size={16} className="text-emerald-500" />
                    <p>{message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* <div className="text-center text-[10px] text-gray-400 uppercase font-black tracking-widest pt-12">
          © {new Date().getFullYear()} Fletto Logistics Partner Portal
        </div> */}
      </div>

      <Footer />
    </div>
  );
};

export default DeliveryBoy;






