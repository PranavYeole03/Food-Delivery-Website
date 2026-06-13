import Order from "../models/order.model.js";
import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";

const ownerAnalyticsCache = {};

export const getOwnerAnalytics = async (req, res, next) => {
  try {
    const ownerId = req.userId;
    const cacheKey = ownerId.toString();
    const cached = ownerAnalyticsCache[cacheKey];

    if (cached && Date.now() - cached.timestamp < 30000) {
      return res.status(200).json(cached.data);
    }
    const currentMonth = new Date().getMonth();

    const monthlyItemMap = {};
    const itemMap = {};
    const monthlyMap = {};
    const weeklyMap = {};

    const shop = await Shop.findOne({ owner: ownerId }).lean();
    if (!shop) {
      return res.status(400).json({ message: "Shop not found" });
    }

    const orders = await Order.find({
      "shopOrders.owner": ownerId,
    }).lean();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let todayOrders = 0;
    let todayRevenue = 0;

    let totalOrders = 0;
    let completedOrders = 0;
    let pendingOrders = 0;
    let totalRevenue = 0;

    orders.forEach((order) => {
      order.shopOrders.forEach((so) => {
        if (String(so.owner) !== String(ownerId)) return;

        totalOrders++;

        const isDelivered = so.status === "delivered";

        if (isDelivered) {
          completedOrders++;
          totalRevenue += so.subtotal;
        } else {
          pendingOrders++;
        }

        // TODAY
        if (order.createdAt >= startOfDay && isDelivered) {
          todayOrders++;
          todayRevenue += so.subtotal;
        }

        // MONTHLY + WEEKLY ONLY DELIVERED ✅
        if (isDelivered) {
          const month = new Date(order.createdAt).toLocaleString("default", {
            month: "short",
          });

          monthlyMap[month] = (monthlyMap[month] || 0) + so.subtotal;

          const day = new Date(order.createdAt).toLocaleDateString("en-IN", {
            weekday: "short",
          });

          weeklyMap[day] = (weeklyMap[day] || 0) + so.subtotal;
        }

        const orderMonth = new Date(order.createdAt).getMonth();

        so.shopOrderItems.forEach((item) => {
          // ALL TIME
          if (!itemMap[item.name]) {
            itemMap[item.name] = {
              name: item.name,
              quantity: 0,
              revenue: 0,
              foodType: item.foodType || null,
            };
          }

          itemMap[item.name].quantity += item.quantity;
          itemMap[item.name].revenue += item.price * item.quantity;

          // MONTHLY ITEMS
          if (orderMonth === currentMonth) {
            if (!monthlyItemMap[item.name]) {
              monthlyItemMap[item.name] = {
                name: item.name,
                quantity: 0,
                revenue: 0,
                foodType: item.foodType || null,
              };
            }

            monthlyItemMap[item.name].quantity += item.quantity;
            monthlyItemMap[item.name].revenue += item.price * item.quantity;
          }
        });
      });
    });

    const topItems = Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const topItemsMonthly = Object.values(monthlyItemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const topRatedItems = await Item.find({ shop: shop._id })
      .sort({ "rating.average": -1 })
      .limit(5)
      .select("name rating price image")
      .lean();

    const responseData = {
      success: true,

      stats: {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue,
      },

      today: {
        orders: todayOrders,
        revenue: todayRevenue,
      },

      monthlyRevenue: {
        labels: Object.keys(monthlyMap),
        data: Object.values(monthlyMap),
      },

      weeklyRevenue: {
        labels: Object.keys(weeklyMap),
        data: Object.values(weeklyMap),
      },

      topItems,
      topItemsMonthly,
      topRatedItems,
    };

    ownerAnalyticsCache[cacheKey] = {
      data: responseData,
      timestamp: Date.now(),
    };

    return res.status(200).json(responseData);
  } catch (error) {
    
    return next(error);
  }
};