import React, { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { serverUrl } from "../App";
import { setMyOrders, updateRealTimeOrderStatus } from "../redux/userSlice";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import { FaShoppingBag, FaCheckCircle, FaClock, FaWallet, FaHistory } from "react-icons/fa";
import useSocket from "../hooks/useSocket";

const CardSkeleton = () => (
  <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-5 shadow-xs animate-pulse">
    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 bg-gray-250 rounded-2xl"></div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-250 rounded-lg"></div>
          <div className="h-3 w-24 bg-gray-200 rounded-md"></div>
        </div>
      </div>
      <div className="space-y-2 text-right">
        <div className="h-3.5 w-16 bg-gray-200 rounded-md ml-auto"></div>
        <div className="h-3 w-20 bg-gray-200 rounded-md ml-auto"></div>
      </div>
    </div>
    <div className="flex space-x-3 overflow-hidden pb-1">
      {[1, 2].map((i) => (
        <div key={i} className="shrink-0 w-44 border border-gray-50 rounded-2xl p-3 space-y-2">
          <div className="w-full h-24 bg-gray-250 rounded-xl"></div>
          <div className="h-3.5 w-28 bg-gray-250 rounded-md"></div>
          <div className="h-3 w-14 bg-gray-200 rounded-md"></div>
        </div>
      ))}
    </div>
    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
      <div className="space-y-1">
        <div className="h-2.5 w-20 bg-gray-200 rounded-md"></div>
        <div className="h-5 w-16 bg-gray-250 rounded-lg"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-8.5 w-24 bg-gray-250 rounded-xl"></div>
        <div className="h-8.5 w-24 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  </div>
);

const MyOrders = () => {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [activeTab, setActiveTab] = useState("All Orders");

  // ================= FETCH LOGIC =================
  const fetchOrders = async (pageNum, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setFetchingMore(true);

      const res = await api.get(`${serverUrl}/api/order/my-order?page=${pageNum}&limit=10`, {
        withCredentials: true,
      });

      const newOrders = res.data || [];
      if (newOrders.length < 10) {
        setHasMore(false);
      }

      setOrders((prev) => (pageNum === 1 ? newOrders : [...prev, ...newOrders]));
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchOrders(1, true);
    }
  }, [userData]);

  // ================= INFINITE SCROLL =================
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 120
      ) {
        if (hasMore && !fetchingMore && !loading) {
          setPage((prev) => {
            const next = prev + 1;
            fetchOrders(next);
            return next;
          });
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, fetchingMore, loading]);

  // ================= SOCKET =================
  useSocket("newOrder", (data) => {
    const isOwner = userData?.role === "owner" && data?.shopOrders?.owner?._id === userData?._id;
    const isUser = userData?.role === "user" && data?.user?._id === userData?._id;
    if (isOwner || isUser) {
      setOrders((prev) => [data, ...prev]);
    }
  });

  useSocket("orderAccepted", ({ orderId, shopId, deliveryBoy }) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o._id === orderId) {
          if (Array.isArray(o.shopOrders)) {
            return {
              ...o,
              shopOrders: o.shopOrders.map((so) =>
                so.shop?._id === shopId || so.shop === shopId
                  ? { ...so, status: "preparing", assignedDeliveryBoy: deliveryBoy }
                  : so
              ),
            };
          } else if (o.shopOrders?.shop?._id === shopId || o.shopOrders?.shop === shopId) {
            return { ...o, shopOrders: { ...o.shopOrders, status: "preparing", assignedDeliveryBoy: deliveryBoy } };
          }
        }
        return o;
      })
    );
  });

  useSocket("delivery:accepted", ({ orderId, shopId, deliveryBoy }) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o._id === orderId) {
          if (Array.isArray(o.shopOrders)) {
            return {
              ...o,
              shopOrders: o.shopOrders.map((so) =>
                so.shop?._id === shopId || so.shop === shopId
                  ? { ...so, assignedDeliveryBoy: deliveryBoy }
                  : so
              ),
            };
          } else if (o.shopOrders?.shop?._id === shopId || o.shopOrders?.shop === shopId) {
            return { ...o, shopOrders: { ...o.shopOrders, assignedDeliveryBoy: deliveryBoy } };
          }
        }
        return o;
      })
    );
  });

  useSocket("orderCancelled", ({ orderId }) => {
    setOrders((prev) => {
      if (userData?.role === "owner") {
        return prev.filter((o) => o._id !== orderId);
      }
      return prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o));
    });
  });

  useSocket("readyForPickup", ({ orderId, shopId }) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o._id === orderId) {
          if (Array.isArray(o.shopOrders)) {
            return {
              ...o,
              shopOrders: o.shopOrders.map((so) =>
                so.shop?._id === shopId || so.shop === shopId ? { ...so, status: "out of delivery" } : so
              ),
            };
          } else if (o.shopOrders?.shop?._id === shopId || o.shopOrders?.shop === shopId) {
            return { ...o, shopOrders: { ...o.shopOrders, status: "out of delivery" } };
          }
        }
        return o;
      })
    );
  });

  useSocket("orderDelivered", ({ orderId, shopId }) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o._id === orderId) {
          if (Array.isArray(o.shopOrders)) {
            return {
              ...o,
              shopOrders: o.shopOrders.map((so) =>
                so.shop?._id === shopId || so.shop === shopId ? { ...so, status: "delivered" } : so
              ),
            };
          } else if (o.shopOrders?.shop?._id === shopId || o.shopOrders?.shop === shopId) {
            return { ...o, shopOrders: { ...o.shopOrders, status: "delivered" } };
          }
        }
        return o;
      })
    );
  });

  const handleBack = () => {
    navigate(userData?.role === "owner" ? "/owner" : "/");
  };

  const getStatus = (order) => {
    if (Array.isArray(order?.shopOrders) && order.shopOrders.length > 0) {
      return order.shopOrders[0]?.status || order.status;
    }
    if (order?.shopOrders?.status) {
      return order.shopOrders.status;
    }
    return order?.status;
  };

  const totalCount = orders?.length || 0;
  const completedCount = orders?.filter((o) => {
    const s = getStatus(o)?.toLowerCase();
    return s === "delivered" || s === "collected" || (o.orderType === "selfPickup" && o.otpVerified);
  }).length;
  const pendingCount = orders?.filter((o) => {
    const s = getStatus(o)?.toLowerCase();
    return s === "pending";
  }).length;
  const totalRefundAmount = orders?.reduce((acc, curr) => acc + (curr.refundAmount || 0), 0);

  const filterTabs = userData?.role === "owner"
    ? ["All Orders", "Pending", "Preparing", "Out For Delivery", "Self Pickup", "Home Delivery"]
    : ["All Orders", "Pending", "Preparing", "Out For Delivery", "Collected", "Cancelled", "Self Pickup", "Home Delivery"];

  const filteredOrders = orders.filter((order) => {
    const status = getStatus(order)?.toLowerCase();
    const isCancelled = status === "cancelled" || order?.status?.toLowerCase() === "cancelled";

    // Regular User: self-pickup collected order is removed fully
    const isCollectedPickup = order.orderType === "selfPickup" && (order.otpVerified || status === "collected");
    if (userData?.role === "user" && isCollectedPickup) {
      return false;
    }

    // Owner: user cancelled order is NOT shown under "All Orders"
    if (userData?.role === "owner" && isCancelled && activeTab === "All Orders") {
      return false;
    }

    if (activeTab === "All Orders") return true;
    if (activeTab === "Pending") return status === "pending";
    if (activeTab === "Preparing") return status === "preparing";
    if (activeTab === "Out For Delivery") return status === "out of delivery";
    if (activeTab === "Collected") return status === "collected" || (order.orderType === "selfPickup" && order.otpVerified);
    if (activeTab === "Cancelled") return status === "cancelled";
    if (activeTab === "Self Pickup") return order.orderType === "selfPickup";
    if (activeTab === "Home Delivery") return order.orderType === "delivery";

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="bg-white/80 backdrop-blur-md shadow-xs border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="bg-gray-50 hover:bg-gray-100 text-gray-700 p-2.5 rounded-2xl border border-gray-150 transition active:scale-95 duration-100"
            >
              <IoArrowBack size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                {userData?.role === "owner" ? "Restaurant Dashboard" : "My Orders"}
              </h1>
              <p className="text-xs text-gray-400 font-semibold mt-0.5 hidden sm:block">
                Track, manage and reorder your food orders
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className={`grid gap-4 ${userData?.role === "owner" ? "grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex items-center gap-4 hover:shadow-sm transition-shadow duration-200">
            <div className="bg-orange-50 text-[#ff4d2d] p-3.5 rounded-2xl">
              <FaShoppingBag size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Total Orders</p>
              <h2 className="text-xl font-black text-gray-800 mt-0.5">{totalCount}</h2>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex items-center gap-4 hover:shadow-sm transition-shadow duration-200">
            <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl">
              <FaCheckCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Completed</p>
              <h2 className="text-xl font-black text-gray-800 mt-0.5">{completedCount}</h2>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex items-center gap-4 hover:shadow-sm transition-shadow duration-200">
            <div className="bg-amber-50 text-amber-500 p-3.5 rounded-2xl">
              <FaClock size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">In Progress</p>
              <h2 className="text-xl font-black text-gray-800 mt-0.5">{pendingCount}</h2>
            </div>
          </div>

          {userData?.role !== "owner" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex items-center gap-4 hover:shadow-sm transition-shadow duration-200">
              <div className="bg-purple-50 text-purple-600 p-3.5 rounded-2xl">
                <FaWallet size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Wallet Refunds</p>
                <h2 className="text-xl font-black text-gray-800 mt-0.5">₹{totalRefundAmount}</h2>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
          <div className="flex overflow-x-auto whitespace-nowrap gap-2 pb-1 scrollbar-none">
            {filterTabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-150 border cursor-pointer active:scale-95 ${isActive
                      ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                      : "bg-gray-50/40 text-gray-500 hover:text-gray-800 hover:bg-gray-100/50 border-gray-150"
                    }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="space-y-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-center gap-4 bg-white rounded-3xl border border-gray-100 shadow-xs p-8">
              <div className="bg-gray-50 p-6 rounded-full text-gray-300">
                <FaShoppingBag size={48} />
              </div>
              <div className="space-y-1 max-w-sm">
                <p className="text-base font-black text-gray-800">No Orders Found</p>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                  We couldn't find any orders matching your selection. Try adjusting your search query or filters.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.3) }}
                    layout
                  >
                    {userData?.role === "user" ? (
                      <UserOrderCard data={order} />
                    ) : (
                      <OwnerOrderCard data={order} />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {fetchingMore && (
                <div className="py-6 flex justify-center">
                  <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center text-[10px] text-gray-400 uppercase font-black tracking-widest pt-12">
          © {new Date().getFullYear()} Fletto Order Dispatch System
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
