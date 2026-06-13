import express from "express";
import isAuth from "../middleware/isAuth.js";
import { getMyWallet } from "../controllers/wallet.controller.js";

const walletRouter = express.Router();

walletRouter.get("/my-wallet", isAuth, getMyWallet);

export default walletRouter;
