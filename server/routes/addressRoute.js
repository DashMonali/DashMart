import express from "express";
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js";
import { auth } from "../middleware/auth.js";

const addressRouter = express.Router();

// All address routes require authentication
addressRouter.use(auth);

addressRouter.get("/", getUserAddresses);
addressRouter.post("/", addAddress);
addressRouter.put("/:id", updateAddress);
addressRouter.delete("/:id", deleteAddress);
addressRouter.put("/:id/default", setDefaultAddress);

export default addressRouter;
