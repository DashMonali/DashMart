import express from "express";
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleStock,
  getSellerProducts,
} from "../controllers/productController.js";
import { auth } from "../middleware/auth.js";
import { sellerAuth } from "../middleware/sellerAuth.js";

const productRouter = express.Router();

// Public routes
productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProduct);

// Seller-only routes (require seller authentication)
productRouter.post("/", sellerAuth, createProduct);
productRouter.put("/:id", sellerAuth, updateProduct);
productRouter.delete("/:id", sellerAuth, deleteProduct);
productRouter.put("/:id/stock", sellerAuth, toggleStock);
productRouter.get("/seller/products", sellerAuth, getSellerProducts);

export default productRouter;
