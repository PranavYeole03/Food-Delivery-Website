import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../App";
import { IoArrowBack } from "react-icons/io5";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";
import { useSelector } from "react-redux";

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [currentOrder, setCurrentOrder] = useState();
  const { socket } = useSelector((state) => state.user);
  const [liveLocation, setLiveLocation] = useState({});
  const handleGetOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
        { withCredentials: true },
      );
      setCurrentOrder(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    socket.on(
      "updateDeliveryLocation",
      ({ deliveryBoyId, latitude, longitude }) => {
        setLiveLocation((prev) => ({
          ...prev,
          [deliveryBoyId]: { lat: latitude, lon: longitude },
        }));
      },
    );
  }, [socket]);
  useEffect(() => {
    handleGetOrder();
  }, [orderId]);
  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
      <div
        className="relative flex items-center gap-4 top-5 left-5 z-10 mb-2.5"
        onClick={() => navigate("/")}
      >
        <IoArrowBack size={35} className="text-[#ff4d2d]" />
        <h1 className="font-bold text-2xl md:text-center">Track Order</h1>
      </div>
      {currentOrder?.shopOrders?.map((shopOrder, index) => (
        <div
          className="bg-white p-4 rounded-2xl shadow-md border border-orange-200 space-y-4"
          key={index}
        >
          <div>
            <p className="text-lg font-bold mb-2 text-[#ff2d4d]">
              {shopOrder.shop.name}
            </p>
            <p className="font-semibold">
              <span className="text-black">Items:</span>
              {shopOrder?.shopOrderItems?.map((i) => i.name).join("")}
            </p>
            <p>
              <span className="font-semibold">Subtotal:</span>
              ₨.{shopOrder.subtotal}
            </p>
            <p className="mt-6">
              <span className="font-semibold">Delivery Address: </span>
              {currentOrder.deliveryAddress?.text}
            </p>
          </div>
          {shopOrder.status != "delivered" ? (
            <>
              {shopOrder.assignedDeliveryBoy ? (
                <div className="text-sm text-gray-700">
                  <p className="font-semibold">
                    <span>Delivery Boy:</span>
                    {shopOrder.assignedDeliveryBoy.fullName}
                  </p>
                  <p className="font-semibold">
                    <span>Contact No 📞:</span>
                    {shopOrder.assignedDeliveryBoy.mobile}
                  </p>
                </div>
              ) : (
                <p className="font-semibold">
                  Delivery Boy is not assigned yet.
                </p>
              )}
            </>
          ) : (
            <p className="text-green-600 font-semibold text-lg ">Delivered</p>
          )}

          {shopOrder?.assignedDeliveryBoy &&
            shopOrder.status !== "delivered" && (
              <div className="h-100 w-full rounded-2xl overflow-hidden shadow-md">
                <DeliveryBoyTracking
                  data={{
                    deliveryBoyLocation: liveLocation[
                      shopOrder.assignedDeliveryBoy._id
                    ] || {
                      lat: shopOrder.assignedDeliveryBoy.location
                        .coordinates[1],
                      lon: shopOrder.assignedDeliveryBoy.location
                        .coordinates[0],
                    },
                    customerLocation: {
                      lat: currentOrder.deliveryAddress.latitude,
                      lon: currentOrder.deliveryAddress.longitude,
                    },
                  }}
                />
              </div>
            )}
        </div>
      ))}
    </div>
  );
};

export default TrackOrderPage;
