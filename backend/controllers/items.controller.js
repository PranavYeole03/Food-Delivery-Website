import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res, next) => {
  try {
    const { name, category, foodType, price } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(400).json({ message: "Shop not found" });
    }
    const item = await Item.create({
      name,
      category,
      foodType,
      price,
      image,
      shop: shop._id,
    });
    shop.items.push(item._id);
    await shop.save();
    await shop.populate("owner");
    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    return res.status(201).json(shop);
  } catch (error) {
    return next(error);
  }
};

export const editItem = async (req, res, next) => {
  try {
    const itemId = req.params.itemId;
    const { name, category, foodType, price } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    const updateData = {
      name,
      category,
      foodType,
      price,
    };

    if (image) {
      updateData.image = image;
    }

    const item = await Item.findByIdAndUpdate(
      itemId,
      updateData,
      { new: true },
    );
    if (!item) {
      return res.status(400).json({ message: "Item not found" });
    }
    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    return res.status(200).json(shop);
  } catch (error) {
    return next(error);
  }
};

export const getItemById = async (req, res, next) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.status(200).json(item);
  } catch (error) {
    return next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    const shop = await Shop.findOne({ owner: req.userId });
    shop.items = shop.items.filter((i) => i !== item._id);
    await shop.save();
    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    return res.status(200).json(shop);
  } catch (error) {
    return next(error);
  }
};

export const getItemByCity = async (req, res, next) => {
  try {
    const { city } = req.params;
    if (!city) {
      return res.status(400).json({ message: "city is required" });
    }
    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items").lean();
    if (!shops) {
      return res.status(400).json({ message: "Shop no found" });
    }
    const shopIds = shops.map((shop) => shop._id);
    const items = await Item.find({ shop: { $in: shopIds } }).lean();
    return res.status(200).json(items);
  } catch (error) {
    return next(error);
  }
};

export const getItemsByShop = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const shop = await Shop.findById(shopId).populate("items").lean();
    if (!shop) {
      return res.status(400).json({ message: "Shop not found" });
    }
    return res.status(200).json({
      shop,
      items: shop.items,
    });
  } catch (error) {
    return next(error);
  }
};

export const searchItem = async (req, res, next) => {
  try {
    const { query, city } = req.query;
    if (!query || !city) {
      return null;
    }
    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items").lean();
    if (!shops) {
      return res.status(400).json({ message: "Shop no found" });
    }
    const shopIds = shops.map((s) => s._id);
    const items = await Item.find({
      shop: { $in: shopIds },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    }).populate("shop", "name image").lean();

    return res.status(200).json(items);
  } catch (error) {
    return next(error);
  }
};

export const rating = async (req, res, next) => {
  try {
    const { itemId, rating } = req.body;
    if (!itemId || !rating) {
      return res.status(400).json({ message: "itemId and rating is required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "rating must be between 1 to 5" });
    }
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }
    const newCount = item.rating.count + 1;
    const newAverage =
      (item.rating.average * item.rating.count + rating) / newCount;
    item.rating.count = newCount;
    item.rating.average = newAverage;

    await item.save();

    return res.status(200).json({ rating: item.rating });
  } catch (error) {
    return next(error);
  }
};
