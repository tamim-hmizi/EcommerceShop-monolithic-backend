import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

// ES module path fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env variables
dotenv.config();

// Init Express
const app = express();

// Connect to DB
connectDB();

// Set trust proxy (for rate limiting, etc.)
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

// CORS setup
const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Static files (images) with manual CORS header for uploads
app.use(
  "/api/uploads",
  (req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: "Too many requests from this IP, please try again later",
});
app.use(limiter);

// Logger in dev mode
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api", favoriteRoutes);
app.use("/api", cartRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
