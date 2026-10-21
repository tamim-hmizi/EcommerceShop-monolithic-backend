import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Import your route files
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

// Error middleware
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

// metrics
import metricsMiddleware from "./middleware/metricsMiddleware.js";
import metricsRoute from "./routes/metricsRoute.js";

// ES module path fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Init Express app
const app = express();

// Trust proxy (for production rate-limiting, etc.)
app.set("trust proxy", 1);

// Allowed frontend origins (for CORS)
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://omhy.dc2.cloudapp.xpressazure.com",
];

// CORS middleware
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true); // allow requests with no origin (like curl or SSR)
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin); // return exact origin string
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true, // the frontend sends requests with credentials enabled
};

// Middleware stack
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(metricsMiddleware);
app.use(cors(corsOptions)); // Apply CORS

// Serve static files (uploads) with CORS
app.use(
  "/uploads",
  cors(corsOptions),
  express.static(path.join(__dirname, "uploads"))
);

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
});
app.use(limiter);

// Logging in development
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// API Routes
app.use(metricsRoute);
app.use("/api", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api", favoriteRoutes);
app.use("/api", cartRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
