import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
} from "../controllers/cartController.js";
import { auth } from "../middleware/auth.js";

const cartRouter = express.Router();

// All cart routes require authentication
cartRouter.use(auth);

cartRouter.get("/", getCart);
cartRouter.post("/add", addToCart);
cartRouter.put("/update", updateCartItem);
cartRouter.delete("/remove/:productId", removeFromCart);
cartRouter.delete("/clear", clearCart);
cartRouter.get("/count", getCartCount);

export default cartRouter;
