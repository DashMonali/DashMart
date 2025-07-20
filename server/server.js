import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./configs/db.js";
import { configureCloudinary } from "./configs/cloudinary.js";

// Routes
import userRoute from "./routes/userRoute.js";
import productRoute from "./routes/productRoute.js";
import cartRoute from "./routes/cartRoute.js";
import orderRoute from "./routes/orderRoute.js";
import addressRoute from "./routes/addressRoute.js";
import sellerRoute from "./routes/sellerRoute.js";
import uploadRoute from "./routes/uploadRoute.js";

// Load environment variables first
dotenv.config();

// Configure Cloudinary after environment variables are loaded
configureCloudinary();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "https://dash-mart.vercel.app",
      "https://dashmart.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Serve static files
app.use("/static", express.static("public"));

// Connect to database
connectDB();

// Routes
app.use("/api/user", userRoute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/addresses", addressRoute);
app.use("/api/seller", sellerRoute);
app.use("/api/upload", uploadRoute);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "DashMart API is running" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});
