import express from "express";
import {
  addItem,
  deleteItem,
  editItem,
  getItemByCity,
  getItemById,
  getItemsByShop,
  rating,
  searchItem,
} from "../controllers/items.controller.js";
import isAuth from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";

const itemRouter = express.Router();

//shop router
itemRouter.post("/add-items", isAuth, upload.single("image"), addItem);
itemRouter.post(
  "/edit-items/:itemId",
  isAuth,
  upload.single("image"),
  editItem,
);
itemRouter.get("/get-by-id/:itemId", isAuth, getItemById);
itemRouter.get("/delete/:itemId", isAuth, deleteItem);
itemRouter.get("/get-by-city/:city", isAuth, getItemByCity);
itemRouter.get("/get-by-shop/:shopId", isAuth, getItemsByShop);
itemRouter.get("/search-items", isAuth, searchItem);
itemRouter.post("/rating-items", isAuth, rating);

export default itemRouter;
