import User from "../models/user.model.js";

export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "UserId is not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

export const updateUserLocation = async (req, res, next) => {
  try {
    const { lat, lon } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        location: {
          type: "Point",
          coordinates: [lon, lat],
        },
      },
      { new: true }
    );
    if (!user) {
      return res.status(400).json({ message: "User is not found" });
    }
    return res.status(200).json({ message: "location updated" });
  } catch (error) {
    return next(error);
  }
};

export const updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { fcmToken },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "FCM token updated successfully" });
  } catch (error) {
    return next(error);
  }
};
