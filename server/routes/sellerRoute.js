import express from "express";
import {
  registerSeller,
  loginSeller,
  logoutSeller,
  getSellerProfile,
  updateSellerProfile,
} from "../controllers/sellerController.js";
import { sellerAuth } from "../middleware/sellerAuth.js";

const sellerRouter = express.Router();

// Public routes
sellerRouter.post("/register", registerSeller);
sellerRouter.post("/login", loginSeller);
sellerRouter.post("/logout", logoutSeller);

// Protected routes
sellerRouter.get("/profile", sellerAuth, getSellerProfile);
sellerRouter.put("/profile", sellerAuth, updateSellerProfile);

export default sellerRouter;
