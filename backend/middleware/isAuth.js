import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token || authHeader.split(" ").length !== 2) {
      return {
        error: "Invalid authorization format. Use: Authorization: Bearer <token>",
      };
    }

    return { token };
  }

  if (req.cookies?.token) {
    return { token: req.cookies.token };
  }

  return { error: "Authorization token is missing" };
};

const isAuth = async (req, res, next) => {
  try {
    const { token, error } = getTokenFromRequest(req);

    if (error) {
      return res.status(401).json({ message: error });
    }

    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodeToken?.userId) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    const user = await User.findById(decodeToken.userId).select("_id");
    if (!user) {
      return res.status(401).json({ message: "Authenticated user no longer exists" });
    }

    req.userId = decodeToken.userId;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please sign in again." });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    return next(error);
  }
};

export default isAuth;
