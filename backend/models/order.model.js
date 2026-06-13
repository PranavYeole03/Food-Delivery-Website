import mongoose, { Schema } from "mongoose";

const shopOrderItemsSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    name: String,
    price: Number,
    quantity: Number,
  },
  { timestamps: true },
);

const shopOrderSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subtotal: Number,
    shopOrderItems: [shopOrderItemsSchema],
    status: {
      type: String,
      enum: ["pending", "preparing", "out of delivery", "delivered", "cancelled", "returned"],
      default: "pending",
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAssignment",
      default: null,
    },
    assignedDeliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deliveryOtp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online", "pickup_advance", "pickup_full", "pay_at_restaurant", "wallet", "wallet_razorpay"],
      required: true,
    },
    orderType: {
      type: String,
      enum: ["delivery", "selfPickup"],
      default: "delivery",
    },
    pickupTimeSlot: {
      type: String,
      default: null,
    },
    pickupCustomerName: {
      type: String,
      default: null,
    },
    pickupCustomerMobile: {
      type: String,
      default: null,
    },
    specialInstructions: {
      type: String,
      default: null,
    },
    pickupOtp: {
      type: String,
      default: null,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    cancellationAllowedUntil: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      default: null,
    },
    cancelReasonType: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundStatus: {
      type: String,
      enum: ["none", "pending", "processed"],
      default: "none",
    },
    refundProcessedAt: {
      type: Date,
      default: null,
    },
    walletAmountPaid: {
      type: Number,
      default: 0,
    },
    onlineAmountPaid: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "out of delivery", "delivered", "cancelled", "returned"],
      default: "pending",
    },
    deliveryAddress: {
      text: String,
      latitude: Number,
      longitude: Number,
    },
    totalAmount: {
      type: Number,
    },
    shopOrders: [shopOrderSchema],
    payment: {
      type: Boolean,
      default: false,
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

orderSchema.index({ user: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
