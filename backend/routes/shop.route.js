import express from "express";
import isAuth from "../middleware/isAuth.js";
import { createEditShop, getMyShop, getShopCity } from "../controllers/shop.controller.js";
import { upload } from "../middleware/multer.js";

const shopRouter = express.Router();

//shop router
shopRouter.post("/create-edit", isAuth,upload.single("image"), createEditShop);
shopRouter.get("/get-myshop",isAuth,getMyShop)
shopRouter.get("/get-by/city/:city",isAuth,getShopCity)


export default shopRouter;
