import express from "express";
import {
  getCurrentUser,
  updateUserLocation,
  updateFcmToken,
} from "../controllers/user.controller.js";
import isAuth from "../middleware/isAuth.js";

const userRouter = express.Router();

//user router
userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post("/update-location", isAuth, updateUserLocation);
userRouter.post("/fcm-token", isAuth, updateFcmToken);

export default userRouter;
