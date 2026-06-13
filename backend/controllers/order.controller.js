import Shop from "../models/shop.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import { 
  sendDeliveryOtpMail, 
  sendSelfPickupOtpMail, 
  sendOrderCancelledMail, 
  sendRefundAddedMail, 
  sendWalletCreditedMail 
} from "../utils/mail.js";
import Wallet from "../models/wallet.model.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

let instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const placeOrder = async (req, res, next) => {
  try {
    const { 
      cartItems, 
      paymentMethod, 
      deliveryAddress, 
      totalAmount,
      orderType = "delivery",
      pickupTimeSlot,
      pickupCustomerName,
      pickupCustomerMobile,
      specialInstructions
    } = req.body;

    if (cartItems.length == 0 || !cartItems) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (orderType !== "selfPickup") {
      if (
        !deliveryAddress?.text ||
        !deliveryAddress.latitude ||
        !deliveryAddress.longitude
      ) {
        return res.status(400).json({ message: "Send complete deliveryAddress" });
      }
    }

    const groupItemsByShop = {};

    cartItems.forEach((item) => {
      const shopId = item.shop;
      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = [];
      }
      groupItemsByShop[shopId].push(item);
    });

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) {
          throw new Error("Shop not found");
        }
        if (!shop.owner) {
          throw new Error("Shop owner not found");
        }
        const items = groupItemsByShop[shopId];
        const subtotal = items.reduce(
          (sum, i) => sum + Number(i.price) * Number(i.quantity),
          0,
        );
        return {
          shop: shop._id,
          owner: shop.owner._id,
          subtotal,
          shopOrderItems: items.map((i) => ({
            item: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        };
      }),
    );

    const cancellationAllowedUntil = new Date(Date.now() + 120000); // 2 minutes
    let pickupOtp = null;
    if (orderType === "selfPickup") {
      pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
    }

    let walletPayAmount = 0;
    let onlinePayAmount = 0;

    if (paymentMethod === "wallet") {
      const wallet = await Wallet.findOne({ user: req.userId });
      if (!wallet || wallet.balance < totalAmount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      walletPayAmount = totalAmount;
    } else if (paymentMethod === "wallet_razorpay") {
      const wallet = await Wallet.findOne({ user: req.userId });
      const balance = wallet ? wallet.balance : 0;
      if (balance <= 0) {
        return res.status(400).json({ message: "No wallet balance available for partial payment" });
      }
      walletPayAmount = balance;
      onlinePayAmount = totalAmount - balance;
    } else if (paymentMethod === "pickup_advance") {
      onlinePayAmount = Math.round(totalAmount * 0.2);
    } else if (paymentMethod === "pickup_full" || paymentMethod === "online") {
      onlinePayAmount = totalAmount;
    }

    const isOnlinePay = onlinePayAmount > 0;

    if (isOnlinePay) {
      const razorpayOrder = await instance.orders.create({
        amount: Math.round(onlinePayAmount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      const newOrder = await Order.create({
        user: req.userId,
        paymentMethod,
        orderType,
        pickupTimeSlot,
        pickupCustomerName,
        pickupCustomerMobile,
        specialInstructions,
        pickupOtp,
        cancellationAllowedUntil,
        walletAmountPaid: walletPayAmount,
        onlineAmountPaid: onlinePayAmount,
        deliveryAddress: orderType === "selfPickup" ? undefined : deliveryAddress,
        totalAmount,
        shopOrders,
        razorpayOrderId: razorpayOrder.id,
        payment: false,
        status: "pending",
      });
      return res.status(200).json({
        razorpayOrder,
        orderId: newOrder._id,
      });
    }

    const isWalletFull = paymentMethod === "wallet";

    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      orderType,
      pickupTimeSlot,
      pickupCustomerName,
      pickupCustomerMobile,
      specialInstructions,
      pickupOtp,
      cancellationAllowedUntil,
      walletAmountPaid: walletPayAmount,
      onlineAmountPaid: 0,
      deliveryAddress: orderType === "selfPickup" ? undefined : deliveryAddress,
      totalAmount,
      shopOrders,
      payment: isWalletFull,
      status: "pending",
    });

    if (isWalletFull) {
      const wallet = await Wallet.findOne({ user: req.userId });
      wallet.balance -= walletPayAmount;
      wallet.transactions.push({
        type: "debit",
        amount: walletPayAmount,
        description: `Payment for Order #${String(newOrder._id).slice(-6).toUpperCase()}`,
        orderId: newOrder._id,
        status: "completed",
      });
      await wallet.save();
    }

    await newOrder.populate(
      "shopOrders.shopOrderItems.item",
      "name image price",
    );
    await newOrder.populate("shopOrders.shop", "name socketId");
    await newOrder.populate("shopOrders.owner", "name socketId");
    await newOrder.populate("user", "name email mobile");

    // Send OTP mail immediately if self-pickup & cash/wallet full
    if (orderType === "selfPickup") {
      const restaurantName = newOrder.shopOrders[0]?.shop?.name || "Fletto Partner";
      await sendSelfPickupOtpMail(newOrder.user, newOrder._id, restaurantName, pickupOtp);
    }

    const io = req.app.get("io");

    if (io) {
      newOrder.shopOrders.forEach((shopOrder) => {
        if (shopOrder.owner && shopOrder.owner._id) {
          io.to(shopOrder.owner._id.toString()).emit("newOrder", {
            _id: newOrder._id,
            paymentMethod: newOrder.paymentMethod,
            orderType: newOrder.orderType,
            user: newOrder.user,
            shopOrders: shopOrder,
            createdAt: newOrder.createdAt,
            deliveryAddress: newOrder.deliveryAddress,
            payment: newOrder.payment,
          });
        }
      });
    }
    return res.status(201).json(newOrder);
  } catch (error) {
    return next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;
    const payment = await instance.payments.fetch(razorpay_payment_id);
    if (!payment || payment.status != "captured") {
      return res.status(400).json({
        message: "payment not captured",
      });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({
        message: "order not found",
      });
    }

    order.payment = true;
    order.razorpayPaymentId = razorpay_payment_id;

    if (order.paymentMethod === "wallet_razorpay" && order.walletAmountPaid > 0) {
      const wallet = await Wallet.findOne({ user: order.user });
      if (wallet && wallet.balance >= order.walletAmountPaid) {
        wallet.balance -= order.walletAmountPaid;
        wallet.transactions.push({
          type: "debit",
          amount: order.walletAmountPaid,
          description: `Partial Wallet Payment for Order #${String(order._id).slice(-6).toUpperCase()}`,
          orderId: order._id,
          status: "completed",
        });
        await wallet.save();
      }
    }

    await order.save();

    await order.populate("shopOrders.shopOrderItems.item", "name image price");
    await order.populate("shopOrders.shop", "name socketId");
    await order.populate("shopOrders.owner", "name socketId");
    await order.populate("user", "name email mobile");

    // Send OTP mail since payment is confirmed
    if (order.orderType === "selfPickup" && order.pickupOtp) {
      const restaurantName = order.shopOrders[0]?.shop?.name || "Fletto Partner";
      await sendSelfPickupOtpMail(order.user, order._id, restaurantName, order.pickupOtp);
    }

    const io = req.app.get("io");

    if (io) {
      order.shopOrders.forEach((shopOrder) => {
        if (shopOrder.owner && shopOrder.owner._id) {
          io.to(shopOrder.owner._id.toString()).emit("newOrder", {
            _id: order._id,
            paymentMethod: order.paymentMethod,
            orderType: order.orderType,
            user: order.user,
            shopOrders: shopOrder,
            createdAt: order.createdAt,
            deliveryAddress: order.deliveryAddress,
            payment: order.payment,
          });
        }
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    return next(error);
  }
};

export const getMyOrder = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (user.role == "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .lean();

      return res.status(200).json(orders);
    } else if (user.role == "owner") {
      const orders = await Order.find({ 
        "shopOrders.owner": req.userId,
        status: { $ne: "cancelled" }
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")
        .lean();

      const filteredOrder = orders.map((order) => {
        const ownerShopOrder = order.shopOrders.find((o) => o.owner == req.userId || (o.owner && o.owner._id == req.userId));
        return {
          _id: order._id,
          paymentMethod: order.paymentMethod,
          orderType: order.orderType,
          user: order.user,
          shopOrders: ownerShopOrder,
          createdAt: order.createdAt,
          deliveryAddress: order.deliveryAddress,
          payment: order.payment,
          status: order.status,
          cancelReason: order.cancelReason,
          cancelReasonType: order.cancelReasonType,
          cancelledAt: order.cancelledAt,
          refundAmount: order.refundAmount,
          refundStatus: order.refundStatus,
          otpVerified: order.otpVerified,
          pickupTimeSlot: order.pickupTimeSlot,
        };
      });

      return res.status(200).json(filteredOrder);
    }
  } catch (error) {
    return next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;
    const order = await Order.findById(orderId);

    const shopOrder = order.shopOrders.find((o) => o.shop == shopId);
    if (!shopOrder) {
      return res.status(400).json({ message: "shop order not found" });
    }
    if (shopOrder.status === "delivered") {
      return res.status(400).json({
        message: "Delivered order status cannot be changed",
      });
    }

    shopOrder.status = status;
    if (status === "delivered") {
      shopOrder.deliveredAt = Date.now();
    }
    let deliveryBoysPayload = [];
    if (status == "out of delivery" && !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress;
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 5000,
          },
        },
      });
      const nearByIds = nearByDeliveryBoys.map((b) => b._id);
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map((id) => String(id)));

      const availableBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id)),
      );
      const candidates = availableBoys.map((b) => b._id);
      if (candidates.length == 0) {
        await order.save();
        return res.json({
          message: "order status updated but there is no available boys",
        });
      }

      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        broadcastedTo: candidates,
        status: "broadcasted",
      });

      shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo;
      shopOrder.assignment = deliveryAssignment._id;
      deliveryBoysPayload = availableBoys.map((b) => ({
        id: b._id,
        fullName: b.fullName,
        longitude: b.location.coordinates?.[0],
        latitude: b.location.coordinates?.[1],
        mobile: b.mobile,
      }));

      await deliveryAssignment.populate("order");
      await deliveryAssignment.populate("shop");

      const io = req.app.get("io");
      if (io) {
        availableBoys.forEach((boy) => {
          io.to(boy._id.toString()).emit("delivery:request", {
            sentTo: boy._id,
            assignmentId: deliveryAssignment._id,
            orderId: deliveryAssignment.order._id,
            shopName: deliveryAssignment.shop.name,
            deliveryAddress: deliveryAssignment.order.deliveryAddress,
            items:
              deliveryAssignment.order.shopOrders.find((so) =>
                so._id.equals(deliveryAssignment.shopOrderId),
              ).shopOrderItems || [],
            subtotal: deliveryAssignment.order.shopOrders.find((so) =>
              so._id.equals(deliveryAssignment.shopOrderId),
            ).subtotal,
          });
        });
      }
    }

    // await shopOrder.save();
    await order.save();
    const updatedShopOrder = order.shopOrders.find((o) => o.shop == shopId);

    await order.populate("shopOrders.shop", "name");
    await order.populate(
      "shopOrders.assignedDeliveryBoy",
      "fullName email mobile",
    );
    await order.populate("user", "socketId");

    const io = req.app.get("io");
    if (io) {
      const userRoom = order.user?._id ? order.user._id.toString() : null;
      const ownerRoom = updatedShopOrder.owner ? updatedShopOrder.owner.toString() : null;

      const emitToBoth = (eventName, payload) => {
        if (userRoom) io.to(userRoom).emit(eventName, payload);
        if (ownerRoom) io.to(ownerRoom).emit(eventName, payload);
      };

      if (updatedShopOrder.status === "preparing") {
        emitToBoth("orderAccepted", {
          orderId: order._id,
          shopId: updatedShopOrder.shop._id,
          deliveryBoy: updatedShopOrder.assignedDeliveryBoy,
        });
      } else if (updatedShopOrder.status === "out of delivery") {
        emitToBoth("readyForPickup", {
          orderId: order._id,
          shopId: updatedShopOrder.shop._id,
        });
      } else if (updatedShopOrder.status === "delivered") {
        emitToBoth("orderDelivered", {
          orderId: order._id,
          shopId: updatedShopOrder.shop._id,
          status: "delivered",
        });
      } else if (updatedShopOrder.status === "cancelled") {
        emitToBoth("orderCancelled", {
          orderId: order._id,
        });
      }
    }

    return res.status(200).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment?._id,
    });
  } catch (error) {
    return next(error);
  }
};

