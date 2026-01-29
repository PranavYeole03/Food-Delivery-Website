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

  const [currentOrder, setCurrentOrder] = useState(null);
  const [availableAssignment, setAvailableAssignment] = useState([]);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [showTodayStats, setShowTodayStats] = useState(true);

  // OTP STATES
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

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

          socket.emit("updateLocation", {
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

  /* ================= DATA ================= */
  const ratePerDelivery = 50;
  const totalEarning = todayDeliveries.reduce(
    (sum, d) => sum + (d?.count || 0) * ratePerDelivery,
    0
  );

  const getAssignment = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true,
      });
      setAvailableAssignment(res.data || []);
    } catch {
      setAvailableAssignment([]);
    }
  };

  const getCurrentOrder = async () => {
    try {
      const res = await axios.get(
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
      const res = await axios.get(
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
      await axios.get(`${serverUrl}/api/order/accept-order/${id}`, {
        withCredentials: true,
      });
      await getCurrentOrder();
      await getAssignment();
    } finally {
      setLoading(false);
    }
  };

  /* ================= OTP FLOW ================= */

  const sendOtp = async () => {
    if (!currentOrder || loading) return;

    try {
      setLoading(true);

      await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
        },
        { withCredentials: true }
      );

      setShowOtpBox(true);
    } catch (err) {
      console.error("Send OTP error:", err);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || loading) return;

    try {
      setLoading(true);

      const res = await axios.post(
        `${serverUrl}/api/order/verify-otp-delivery`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp,
        },
        { withCredentials: true }
      );

      setMessage(res.data.message || "Order delivered");

      // reset UI
      setOtp("");
      setShowOtpBox(false);
      setCurrentOrder(null);

      await Promise.all([getAssignment(), getTodayDeliveries()]);
    } catch (err) {
      console.error("Verify OTP error:", err);
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

  /* ================= UI ================= */
  return (
    <div className="w-full min-h-screen bg-[#fdfdfd] flex flex-col">
      <Nav />

      <div className="flex-1 w-full max-w-7xl mx-auto px-3 py-4">
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-md p-5 border border-orange-100 mb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <h1 className="text-xl font-bold text-red-500">
              Welcome, {userData?.fullName}
            </h1>
            {deliveryBoyLocation && (
              <p className="text-sm text-[#ff4d2d]">
                Lat: {deliveryBoyLocation.lat} | Lon: {deliveryBoyLocation.lon}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* STATS */}
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

          {/* ORDERS */}
          <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
            {!currentOrder ? (
              <>
                <h1 className="text-lg font-bold mb-3">Available Orders</h1>

                {availableAssignment.length ? (
                  availableAssignment.map((a) => (
                    <div
                      key={a.assignmentId}
                      className="border rounded-lg p-4 flex justify-between bg-blue-50 mb-3"
                    >
                      <div>
                        <p className="font-semibold">{a.shopName}</p>
                        <p className="text-sm text-gray-500">
                          {a.deliveryAddress?.text}
                        </p>
                      </div>
                      <button
                        disabled={loading}
                        className="bg-orange-500 text-white px-4 py-1 rounded-lg"
                        onClick={() => acceptOrder(a.assignmentId)}
                      >
                        Accept
                      </button>
                    </div>
                  ))
                ) : (
                  <img src={noOrders} className="w-56 mx-auto" />
                )}
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold mb-3">📦 Current Order</h2>

                {deliveryBoyLocation && (
                  <DeliveryBoyTracking
                    data={{
                      deliveryBoyLocation,
                      customerLocation: {
                        lat: currentOrder.deliveryAddress.latitude,
                        lon: currentOrder.deliveryAddress.longitude,
                      },
                    }}
                  />
                )}

                {!showOtpBox ? (
                  <button
                    disabled={loading}
                    className="mt-4 w-full bg-green-500 text-white py-2 rounded-xl"
                    onClick={sendOtp}
                  >
                    {loading ? <ClipLoader size={20} /> : "Mark as Delivered"}
                  </button>
                ) : (
                  <div className="mt-4">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="w-full border px-3 py-2 rounded-lg mb-3 text-center tracking-widest"
                    />

                    <button
                      disabled={loading}
                      className="w-full bg-orange-500 text-white py-2 rounded-lg"
                      onClick={verifyOtp}
                    >
                      {loading ? <ClipLoader size={20} /> : "Submit OTP"}
                    </button>

                    {message && (
                      <p className="text-center text-green-600 mt-2">
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

      <Footer />
    </div>
  );
};

export default DeliveryBoy;


