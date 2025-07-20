import express from "express";
import {
  placeOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  cancelOrder,
  getOrderStats,
} from "../controllers/orderController.js";
import { auth } from "../middleware/auth.js";
import { sellerAuth } from "../middleware/sellerAuth.js";

const orderRouter = express.Router();

// User routes (require user authentication)
orderRouter.post("/", auth, placeOrder);
orderRouter.get("/", auth, getUserOrders);
orderRouter.get("/:id", auth, getOrder);
orderRouter.put("/:id/cancel", auth, cancelOrder);

// Seller routes (require seller authentication)
orderRouter.put("/:id/status", sellerAuth, updateOrderStatus);
orderRouter.get("/seller/orders", sellerAuth, getAllOrders);
orderRouter.get("/seller/stats", sellerAuth, getOrderStats);

export default orderRouter;
