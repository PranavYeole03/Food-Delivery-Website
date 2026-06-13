import express from "express";
import isAuth from "../middleware/isAuth.js";

import {
  getDeliveryBoyAssingement,
  getMyOrder,
  placeOrder,
  updateOrderStatus,
  acceptOrder,
  getCurrentOrder,
  getOrderById,
  verifyOTP,
  sendOtpByDeliveryBoy,
  verifyPayment,
  getTodayDelivery,
  cancelOrder,
  verifyPickupOTP,
  returnOrder,
  rejectOrder,
} from "../controllers/order.controller.js";

const orderRouter = express.Router();

//shop router
orderRouter.post("/place-order", isAuth, placeOrder);
orderRouter.post("/verify-payment", isAuth, verifyPayment);
orderRouter.get("/my-order", isAuth, getMyOrder);
orderRouter.get("/get-assignments", isAuth, getDeliveryBoyAssingement);
orderRouter.get("/get-current-order", isAuth, getCurrentOrder);
orderRouter.post("/send-delivery-otp", isAuth, sendOtpByDeliveryBoy);
orderRouter.post("/verify-otp-delivery", isAuth, verifyOTP);
orderRouter.post("/update-status/:orderId/:shopId", isAuth, updateOrderStatus);
orderRouter.get("/accept-order/:assignmentId", isAuth, acceptOrder);
orderRouter.get("/reject-order/:assignmentId", isAuth, rejectOrder);
orderRouter.get("/get-order-by-id/:orderId", isAuth, getOrderById);
orderRouter.get("/get-today-deliveries", isAuth, getTodayDelivery);
orderRouter.post("/cancel", isAuth, cancelOrder);
orderRouter.post("/verify-otp-pickup", isAuth, verifyPickupOTP);
orderRouter.post("/return", isAuth, returnOrder);

export default orderRouter;
