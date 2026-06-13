// import api from "../api/axios";
// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { serverUrl } from "../App";
// import { IoArrowBack } from "react-icons/io5";
// import DeliveryBoyTracking from "../components/DeliveryBoyTracking";
// import { useSelector } from "react-redux";

// const TrackOrderPage = () => {
//   const { orderId } = useParams();
//   const navigate = useNavigate();
//   const [currentOrder, setCurrentOrder] = useState();
//   const { socket } = useSelector((state) => state.user);
//   const [liveLocation, setLiveLocation] = useState({});
//   const handleGetOrder = async () => {
//     try {
//       const result = await api.get(
//         `${serverUrl}/api/order/get-order-by-id/${orderId}`,
//         { withCredentials: true },
//       );
//       setCurrentOrder(result.data);
//     } catch (error) {
//       
//     }
//   };

//   useEffect(() => {
//     socket.on(
//       "updateDeliveryLocation",
//       ({ deliveryBoyId, latitude, longitude }) => {
//         setLiveLocation((prev) => ({
//           ...prev,
//           [deliveryBoyId]: { lat: latitude, lon: longitude },
//         }));
//       },
//     );
//   }, [socket]);
//   useEffect(() => {
//     handleGetOrder();
//   }, [orderId]);
//   return (
//     <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
//       <div
//         className="relative flex items-center gap-4 top-5 left-5 z-10 mb-2.5"
//         onClick={() => navigate("/")}
//       >
//         <IoArrowBack size={35} className="text-[#ff4d2d]" />
//         <h1 className="font-bold text-2xl md:text-center">Track Order</h1>
//       </div>
//       {currentOrder?.shopOrders?.map((shopOrder, index) => (
//         <div
//           className="bg-white p-4 rounded-2xl shadow-md border border-orange-200 space-y-4"
//           key={index}
//         >
//           <div>
//             <p className="text-lg font-bold mb-2 text-[#ff2d4d]">
//               {shopOrder.shop.name}
//             </p>
//             <p className="font-semibold">
//               <span className="text-black">Items:</span>
//               {shopOrder?.shopOrderItems?.map((i) => i.name).join("")}
//             </p>
//             <p>
//               <span className="font-semibold">Subtotal:</span>
//               ₨.{shopOrder.subtotal}
//             </p>
//             <p className="mt-6">
//               <span className="font-semibold">Delivery Address: </span>
//               {currentOrder.deliveryAddress?.text}
//             </p>
//           </div>
//           {shopOrder.status != "delivered" ? (
//             <>
//               {shopOrder.assignedDeliveryBoy ? (
//                 <div className="text-sm text-gray-700">
//                   <p className="font-semibold">
//                     <span>Delivery Boy:</span>
//                     {shopOrder.assignedDeliveryBoy.fullName}
//                   </p>
//                   <p className="font-semibold">
//                     <span>Contact No 📞:</span>
//                     {shopOrder.assignedDeliveryBoy.mobile}
//                   </p>
//                 </div>
//               ) : (
//                 <p className="font-semibold">
//                   Delivery Boy is not assigned yet.
//                 </p>
//               )}
//             </>
//           ) : (
//             <p className="text-green-600 font-semibold text-lg ">Delivered</p>
//           )}

//           {shopOrder?.assignedDeliveryBoy &&
//             shopOrder.status !== "delivered" && (
//               <div className="h-100 w-full rounded-2xl overflow-hidden shadow-md">
//                 <DeliveryBoyTracking
//                   data={{
//                     deliveryBoyLocation: liveLocation[
//                       shopOrder.assignedDeliveryBoy._id
//                     ] || {
//                       lat: shopOrder.assignedDeliveryBoy.location
//                         .coordinates[1],
//                       lon: shopOrder.assignedDeliveryBoy.location
//                         .coordinates[0],
//                     },
//                     customerLocation: {
//                       lat: currentOrder.deliveryAddress.latitude,
//                       lon: currentOrder.deliveryAddress.longitude,
//                     },
//                   }}
//                 />
//               </div>
//             )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default TrackOrderPage;

