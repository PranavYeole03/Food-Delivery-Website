import Wallet from "../models/wallet.model.js";

export const getMyWallet = async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ user: req.userId });
    if (!wallet) {
      // Lazy initialization of wallet
      wallet = await Wallet.create({ user: req.userId, balance: 0, transactions: [] });
    }
    return res.status(200).json(wallet);
  } catch (error) {
    return next(error);
  }
};
