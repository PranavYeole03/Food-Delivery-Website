import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import userRouter from "./routes/user.route.js";
import shopRouter from "./routes/shop.route.js";
import itemRouter from "./routes/item.route.js";
import orderRouter from "./routes/order.route.js";
import walletRouter from "./routes/wallet.route.js";
import http from "http";
import { Server } from "socket.io";
import { socketHandler } from "./socket.js";
import analyticsRouter from "./routes/analytics.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import compression from "compression";

const app = express();
app.use(compression());
const server = http.createServer(app);
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_PRODUCTION,
  "http://localhost:5173",
<<<<<<< HEAD
  "http://localhost:4173"
=======
>>>>>>> 1eae48dfb9d1547c20508fa3d270935546f65fe3
]
  .map((origin) => origin?.trim())
  .filter(Boolean);

// const corsOptions = {
//   origin(origin, callback) {
//     // Allow non-browser tools and our configured frontend origins.
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//       return;
//     }

//     callback(new Error(`CORS blocked for origin: ${origin}`));
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   optionsSuccessStatus: 204,
// };

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowed = [
      "http://localhost:5173",
      "http://localhost:4173",
      process.env.FRONTEND_URL,
      process.env.FRONTEND_URL_PRODUCTION,
    ].filter(Boolean);

    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // 🔥 TEMP: allow all for debug
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};
const io = new Server(server, {
  cors: {
    ...corsOptions,
    methods: ["GET", "POST"],
  },
});

app.set("io", io)



const port = process.env.PORT || 5000;

app.use(
  cors(corsOptions),
);
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/analytics", analyticsRouter);

// Centralized error handler
app.use(errorHandler);

socketHandler(io)

server.listen(port, () => {
  connectDB();

});