export const getDeliveryBoyAssingement = async (req, res, next) => {
  try {
    const deliveryBoyId = req.userId;
    const assignments = await DeliveryAssignment.find({
      broadcastedTo: deliveryBoyId,
      status: "broadcasted",
    })
      .populate("order")
      .populate("shop");

    const formated = assignments.map((a) => ({
      assignmentId: a._id,
      orderId: a.order._id,
      shopName: a.shop.name,
      userMobile: a.order.user?.mobile || a.order.user?.phone || "",
      deliveryAddress: a.order.deliveryAddress,
      items:
        a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
          .shopOrderItems || [],
      subtotal: a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
        .subtotal,
    }));

    return res.status(200).json(formated);
  } catch (error) {
    return next(error);
  }
};

export const acceptOrder = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(400).json({ message: "assignment not found" });
    }
    if (assignment.status != "broadcasted") {
      return res.status(400).json({ message: "assignment is expired" });
    }
    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["broadcasted", "completed"] },
    });
    if (alreadyAssigned) {
      return res
        .status(400)
        .json({ message: "You are already assigned to another order" });
    }
    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    const order = await Order.findById(assignment.order);
    if (!order) {
      return res.status(400).json({ message: "Order not found" });
    }

    const shopOrder = order.shopOrders.find(
      (so) => so.id == assignment.shopOrderId,
    );
    shopOrder.assignedDeliveryBoy = req.userId;
    await order.save();
    await order.populate("shopOrders.assignedDeliveryBoy");

    const populatedBoy = await User.findById(req.userId).select("fullName mobile email");
    const io = req.app.get("io");
    if (io) {
      // notify owner
      if (shopOrder.owner) {
        io.to(shopOrder.owner.toString()).emit("delivery:accepted", {
          orderId: order._id,
          shopId: shopOrder.shop,
          deliveryBoy: populatedBoy,
        });
      }
      
      // notify user
      if (order.user) {
        io.to(order.user.toString()).emit("delivery:accepted", {
          orderId: order._id,
          shopId: shopOrder.shop,
          deliveryBoy: populatedBoy,
        });
      }
    }

    return res.status(200).json({
      message: "Order Accepted",
    });
  } catch (error) {
    return next(error);
  }
};