import api from "../api/axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../App";
import { IoArrowBack } from "react-icons/io5";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";
import { useSelector } from "react-redux";
import { socket } from "../socket";
import useSocket from "../hooks/useSocket";

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [currentOrder, setCurrentOrder] = useState(null);
  // const { socket } = useSelector((state) => state.user);
  const [liveLocation, setLiveLocation] = useState({});

  // ================= GET ORDER =================
  const handleGetOrder = async () => {
    try {
      const result = await api.get(
        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
        { withCredentials: true }
      );
      setCurrentOrder(result.data);
    } catch (error) {
      
    }
  };

  // ================= SOCKET =================
  useSocket("delivery:location-update", ({ deliveryBoyId, latitude, longitude }) => {
    setLiveLocation((prev) => ({
      ...prev,
      [deliveryBoyId]: { lat: latitude, lon: longitude },
    }));
  });

  useSocket("orderAccepted", ({ orderId, shopId, deliveryBoy }) => {
    setCurrentOrder((prev) => {
      if (!prev || prev._id !== orderId) return prev;
      return {
        ...prev,
        shopOrders: prev.shopOrders.map((so) =>
          so.shop?._id === shopId || so.shop === shopId
            ? { ...so, status: "preparing", assignedDeliveryBoy: deliveryBoy }
            : so
        ),
      };
    });
  });

  useSocket("readyForPickup", ({ orderId, shopId }) => {
    setCurrentOrder((prev) => {
      if (!prev || prev._id !== orderId) return prev;
      return {
        ...prev,
        shopOrders: prev.shopOrders.map((so) =>
          so.shop?._id === shopId || so.shop === shopId
            ? { ...so, status: "out of delivery" }
            : so
        ),
      };
    });
  });

  useSocket("orderDelivered", ({ orderId, shopId }) => {
    setCurrentOrder((prev) => {
      if (!prev || prev._id !== orderId) return prev;
      return {
        ...prev,
        shopOrders: prev.shopOrders.map((so) =>
          so.shop?._id === shopId || so.shop === shopId
            ? { ...so, status: "delivered" }
            : so
        ),
      };
    });
  });

  useSocket("orderCancelled", ({ orderId }) => {
    setCurrentOrder((prev) => {
      if (!prev || prev._id !== orderId) return prev;
      return {
        ...prev,
        status: "cancelled",
        shopOrders: prev.shopOrders.map((so) => ({ ...so, status: "cancelled" })),
      };
    });
  });

  // ================= FETCH =================
  useEffect(() => {
    handleGetOrder();
  }, [orderId]);

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">

      {/* HEADER */}
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <IoArrowBack size={30} className="text-[#ff4d2d]" />
        <h1 className="font-bold text-2xl">Track Order</h1>
      </div>

      {/* LOADING */}
      {!currentOrder ? (
        <p className="text-center text-gray-500 mt-10">Loading...</p>
      ) : (
        currentOrder?.shopOrders?.map((shopOrder) => (
          <div
            key={shopOrder._id} // ✅ FIX KEY
            className="bg-white p-4 rounded-2xl shadow-md border border-orange-200 space-y-4"
          >
            {/* SHOP INFO */}
            <div>
              <p className="text-lg font-bold mb-2 text-[#ff2d4d]">
                {shopOrder.shop?.name}
              </p>

              {/* ITEMS */}
              <p className="font-semibold">
                <span className="text-black">Items: </span>
                {shopOrder?.shopOrderItems
                  ?.map((i) => i.name)
                  .join(", ")} {/* ✅ FIX */}
              </p>

              <p>
                <span className="font-semibold">Subtotal: </span>
                ₹{shopOrder.subtotal}
              </p>

              <p className="mt-4">
                <span className="font-semibold">Delivery Address: </span>
                {currentOrder.deliveryAddress?.text}
              </p>
            </div>

            {/* STATUS */}
            {shopOrder.status !== "delivered" ? (
              <>
                {shopOrder.assignedDeliveryBoy ? (
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold">
                      Delivery Boy:{" "}
                      {shopOrder.assignedDeliveryBoy.fullName}
                    </p>
                    <p className="font-semibold">
                      Contact:{" "}
                      {shopOrder.assignedDeliveryBoy.mobile}
                    </p>
                  </div>
                ) : (
                  <p className="font-semibold">
                    Delivery Boy not assigned yet
                  </p>
                )}
              </>
            ) : (
              <p className="text-green-600 font-semibold text-lg">
                Delivered ✅
              </p>
            )}

            {/* MAP */}
            {shopOrder?.assignedDeliveryBoy &&
              shopOrder.status !== "delivered" && (() => {

                const deliveryBoyId = shopOrder.assignedDeliveryBoy._id;

                // ✅ LIVE LOCATION
                const live = liveLocation[deliveryBoyId];

                // ✅ FALLBACK FROM DB
                const coords =
                  shopOrder.assignedDeliveryBoy?.location?.coordinates;

                // ✅ SAFE LOCATION (IMPORTANT)
                const deliveryBoyLocation =
                  live ||
                  (coords && coords.length === 2
                    ? { lat: coords[1], lon: coords[0] }
                    : null);

                // ❌ If still no location → don't render map
                if (!deliveryBoyLocation) {
                  return (
                    <div className="h-64 flex items-center justify-center bg-gray-100 text-gray-500 rounded-xl">
                      Waiting for delivery location...
                    </div>
                  );
                }

                return (
                  <div className="h-75 w-full rounded-2xl overflow-hidden shadow-md">
                    <DeliveryBoyTracking
                      data={{
                        deliveryBoyLocation,
                        customerLocation: {
                          lat: currentOrder.deliveryAddress.latitude,
                          lon: currentOrder.deliveryAddress.longitude,
                        },
                      }}
                    />
                  </div>
                );
              })()}
          </div>
        ))
      )}
    </div>
  );
};

export default TrackOrderPage;