export const rejectOrder = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(400).json({ message: "Assignment not found" });
    }
    assignment.broadcastedTo = assignment.broadcastedTo.filter(
      (id) => id.toString() !== req.userId.toString()
    );
    await assignment.save();
    return res.status(200).json({
      message: "Order Rejected successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const getCurrentOrder = async (req, res, next) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned",
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName email mobile location")
      .populate({
        path: "order",
        populate: [{ path: "user", select: "fullName email mobile location" }],
      });

    if (!assignment) {
      return res.status(200).json(null);
    }
    if (!assignment.order) {
      return res.status(200).json(null);
    }

    const shopOrder = assignment.order.shopOrders.find(
      (so) => String(so._id) == String(assignment.shopOrderId),
    );

    if (!shopOrder) {
      return res.status(200).json(null);
    }
    let deliveryBoyLocation = { lat: null, lon: null };
    if (assignment.assignedTo.location.coordinates.length == 2) {
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
      deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0];
    }

    let customerLocation = { lat: null, lon: null };
    if (assignment.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
      customerLocation.lon = assignment.order.deliveryAddress.longitude;
    }

    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
    });
  } catch (error) {
    return next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "shopOrders.shop",
        model: "Shop",
      })
      .populate({
        path: "shopOrders.assignedDeliveryBoy",
        model: "User",
      })
      .populate({
        path: "shopOrders.shopOrderItems.item",
        model: "Item",
      })
      .lean();

    if (!order) {
      return res.status(400).json({ message: "order not found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    return next(error);
  }
};

export const sendOtpByDeliveryBoy = async (req, res, next) => {
  try {
    const { orderId, shopOrderId } = req.body;

    if (!orderId || !shopOrderId) {
      return res
        .status(400)
        .json({ message: "orderId and shopOrderId required" });
    }

    const order = await Order.findById(orderId)
      .populate("user", "email socketId")
      .populate("shopOrders.shop", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await order.save();

    // 📧 email (safe)
    try {
      await sendDeliveryOtpMail(order.user, order._id, shopOrder.shop?.name || "", otp);
    } catch (e) {
      
    }

    // 🔔 socket (optional)
    const io = req.app.get("io");
    if (io && order.user?._id) {
      io.to(order.user._id.toString()).emit("delivery:otp", { otp });
    }

    return res.status(200).json({
      message: "Delivery OTP sent successfully",
    });
  } catch (error) {
    
    return next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) {
      return res.status(400).json({ message: "Enter valid order/shopOrderid" });
    }
    if (
      shopOrder.deliveryOtp !== otp ||
      !shopOrder.otpExpires ||
      shopOrder.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid/Expire OTP" });
    }
    shopOrder.status = "delivered";
    shopOrder.deliveredAt = Date.now();

    // Credit Delivery Boy Wallet Commission (4.5% of shop order subtotal)
    if (shopOrder.assignedDeliveryBoy) {
      const dbIncome = Math.round(Number(shopOrder.subtotal || 0) * 0.045);
      if (dbIncome > 0) {
        let dbWallet = await Wallet.findOne({ user: shopOrder.assignedDeliveryBoy });
        if (!dbWallet) {
          dbWallet = await Wallet.create({ user: shopOrder.assignedDeliveryBoy, balance: 0, transactions: [] });
        }
        dbWallet.balance += dbIncome;
        dbWallet.transactions.push({
          type: "credit",
          amount: dbIncome,
          description: `Delivery Earnings for Order #${String(order._id).slice(-6).toUpperCase()}`,
          orderId: order._id,
          status: "completed",
        });
        await dbWallet.save();
      }
    }

    await order.save();

    // 🔔 REAL-TIME UPDATE TO OWNER & USER
    const io = req.app.get("io");

    if (io) {
      // notify user
      if (order.user?._id) {
        io.to(order.user._id.toString()).emit("orderDelivered", {
          orderId: order._id,
          shopId: shopOrder.shop,
          status: "delivered",
          userId: order.user._id,
        });
      }

      // notify owner
      if (shopOrder.owner) {
        const ownerId = shopOrder.owner._id ? shopOrder.owner._id.toString() : shopOrder.owner.toString();
        io.to(ownerId).emit("orderDelivered", {
          orderId: order._id,
          shopId: shopOrder.shop,
          status: "delivered",
          userId: ownerId,
        });
      }
    }

    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      assignedTo: shopOrder.assignedDeliveryBoy,
    });

    return res.status(200).json({ message: "Order Delivered Successfully" });
  } catch (error) {
    return next(error);
  }
};

export const getTodayDelivery = async (req, res, next) => {
  try {
    const deliveryBoyId = req.userId;
    const startsofDay = new Date();
    startsofDay.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      "shopOrders.assignedDeliveryBoy": deliveryBoyId,
      "shopOrders.status": "delivered",
      "shopOrders.deliveredAt": { $gte: startsofDay },
    }).lean();

    let todaysDeliveries = [];

    orders.forEach((order) => {
      order.shopOrders.forEach((shopOrder) => {
        if (
          shopOrder.assignedDeliveryBoy &&
          shopOrder.assignedDeliveryBoy.toString() === deliveryBoyId.toString() &&
          shopOrder.status === "delivered" &&
          shopOrder.deliveredAt &&
          shopOrder.deliveredAt >= startsofDay
        ) {
          todaysDeliveries.push(shopOrder);
        }
      });
    });

    // Create 12 blocks of 2-hour intervals for a full daily graph
    let intervals = Array.from({ length: 12 }, (_, i) => {
      const startHour = i * 2;
      const endHour = startHour + 2;
      const label = `${String(startHour).padStart(2, "0")}:00 - ${String(endHour).padStart(2, "0")}:00`;
      return {
        label,
        count: 0,
        collection: 0,
        earnings: 0,
      };
    });

    todaysDeliveries.forEach((shopOrder) => {
      const hour = new Date(shopOrder.deliveredAt).getHours();
      const intervalIndex = Math.floor(hour / 2);
      if (intervalIndex >= 0 && intervalIndex < 12) {
        intervals[intervalIndex].count += 1;
        intervals[intervalIndex].collection += Math.round(shopOrder.subtotal || 0);
        intervals[intervalIndex].earnings += Math.round((shopOrder.subtotal || 0) * 0.045);
      }
    });

    return res.status(200).json(intervals);
  } catch (error) {
    return next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { orderId, cancelReasonType, cancelReason } = req.body;
    const order = await Order.findById(orderId).populate("user").populate("shopOrders.shop");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    if (order.status === "delivered") {
      return res.status(400).json({ message: "Delivered orders cannot be cancelled" });
    }

    if (order.status === "out of delivery" || order.shopOrders.some(so => so.status === "out of delivery")) {
      return res.status(400).json({ message: "Orders out for delivery cannot be cancelled" });
    }

    // Check cancellation window (2 minutes)
    if (order.cancellationAllowedUntil && new Date() > new Date(order.cancellationAllowedUntil)) {
      return res.status(400).json({ message: "Cancellation window has expired (2 minutes limit)" });
    }

    // Cancel order
    order.status = "cancelled";
    order.cancelReasonType = cancelReasonType;
    order.cancelReason = cancelReason || cancelReasonType;
    order.cancelledAt = new Date();

    // Cancel all sub-shopOrders
    order.shopOrders.forEach((so) => {
      so.status = "cancelled";
    });

    // Refund System (Prepaid refundable methods: online, pickup_advance, pickup_full, wallet, wallet_razorpay)
    const prepaidMethods = ["online", "pickup_advance", "pickup_full", "wallet", "wallet_razorpay"];
    let refundAmount = 0;

    if (order.payment && prepaidMethods.includes(order.paymentMethod)) {
      if (order.paymentMethod === "pickup_advance") {
        // Refund 20% advance
        refundAmount = Math.round(order.totalAmount * 0.2);
      } else {
        // Refund full amount
        refundAmount = order.totalAmount;
      }
    }

    if (refundAmount > 0) {
      let wallet = await Wallet.findOne({ user: order.user._id });
      if (!wallet) {
        wallet = await Wallet.create({ user: order.user._id, balance: 0, transactions: [] });
      }
      wallet.balance += refundAmount;
      wallet.transactions.push({
        type: "credit",
        amount: refundAmount,
        description: "Order Cancellation Refund",
        orderId: order._id,
        status: "completed",
      });
      await wallet.save();

      order.refundAmount = refundAmount;
      order.refundStatus = "processed";
      order.refundProcessedAt = new Date();
    }

    await order.save();

    // Send emails (Order Cancelled, Refund Added, Wallet Credited)
    const user = order.user;
    const reasonDisplay = cancelReason || cancelReasonType;
    await sendOrderCancelledMail(user, order._id, reasonDisplay);

    if (refundAmount > 0) {
      let wallet = await Wallet.findOne({ user: order.user._id });
      await sendRefundAddedMail(user, order._id, refundAmount, wallet.balance);
      await sendWalletCreditedMail(user, refundAmount, "Order Cancellation Refund", wallet.balance);
    }

    // Emit Socket events (orderCancelled, walletUpdated)
    const io = req.app.get("io");
    if (io) {
      io.to(order.user._id.toString()).emit("orderCancelled", {
        orderId: order._id,
        status: "cancelled",
        refundAmount,
      });

      if (refundAmount > 0) {
        let wallet = await Wallet.findOne({ user: order.user._id });
        io.to(order.user._id.toString()).emit("walletUpdated", {
          balance: wallet.balance,
        });
      }

      order.shopOrders.forEach((so) => {
        if (so.owner) {
          io.to(so.owner.toString()).emit("orderCancelled", {
            orderId: order._id,
            status: "cancelled",
          });
        }
      });
    }

    return res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyPickupOTP = async (req, res, next) => {
  try {
    const { orderId, otp } = req.body;
    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.pickupOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    order.otpVerified = true;
    await order.save();

    // Socket notify user
    const io = req.app.get("io");
    if (io && order.user?._id) {
      io.to(order.user._id.toString()).emit("readyForPickup", {
        orderId: order._id,
      });
    }

    return res.status(200).json({
      message: "OTP Verified Successfully",
      order,
    });
  } catch (error) {
    return next(error);
  }
};

export const returnOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate("user").populate("shopOrders.shop");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user._id.toString() !== req.userId) {
      return res.status(401).json({ message: "Unauthorized return request" });
    }

    if (order.orderType !== "delivery") {
      return res.status(400).json({ message: "Returns are only applicable for Home Delivery orders" });
    }

    const firstShopOrder = order.shopOrders[0];
    if (!firstShopOrder || (order.status !== "delivered" && firstShopOrder.status !== "delivered")) {
      return res.status(400).json({ message: "Only completed/delivered orders can be returned" });
    }

    if (!firstShopOrder.deliveredAt) {
      return res.status(400).json({ message: "Delivery timestamp not found. Cannot process return." });
    }

    const deliveredAtTime = new Date(firstShopOrder.deliveredAt).getTime();
    const currentTime = Date.now();
    const elapsedMinutes = (currentTime - deliveredAtTime) / (1000 * 60);

    if (elapsedMinutes > 30) {
      return res.status(400).json({ message: "Return window has expired (30 minutes limit from delivery)" });
    }

    order.status = "returned";
    order.shopOrders.forEach((so) => {
      so.status = "returned";
    });

    const refundAmount = order.totalAmount || 0;
    let wallet = await Wallet.findOne({ user: order.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: order.user._id, balance: 0, transactions: [] });
    }
    wallet.balance += refundAmount;
    wallet.transactions.push({
      type: "credit",
      amount: refundAmount,
      description: `Refund for Returned Order #${String(order._id).slice(-8).toUpperCase()}`,
      orderId: order._id,
      status: "completed",
    });
    await wallet.save();

    order.refundAmount = (order.refundAmount || 0) + refundAmount;
    order.refundStatus = "processed";
    order.refundProcessedAt = new Date();

    await order.save();

    const io = req.app.get("io");
    if (io) {
      const userRoom = order.user._id.toString();
      io.to(userRoom).emit("orderReturned", {
        orderId: order._id,
        status: "returned",
        refundAmount,
      });
      io.to(userRoom).emit("walletUpdated", {
        balance: wallet.balance,
      });

      order.shopOrders.forEach((so) => {
        if (so.owner) {
          io.to(so.owner.toString()).emit("orderReturned", {
            orderId: order._id,
            status: "returned",
          });
        }
      });
    }

    return res.status(200).json({
      message: "Order returned successfully",
      order,
    });
  } catch (error) {
    return next(error);
  }
};
